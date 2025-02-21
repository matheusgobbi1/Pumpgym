import {
  OnboardingData,
  TrainingExperience,
  TrainingStyle,
  TrainingGoals,
} from "../contexts/OnboardingContext";
import {
  ExerciseData,
  getExercisesForLevel,
  getCompoundExercises,
  getIsolationExercises,
} from "./exerciseDatabase";
import { ExerciseLevel } from "./exerciseDatabase";
import {
  PROGRESSION_STRATEGY,
  adjustWorkoutForFatigue,
  calculateTargetFatigue,
  calculateFatigueIndex,
  MUSCLE_RECOVERY_TIME,
} from "./progression";
import {
  WorkoutParams,
  ValidationResult,
  ValidationIssue,
  MuscleGroup,
  GoalConfig,
  WorkoutError,
  VolumeDistribution,
} from "../types/training";
import { validateWorkoutParams } from "../utils/validation";
import { logWorkoutGeneration } from "../utils/logger";
import { exerciseCache } from "./exerciseCache";
import { TRAINING_CONSTANTS } from "../constants/training";
import { calculateWorkoutVolume } from "../utils/workoutCalculations";
import { adjustWorkoutBasedOnErrors } from "../utils/workoutAdjustments";

export type Exercise = {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string; // "12-15" ou "8-12" por exemplo
  restTime: number; // em segundos
  technique?: string; // drop-set, super-set, etc
  compound: boolean; // Adicionada propriedade compound
};

export type WorkoutDay = {
  id: string;
  name: string;
  exercises: Exercise[];
  estimatedTime: number; // em minutos
  focusArea: string; // "Full Body", "Upper", "Lower", etc
};

export type TrainingProgram = {
  id: string;
  name: string;
  level: TrainingExperience;
  style: TrainingStyle;
  workoutDays: WorkoutDay[];
  frequency: number; // treinos por semana
  restDays: number[];
  createdAt: Date;
};

// Configurações mais detalhadas por nível de experiência
const EXPERIENCE_CONFIG = {
  none: {
    setsPerExercise: 2,
    exercisesPerMuscle: 1,
    restTime: 90,
    reps: "12-15",
    complexityLimit: 2, // 1-5 escala de complexidade dos exercícios
    weeklyProgression: 5, // % de aumento semanal permitido
  },
  beginner: {
    setsPerExercise: 3,
    exercisesPerMuscle: 2,
    restTime: 75,
    reps: "10-12",
    complexityLimit: 3,
    weeklyProgression: 10,
  },
  intermediate: {
    setsPerExercise: 4,
    exercisesPerMuscle: 3,
    restTime: 60,
    reps: "8-12",
    complexityLimit: 4,
    weeklyProgression: 7.5,
  },
  advanced: {
    setsPerExercise: 4,
    exercisesPerMuscle: 4,
    restTime: 45,
    reps: "6-12",
    complexityLimit: 5,
    weeklyProgression: 5,
  },
};

// Configurações específicas por objetivo
const GOALS_CONFIG: Record<
  TrainingGoals,
  {
    setsMultiplier: number;
    restTimeMultiplier: number;
    repsAdjustment: string;
    compoundFocus: number;
    volumeDistribution: VolumeDistribution;
  }
> = {
  strength: {
    setsMultiplier: 1.2,
    restTimeMultiplier: 1.5,
    repsAdjustment: "4-6",
    compoundFocus: 0.8,
    volumeDistribution: "ascending",
  },
  hypertrophy: {
    setsMultiplier: 1.1,
    restTimeMultiplier: 1,
    repsAdjustment: "8-12",
    compoundFocus: 0.6,
    volumeDistribution: "balanced" as const,
  },
  endurance: {
    setsMultiplier: 0.8,
    restTimeMultiplier: 0.7,
    repsAdjustment: "15-20",
    compoundFocus: 0.5,
    volumeDistribution: "descending" as const,
  },
  weight_loss: {
    setsMultiplier: 1,
    restTimeMultiplier: 0.8,
    repsAdjustment: "12-15",
    compoundFocus: 0.7,
    volumeDistribution: "balanced" as const,
  },
  general_fitness: {
    setsMultiplier: 1,
    restTimeMultiplier: 1,
    repsAdjustment: "10-15",
    compoundFocus: 0.6,
    volumeDistribution: "balanced" as const,
  },
};

