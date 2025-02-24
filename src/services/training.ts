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
import { doc, setDoc, getDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { AITrainingPlan, AIGeneratedWorkout } from '../types/training';
import { CustomWorkout } from './customTraining';
import { getDocs } from "firebase/firestore";
import { generateTrainingPlan } from './aiTrainingGenerator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError } from "firebase/app";

export const EXPERIENCE_CONFIG = {
  beginner: {
    label: "Iniciante",
    description: "Nunca treinou ou treina há menos de 6 meses",
    icon: "🌱"
  },
  intermediate: {
    label: "Intermediário",
    description: "Treina regularmente há mais de 6 meses",
    icon: "💪"
  },
  advanced: {
    label: "Avançado",
    description: "Treina há mais de 2 anos com consistência",
    icon: "🏆"
  }
} as const;

export const GOALS_CONFIG = {
  hypertrophy: {
    label: "Hipertrofia",
    description: "Ganho de massa muscular",
    icon: "💪"
  },
  strength: {
    label: "Força",
    description: "Aumento de força máxima",
    icon: "🏋️"
  },
  endurance: {
    label: "Resistência",
    description: "Melhora da resistência muscular",
    icon: "🏃"
  }
} as const;

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  compound: boolean;
  muscleGroups: string[];
}

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
const EXPERIENCE_CONFIG_DETAILS = {
  none: {
    setsPerExercise: 3,
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
const GOALS_CONFIG_DETAILS: Record<
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
    const muscleA = a.muscleGroups[0] as keyof typeof MUSCLE_SIZE;
    const muscleB = b.muscleGroups[0] as keyof typeof MUSCLE_SIZE;
    return MUSCLE_SIZE[muscleB] - MUSCLE_SIZE[muscleA];
  });
}

function calculateWorkoutVolume(workout: WorkoutDay): number {
  if (!workout.exercises || workout.exercises.length === 0) return 0;
  
  return workout.exercises.reduce((total, exercise) => {
    const repsRange = exercise.reps.split("-").map(Number);
    const avgReps = (repsRange[0] + repsRange[1]) / 2;
    return total + (exercise.sets * avgReps);
  }, 0);
}

function generateWorkoutDay(
  exercises: Exercise[],
  name: string,
  focusArea: string
): WorkoutDay {
  if (!exercises || exercises.length === 0) {
    return {
      id: generateUniqueId(),
      name,
      exercises: [],
      estimatedTime: 0,
      focusArea,
    };
  }

  // Validar limites e garantir mínimo de séries
  exercises = exercises.map((exercise) => ({
    ...exercise,
    sets: Math.max(
      TRAINING_CONSTANTS.MIN_SETS,
      Math.min(exercise.sets, TRAINING_CONSTANTS.MAX_SETS)
    ),
    restTime: Math.max(
      TRAINING_CONSTANTS.MIN_REST,
      Math.min(exercise.restTime, TRAINING_CONSTANTS.MAX_REST)
    ),
  }));

  const workout = {
    id: generateUniqueId(),
    name,
    exercises: optimizeExerciseOrder(exercises),
    estimatedTime: calculateWorkoutTime(exercises),
    focusArea,
  };

  // Log mais detalhado do treino gerado
  console.group(`  🏋️‍♂️ Treino: ${name}`);
  console.log(`  📊 Volume: ${calculateWorkoutVolume(workout)}`);
  console.log(`  ⏱️ Tempo: ${workout.estimatedTime}min`);
  console.log(`  💪 Exercícios: ${workout.exercises.length}`);
  console.log(`  🎯 Compostos: ${workout.exercises.filter(e => e.compound).length}`);
  console.log(`  🔄 Descanso médio: ${Math.round(workout.exercises.reduce((acc, ex) => acc + ex.restTime, 0) / workout.exercises.length)}s`);
  console.groupEnd();

  return workout;
}

function calculateWorkoutTime(exercises: Exercise[]): number {
  if (!exercises || exercises.length === 0) return 0;
  
  return exercises.reduce((total, ex) => {
    if (!ex.sets || !ex.restTime) return total;
    
    const setTime = 45; // Tempo médio por série em segundos
    const totalSetTime = ex.sets * setTime;
    const totalRestTime = (ex.sets - 1) * ex.restTime;
    return total + (totalSetTime + totalRestTime) / 60; // Converte para minutos
  }, 0);
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

  // Configurações base ajustadas por nível
  const baseConfig = {
    ...EXPERIENCE_CONFIG_DETAILS[level],
  };

  const goalConfig = GOALS_CONFIG_DETAILS[goal];
  const timeAdjustment = adjustForTime(data.trainingTime);

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

  return workoutDays;
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
      return workout;
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
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
        muscleGroups: [muscle],
      }))
    );
  });

  return generateWorkoutDay(exercises, `Treino Legs ${variation + 1}`, "Legs");
}