// Ajustes baseados na frequência de treino anterior
const FREQUENCY_ADJUSTMENTS = {
  sedentary: {
    volumeMultiplier: 0.7,
    intensityMultiplier: 0.6,
    restMultiplier: 1.3,
    adaptationWeeks: 4,
  },
  light: {
    volumeMultiplier: 0.8,
    intensityMultiplier: 0.8,
    restMultiplier: 1.2,
    adaptationWeeks: 3,
  },
  moderate: {
    volumeMultiplier: 1,
    intensityMultiplier: 1,
    restMultiplier: 1,
    adaptationWeeks: 2,
  },
  heavy: {
    volumeMultiplier: 1.1,
    intensityMultiplier: 1.1,
    restMultiplier: 0.9,
    adaptationWeeks: 1,
  },
  athlete: {
    volumeMultiplier: 1.2,
    intensityMultiplier: 1.2,
    restMultiplier: 0.8,
    adaptationWeeks: 0,
  },
};

// Tamanho relativo dos grupos musculares (1-10)
const MUSCLE_SIZE = {
  legs: 10,
  back: 9,
  chest: 8,
  shoulders: 6,
  biceps: 4,
  triceps: 4,
  core: 5,
} as const;

// Ordem ideal dos exercícios baseada no tamanho do músculo e tipo
function optimizeExerciseOrder(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => {
    // Primeiro critério: Compostos antes de isolados
    if (a.compound && !b.compound) return -1;
    if (!a.compound && b.compound) return 1;

    // Segundo critério: Grupos maiores antes de menores
    const muscleA = a.targetMuscle as keyof typeof MUSCLE_SIZE;
    const muscleB = b.targetMuscle as keyof typeof MUSCLE_SIZE;
    return MUSCLE_SIZE[muscleB] - MUSCLE_SIZE[muscleA];
  });
}

// Atualizar a função que gera os treinos para usar a ordem otimizada
function generateWorkoutDay(
  exercises: Exercise[],
  name: string,
  focusArea: string
): WorkoutDay {
  // Validar limites
  exercises = exercises.map((exercise) => ({
    ...exercise,
    sets: Math.min(
      Math.max(exercise.sets, TRAINING_CONSTANTS.MIN_SETS),
      TRAINING_CONSTANTS.MAX_SETS
    ),
    restTime: Math.min(
      Math.max(exercise.restTime, TRAINING_CONSTANTS.MIN_REST),
      TRAINING_CONSTANTS.MAX_REST
    ),
  }));

  const workout = {
    id: generateUniqueId(),
    name,
    exercises: optimizeExerciseOrder(exercises),
    estimatedTime: calculateWorkoutTime(exercises),
    focusArea,
  };

  logWorkoutGeneration(workout);
  return workout;
}

export function createTrainingProgram(data: OnboardingData): TrainingProgram {
  // Definir nível do treino
  const level = data.trainingExperience || "none";

  // Definir estilo do treino
  const style = determineTrainingStyle(data);

  // Definir frequência semanal
  const frequency = determineFrequency(data);

  // Gerar os dias de treino
  const workoutDays = generateWorkoutDays(data);

  // Definir dias de descanso
  const restDays = calculateRestDays(data.trainingDays || []);

  return {
    id: generateUniqueId(),
    name: `Programa ${level} - ${style}`,
    level,
    style,
    workoutDays,
    frequency,
    restDays,
    createdAt: new Date(),
  };
}

function determineTrainingStyle(data: OnboardingData): TrainingStyle {
  const { trainingExperience, trainingFrequency, trainingDays } = data;
  const frequency = trainingDays?.length || 0;

  // Recomendações baseadas na experiência e frequência
  if (trainingExperience === "none" || trainingFrequency === "sedentary") {
    return "full_body";
  }

  if (frequency <= 3) {
    return "full_body"; // Full body é mais eficiente para baixa frequência
  }

  if (frequency === 4) {
    return "upper_lower"; // Upper/Lower é ideal para 4 dias
  }

  // Para 5-6 dias, Push/Pull/Legs é mais adequado
  if (frequency >= 5 && trainingExperience !== "beginner") {
    return "push_pull_legs";
  }

  return data.trainingStyle || "full_body";
}