interface CachedExercise {
  id: string;
  name: string;
  muscleGroups: string[];
  targetMuscle: string;
  levels: ("beginner" | "intermediate" | "advanced")[];
  equipment: string[];
  compound: boolean;
  unilateral: boolean;
  priority: number;
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
    return cached.map((ex: CachedExercise) => ({
      id: `${ex.id}_${params.variation}`,
      name: ex.name,
      muscleGroups: ex.muscleGroups,
      targetMuscle: ex.targetMuscle,
      levels: [params.level === "none" ? "beginner" : params.level],
      equipment: ['bodyweight'],
      compound: ex.compound,
      unilateral: false,
      priority: ex.priority,
    }));
  }

  const { muscle, level, count, variation } = params;
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

  // Atualizar o cache
  exerciseCache.set(cacheKey, exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    muscleGroups: ex.muscleGroups,
    targetMuscle: muscle,
    compound: ex.compound,
    priority: ex.priority
  })));

  return exercises;
}

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Simplificar a função adjustForGoal
function adjustForGoal(
  workout: WorkoutDay,
  goal: TrainingGoals,
  experience: TrainingExperience
): WorkoutDay {
  return workout; // Retorna o treino sem ajustes
}

// Interface simplificada para o documento no Firestore
export interface TrainingProgramDocument {
  id: string;
  userId: string;
  name: string;
  level: TrainingExperience;
  style: TrainingStyle;
  workoutDays: WorkoutDay[];
  frequency: number;
  restDays: number[];
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

// Função para salvar o programa de treino
export async function saveTrainingProgram(userId: string, data: OnboardingData) {
  try {
    console.log("🏋️‍♂️ Gerando programa de treino...");
    const program = createTrainingProgram(data);
    
    if (!program.workoutDays || program.workoutDays.length === 0) {
      throw new Error("Programa de treino não foi gerado corretamente");
    }

    const trainingProgramDoc: TrainingProgramDocument = {
      ...program,
      userId,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("📝 Programa gerado:", JSON.stringify(trainingProgramDoc, null, 2));
    console.log("💾 Salvando programa no Firestore...");
    
    await setDoc(
      doc(db, "trainingPrograms", userId), 
      trainingProgramDoc
    );
    
    console.log("✅ Programa de treino salvo com sucesso!");
    return trainingProgramDoc;
  } catch (error) {
    console.error("❌ Erro ao salvar programa de treino:", error);
    throw error;
  }
}

// Função para buscar o programa ativo do usuário
export async function getUserActiveProgram(userId: string): Promise<AITrainingPlan | null> {
  try {
    console.log("🔍 Iniciando busca do programa...");
    console.log("👤 ID do usuário:", userId);

    // Buscar programa diretamente
    const programRef = doc(db, "users", userId, "programs", userId);
    console.log("📍 Buscando em:", programRef.path);
    
    const programDoc = await getDoc(programRef);
    console.log("📥 Resposta do Firestore:", {
      exists: programDoc.exists(),
      path: programRef.path,
      data: programDoc.exists() ? "Dados encontrados" : "Nenhum dado"
    });

    if (!programDoc.exists()) {
      console.warn("⚠️ Programa não encontrado");
      return null;
    }

    const data = programDoc.data();
    if (!data?.workouts?.length) {
      console.error("❌ Dados inválidos:", data);
      return null;
    }

    const program: AITrainingPlan = {
      workouts: data.workouts,
      recommendations: data.recommendations || {}
    };

    console.log("✅ Programa carregado:", {
      workouts: program.workouts.length,
      firstWorkout: program.workouts[0]?.name
    });

    return program;
  } catch (error) {
    console.error("❌ Erro ao buscar programa:", error);
    return null;
  }
}

// Novo tipo para tracking de exercício
export interface ExerciseTracking {
  exerciseId: string;
  date: string;
  sets: Array<{
    reps: number;
    weight: number;
    rpe?: number; // Rate of Perceived Exertion (opcional)
    notes?: string; // Para observações sobre técnica/execução
  }>;
}

// Novo tipo para sugestões de progressão
export interface ProgressionSuggestion {
  type: 'weight' | 'reps' | 'technique' | 'rest';
  suggestion: string;
  reason: string;
}

// Função para analisar progresso e dar sugestões
export function analyzeExerciseProgress(
  currentTracking: ExerciseTracking,
  previousTracking: ExerciseTracking
): ProgressionSuggestion[] {
  const suggestions: ProgressionSuggestion[] = [];

  // Compara média de reps
  const currentAvgReps = calculateAverageReps(currentTracking);
  const previousAvgReps = calculateAverageReps(previousTracking);

  // Compara média de peso
  const currentAvgWeight = calculateAverageWeight(currentTracking);
  const previousAvgWeight = calculateAverageWeight(previousTracking);

  // Analisa se pode aumentar peso
  if (currentAvgReps >= targetReps && currentAvgWeight === previousAvgWeight) {
    suggestions.push({
      type: 'weight',
      suggestion: 'Tente aumentar o peso em 2.5kg na próxima sessão',
      reason: 'Você atingiu todas as repetições com boa forma'
    });
  }

  // Analisa se pode aumentar reps
  if (currentAvgReps === previousAvgReps && currentAvgWeight === previousAvgWeight) {
    suggestions.push({
      type: 'reps',
      suggestion: 'Tente adicionar 1-2 repetições em cada série',
      reason: 'Você manteve o peso e repetições, está pronto para progredir'
    });
  }

  return suggestions;
}

export interface WorkoutProgram {
  id: string;
  type: 'AI_GENERATED' | 'CUSTOM';
  workouts: AIGeneratedWorkout[];
  recommendations?: {
    frequency: number;
    restDays: number[];
    progression: string;
    notes: string;
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserPrograms(userId: string): Promise<AITrainingPlan[]> {
  try {
    const programsRef = collection(db, 'users', userId, 'programs');
    const snapshot = await getDocs(programsRef);
    
    const programs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        workouts: data.workouts,
        recommendations: data.recommendations,
        active: data.active,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as AITrainingPlan;
    });

    console.log("📋 Programas encontrados:", programs);
    return programs;
  } catch (error) {
    console.error('❌ Erro ao buscar programas:', error);
    return [];
  }
}

export async function activateProgram(userId: string, programId: string) {
  // Ativa um programa e desativa os outros
  // ...
}

export async function createUserTrainingProgram(userId: string, userData: OnboardingData) {
  try {
    console.log("🤖 Gerando programa com IA...");
    
    // Gera o programa usando IA
    const aiPlan = await generateTrainingPlan(userData);
    
    // Salva no Firestore com caminho correto
    const programRef = doc(db, "users", userId, "programs", userId); // Caminho corrigido
    await setDoc(programRef, {
      id: userId,
      type: 'AI_GENERATED',
      workouts: aiPlan.workouts,
      recommendations: aiPlan.recommendations,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    });

    console.log("✅ Programa gerado e salvo com sucesso!");
    return aiPlan;
  } catch (error) {
    console.error("❌ Erro ao criar programa:", error);
    throw error;
  }
}

// Funções auxiliares para cálculos
function calculateAverageReps(tracking: ExerciseTracking): number {
  if (!tracking.sets.length) return 0;
  const totalReps = tracking.sets.reduce((sum, set) => sum + set.reps, 0);
  return totalReps / tracking.sets.length;
}

function calculateAverageWeight(tracking: ExerciseTracking): number {
  if (!tracking.sets.length) return 0;
  const totalWeight = tracking.sets.reduce((sum, set) => sum + set.weight, 0);
  return totalWeight / tracking.sets.length;
}

// Constante para target de repetições
const targetReps = 12; // Você pode ajustar este valor ou torná-lo dinâmico

export async function saveUserProgram(userId: string, program: AITrainingPlan): Promise<boolean> {
  try {
    console.log("💾 Iniciando salvamento do programa...");

    if (!userId || !program?.workouts?.length) {
      console.error("❌ Dados inválidos:", { userId, hasWorkouts: !!program?.workouts?.length });
      return false;
    }

    // Criar referência ao programa
    const programRef = doc(db, "users", userId, "programs", userId);
    console.log("📍 Salvando programa em:", programRef.path);

    const programData = {
      id: userId,
      type: "AI_GENERATED",
      active: true,
      workouts: program.workouts.map(workout => ({
        name: workout.name,
        focusArea: workout.focusArea,
        exercises: workout.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          notes: ex.notes
        })),
        scheduledDays: workout.scheduledDays
      })),
      recommendations: program.recommendations || {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Salvar programa
    await setDoc(programRef, programData);

    // Atualizar documento do usuário
    const userRef = doc(db, "users", userId);
    console.log("📝 Atualizando documento do usuário");
    
    await setDoc(userRef, {
      hasProgram: true,
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log("✅ Programa salvo com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar programa:", error);
    return false;
  }
}