function determineFrequency(data: OnboardingData): number {
  switch (data.trainingFrequency) {
    case "sedentary":
      return 2;
    case "light":
      return 3;
    case "moderate":
      return 4;
    case "heavy":
      return 5;
    case "athlete":
      return 6;
    default:
      return 3;
  }
}

// Atualizar a função principal para usar as novas validações
function generateWorkoutDays(data: OnboardingData): WorkoutDay[] {
  const workoutDays: WorkoutDay[] = [];
  const selectedDays = data.trainingDays || [];
  const style = determineTrainingStyle(data);
  const level = data.trainingExperience || "none";
  const goal = data.trainingGoals || "general_fitness";
  const frequency = data.trainingFrequency || "moderate";

  // Configurações base ajustadas por nível e frequência anterior
  const baseConfig = {
    ...EXPERIENCE_CONFIG[level],
    setsPerExercise: Math.round(
      EXPERIENCE_CONFIG[level].setsPerExercise *
        FREQUENCY_ADJUSTMENTS[frequency].volumeMultiplier
    ),
    restTime: Math.round(
      EXPERIENCE_CONFIG[level].restTime *
        FREQUENCY_ADJUSTMENTS[frequency].restMultiplier
    ),
  };

  const goalConfig = GOALS_CONFIG[goal];
  const timeAdjustment = adjustForTime(data.trainingTime);

  // Implementa periodização básica
  const weeklyUndulation = implementWeeklyUndulation(selectedDays.length);

  switch (style) {
    case "full_body":
      selectedDays.forEach((day, index) => {
        workoutDays.push(
          generateFullBodyWorkout({
            day,
            config: baseConfig,
            goalConfig,
            timeAdjustment,
            variation: index % 3,
            level,
          })
        );
      });
      break;

    case "upper_lower":
      selectedDays.forEach((day, index) => {
        workoutDays.push(
          index % 2 === 0
            ? generateUpperWorkout({
                day,
                config: baseConfig,
                goalConfig,
                timeAdjustment,
                variation: index % 2,
                level,
              })
            : generateLowerWorkout({
                day,
                config: baseConfig,
                goalConfig,
                timeAdjustment,
                variation: index % 2,
                level,
              })
        );
      });
      break;

    case "push_pull_legs":
      selectedDays.forEach((day, index) => {
        const rotation = index % 3;
        workoutDays.push(
          rotation === 0
            ? generatePushWorkout({
                day,
                config: baseConfig,
                goalConfig,
                timeAdjustment,
                variation: index % 3,
                level,
              })
            : rotation === 1
            ? generatePullWorkout({
                day,
                config: baseConfig,
                goalConfig,
                timeAdjustment,
                variation: index % 3,
                level,
              })
            : generateLegsWorkout({
                day,
                config: baseConfig,
                goalConfig,
                timeAdjustment,
                variation: index % 3,
                level,
              })
        );
      });
      break;
  }

  // Aplicar ajustes por objetivo e fadiga
  const adjustedWorkouts = workoutDays.map((workout) => {
    const adjustedForGoal = adjustForGoal(workout, goal, level);
    const currentFatigue = calculateFatigueIndex(adjustedForGoal);
    console.log(`Fadiga atual: ${currentFatigue}`);
    return adjustWorkoutForFatigue(
      adjustedForGoal,
      calculateTargetFatigue(level),
      level
    );
  });

  // Validar e ajustar distribuição de volume
  const validation = checkMuscleOverlap(
    adjustedWorkouts,
    data.trainingDays || []
  );

  if (!validation.isValid) {
    // Tentar reorganizar os treinos para resolver sobreposições
    return redistributeWorkouts(adjustedWorkouts, validation.issues);
  }

  return adjustedWorkouts;
}

function calculateRestDays(selectedDays: number[]): number[] {
  // Retorna os dias que não foram selecionados para treino
  return Array.from({ length: 7 }, (_, i) => i).filter(
    (day) => !selectedDays.includes(day)
  );
}

function adjustForTime(trainingTime?: string): number {
  switch (trainingTime) {
    case "30_min":
      return 0.6; // Reduz volume/descanso para caber em 30min
    case "45_min":
      return 0.8;
    case "60_min":
      return 1.0; // Volume padrão
    case "90_min":
      return 1.2;
    case "120_min":
      return 1.4;
    default:
      return 1.0;
  }
}

// Implementação do treino Full Body
function generateFullBodyWorkout(params: WorkoutParams): WorkoutDay {
  const validationErrors = validateWorkoutParams(params);

  if (validationErrors.length > 0) {
    console.warn("Avisos na geração do treino:", validationErrors);

    // Gerar treino base primeiro
    const workout = generateBaseWorkout(params);

    // Ajustar treino se possível
    if (!validationErrors.some((e) => e.code === "TIME_INVALID")) {
      return adjustWorkoutBasedOnErrors(workout, validationErrors);
    }

    throw new Error(validationErrors[0].message);
  }

  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  // Define grupos musculares por prioridade para cada variação
  const variations = [
    ["chest", "back", "legs", "shoulders", "biceps", "triceps", "core"],
    ["back", "legs", "shoulders", "chest", "triceps", "biceps", "core"],
    ["legs", "chest", "back", "shoulders", "biceps", "triceps", "core"],
  ] as MuscleGroup[][];

  const muscleGroups = variations[variation];

  // Ajusta número de exercícios baseado no tempo disponível
  const exercisesPerMuscle = Math.max(
    1,
    Math.floor(config.exercisesPerMuscle * timeAdjustment)
  );

  // Ajusta séries baseado no objetivo
  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  // Ajusta tempo de descanso
  const restTime = Math.max(
    TRAINING_CONSTANTS.MIN_REST,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  // Gera exercícios para cada grupo muscular
  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(
    exercises,
    `Treino Full Body ${variation + 1}`,
    "Full Body"
  );
}

// Função auxiliar para gerar treino base
function generateBaseWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  // Define grupos musculares por prioridade para cada variação
  const variations = [
    ["chest", "back", "legs", "shoulders", "biceps", "triceps", "core"],
    ["back", "legs", "shoulders", "chest", "triceps", "biceps", "core"],
    ["legs", "chest", "back", "shoulders", "biceps", "triceps", "core"],
  ] as MuscleGroup[][];

  const muscleGroups = variations[variation];

  // Ajusta número de exercícios baseado no tempo disponível
  const exercisesPerMuscle = Math.max(
    1,
    Math.floor(config.exercisesPerMuscle * timeAdjustment)
  );

  // Ajusta séries baseado no objetivo
  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  // Ajusta tempo de descanso
  const restTime = Math.max(
    TRAINING_CONSTANTS.MIN_REST,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  // Gera exercícios para cada grupo muscular
  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(
    exercises,
    `Treino Full Body ${variation + 1}`,
    "Full Body"
  );
}

function generateUpperWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  const variations = [
    ["chest", "back", "shoulders", "triceps", "biceps"],
    ["back", "chest", "shoulders", "biceps", "triceps"],
    ["shoulders", "chest", "back", "triceps", "biceps"],
  ] as MuscleGroup[][];

  const muscleGroups = variations[variation % variations.length];
  const exercisesPerMuscle = Math.max(
    1,
    Math.floor(config.exercisesPerMuscle * timeAdjustment * 1.2)
  );

  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  const restTime = Math.max(
    30,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(
    exercises,
    `Treino Superior ${variation + 1}`,
    "Upper Body"
  );
}

function generateLowerWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  // Define grupos musculares do treino inferior com variações
  const variations = [
    ["legs", "core"],
    ["core", "legs"],
  ] as MuscleGroup[][];

  const muscleGroups = variations[variation % variations.length];

  // Mais exercícios por grupo já que são menos grupos
  const exercisesPerMuscle = Math.max(
    2,
    Math.floor(config.exercisesPerMuscle * timeAdjustment * 1.5)
  );

  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  const restTime = Math.max(
    30,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(
    exercises,
    `Treino Inferior ${variation + 1}`,
    "Lower Body"
  );
}

// Implementações Push/Pull/Legs
function generatePushWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  const muscleGroups = ["chest", "shoulders", "triceps"] as MuscleGroup[];

  const exercisesPerMuscle = Math.max(
    2,
    Math.floor(config.exercisesPerMuscle * timeAdjustment * 1.3)
  );

  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  const restTime = Math.max(
    30,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(exercises, `Treino Push ${variation + 1}`, "Push");
}

function generatePullWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  const muscleGroups = ["back", "biceps"] as MuscleGroup[];

  const exercisesPerMuscle = Math.max(
    2,
    Math.floor(config.exercisesPerMuscle * timeAdjustment * 1.3)
  );

  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  const restTime = Math.max(
    30,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(exercises, `Treino Pull ${variation + 1}`, "Pull");
}

function generateLegsWorkout(params: WorkoutParams): WorkoutDay {
  const { config, goalConfig, timeAdjustment, variation, level } = params;
  const exercises: Exercise[] = [];

  const muscleGroups = ["legs", "core"] as MuscleGroup[];

  const exercisesPerMuscle = Math.max(
    2,
    Math.floor(config.exercisesPerMuscle * timeAdjustment * 1.5)
  );

  const setsPerExercise = Math.max(
    2,
    Math.floor(config.setsPerExercise * goalConfig.setsMultiplier)
  );

  const restTime = Math.max(
    30,
    Math.floor(config.restTime * goalConfig.restTimeMultiplier * timeAdjustment)
  );

  muscleGroups.forEach((muscle) => {
    const muscleExercises = selectExercisesForMuscle({
      muscle,
      level,
      count: exercisesPerMuscle,
      variation,
    });

    exercises.push(
      ...muscleExercises.map((ex) => ({
        ...ex,
        sets: setsPerExercise,
        reps: goalConfig.repsAdjustment,
        restTime,
      }))
    );
  });

  return generateWorkoutDay(exercises, `Treino Legs ${variation + 1}`, "Legs");
}

function selectExercisesForMuscle(params: {
  muscle: MuscleGroup;
  level: TrainingExperience;
  count: number;
  variation: number;
}): ExerciseData[] {
  const cacheKey = exerciseCache.generateKey(
    params.muscle,
    params.level,
    params.count
  );
  const cached = exerciseCache.get(cacheKey);

  if (cached) {
    return cached.map((ex) => ({
      ...ex,
      id: `${ex.id}_${params.variation}`,
    }));
  }

  const { muscle, level, count, variation } = params;

  // Convertemos o nível para ExerciseLevel
  const exerciseLevel: ExerciseLevel = level === "none" ? "beginner" : level;

  // Pega exercícios disponíveis para o nível
  const available = getExercisesForLevel(muscle, exerciseLevel);

  // Sempre inclui pelo menos um exercício composto
  const compound = getCompoundExercises(muscle, exerciseLevel)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 1);

  // Completa com exercícios de isolamento se necessário
  const isolation = getIsolationExercises(muscle, exerciseLevel)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, count - 1);

  // Rotaciona exercícios baseado na variação
  const exercises = [...compound, ...isolation].map((ex, i) => ({
    ...ex,
    id: `${ex.id}_${variation}_${i}`,
  }));

  exerciseCache.set(cacheKey, exercises);
  return exercises;
}

function calculateWorkoutTime(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => {
    const setTime = 45; // Tempo médio por série em segundos
    const totalSetTime = ex.sets * setTime;
    const totalRestTime = (ex.sets - 1) * ex.restTime;
    return total + (totalSetTime + totalRestTime) / 60; // Converte para minutos
  }, 0);
}

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Implementa variação de volume/intensidade ao longo da semana
function implementWeeklyUndulation(frequency: number): number[] {
  // Retorna multiplicadores para cada dia da semana
  // Ex: [1, 0.8, 1.2] para variar intensidade
  return Array(frequency)
    .fill(1)
    .map((_, i) => {
      const weekPhase = i / frequency;
      return 0.8 + Math.sin(weekPhase * Math.PI) * 0.4;
    });
}

function adjustForGoal(
  workout: WorkoutDay,
  goal: TrainingGoals,
  experience: TrainingExperience
): WorkoutDay {
  const adjustedWorkout = { ...workout };

  switch (goal) {
    case "strength":
      return emphasizeCompoundMovements(adjustedWorkout, experience);
    case "hypertrophy":
      return balanceCompoundAndIsolation(adjustedWorkout, experience);
    case "endurance":
      return increaseWorkDensity(adjustedWorkout, experience);
    case "weight_loss":
      return optimizeForCalorieBurn(adjustedWorkout, experience);
    default:
      return adjustedWorkout;
  }
}

function emphasizeCompoundMovements(
  workout: WorkoutDay,
  experience: TrainingExperience
): WorkoutDay {
  const strategy = PROGRESSION_STRATEGY[experience];

  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      // Aumenta séries para exercícios compostos
      sets: exercise.compound
        ? Math.min(exercise.sets + 1, strategy.maxVolumePerSession / 10)
        : exercise.sets,
      // Aumenta descanso para exercícios compostos
      restTime: exercise.compound ? exercise.restTime * 1.2 : exercise.restTime,
    })),
  };
}

function balanceCompoundAndIsolation(
  workout: WorkoutDay,
  experience: TrainingExperience
): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      // Volume moderado para todos os exercícios
      sets: Math.min(4, exercise.sets),
      // Descanso moderado
      restTime: 60,
    })),
  };
}

function increaseWorkDensity(
  workout: WorkoutDay,
  experience: TrainingExperience
): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      // Menos séries, mais repetições
      sets: Math.max(2, exercise.sets - 1),
      reps: adjustRepsForEndurance(exercise.reps),
      // Menos descanso
      restTime: Math.max(30, exercise.restTime * 0.7),
    })),
  };
}

function optimizeForCalorieBurn(
  workout: WorkoutDay,
  experience: TrainingExperience
): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      // Volume moderado
      sets: 3,
      // Repetições moderadas a altas
      reps: "12-15",
      // Descanso reduzido
      restTime: Math.max(30, exercise.restTime * 0.8),
    })),
  };
}

// Função auxiliar para ajustar repetições
function adjustRepsForEndurance(currentReps: string): string {
  const [min, max] = currentReps.split("-").map(Number);
  return `${min + 4}-${max + 4}`;
}

// Adicionar função para verificar sobrecarrega muscular
function checkMuscleOverlap(
  workouts: WorkoutDay[],
  selectedDays: number[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  workouts.forEach((workout, index) => {
    const volume = calculateWorkoutVolume(workout);
    if (volume > TRAINING_CONSTANTS.MAX_VOLUME_PER_WORKOUT) {
      issues.push({
        type: "volume",
        message: `Volume muito alto no treino ${workout.name}`,
        muscle: workout.focusArea as MuscleGroup,
        days: [selectedDays[index]],
      });
    }
  });

  // Verificar tempo de recuperação entre treinos do mesmo grupo
  const muscleUsage = new Map<MuscleGroup, number[]>();

  workouts.forEach((workout, workoutIndex) => {
    workout.exercises.forEach((exercise) => {
      const muscle = exercise.targetMuscle as MuscleGroup;
      const day = selectedDays[workoutIndex];

      if (!muscleUsage.has(muscle)) {
        muscleUsage.set(muscle, []);
      }
      muscleUsage.get(muscle)?.push(day);
    });
  });

  muscleUsage.forEach((days, muscle) => {
    const sortedDays = [...days].sort((a, b) => a - b);
    for (let i = 1; i < sortedDays.length; i++) {
      const daysBetween = calculateDaysBetween(
        sortedDays[i - 1],
        sortedDays[i]
      );
      const minRecovery = MUSCLE_RECOVERY_TIME[muscle] / 24; // Converter horas para dias

      if (daysBetween < minRecovery) {
        issues.push({
          type: "recovery",
          message: `${muscle} tem pouco tempo de recuperação entre os dias ${
            sortedDays[i - 1]
          } e ${sortedDays[i]}`,
          muscle,
          days: [sortedDays[i - 1], sortedDays[i]],
        });
      }
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}

function calculateDaysBetween(day1: number, day2: number): number {
  if (day2 < day1) {
    return 7 - day1 + day2; // Considerar ciclo semanal
  }
  return day2 - day1;
}

function redistributeWorkouts(
  workouts: WorkoutDay[],
  issues: ValidationIssue[]
): WorkoutDay[] {
  return workouts.map((workout, workoutIndex) => {
    // Usar o índice do treino ao invés do ID
    const problematicMuscles = issues
      .filter((issue) => issue.days.includes(workoutIndex))
      .map((issue) => issue.muscle);

    if (problematicMuscles.length === 0) return workout;

    // Reduzir volume para músculos problemáticos
    return {
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (problematicMuscles.includes(exercise.targetMuscle as MuscleGroup)) {
          return {
            ...exercise,
            sets: Math.max(2, exercise.sets - 1),
          };
        }
        return exercise;
      }),
    };
  });
}
