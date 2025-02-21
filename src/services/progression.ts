import { Exercise, WorkoutDay, TrainingProgram } from "./training";
import {
  TrainingGoals,
  TrainingExperience,
} from "../contexts/OnboardingContext";

// Tipos adicionais necessários
export interface ExerciseHistory {
  date: Date;
  weight: number;
  reps: number;
  rpe?: number; // Rating of Perceived Exertion (opcional)
}

export interface ExerciseProgression {
  nextWeight?: number;
  nextReps?: string;
  shouldDeload: boolean;
  suggestedVariation?: string;
  readyToProgress: boolean;
}

// Estratégias de progressão por nível
export const PROGRESSION_STRATEGY = {
  none: {
    weeklyIncrease: 0.05, // 5% por semana
    deloadFrequency: 6, // semanas
    volumeReduction: 0.4, // 40% redução no deload
    maxVolumePerSession: 120, // Volume máximo por sessão
  },
  beginner: {
    weeklyIncrease: 0.1,
    deloadFrequency: 8,
    volumeReduction: 0.5,
    maxVolumePerSession: 150,
  },
  intermediate: {
    weeklyIncrease: 0.07,
    deloadFrequency: 10,
    volumeReduction: 0.6,
    maxVolumePerSession: 180,
  },
  advanced: {
    weeklyIncrease: 0.05,
    deloadFrequency: 12,
    volumeReduction: 0.7,
    maxVolumePerSession: 200,
  },
};

// Índice de fadiga por tipo de exercício
const EXERCISE_FATIGUE_INDEX = {
  compound: 1.5,
  isolation: 1.0,
};

// Tempo de recuperação por grupo muscular (em horas)
export const MUSCLE_RECOVERY_TIME = {
  legs: 72,
  back: 48,
  chest: 48,
  shoulders: 48,
  biceps: 24,
  triceps: 24,
  core: 24,
} as const;

// Calcula índice de fadiga do treino
export function calculateFatigueIndex(workout: WorkoutDay): number {
  return workout.exercises.reduce((total, exercise) => {
    const volumeLoad = exercise.sets * getAverageReps(exercise.reps);
    const intensityFactor = exercise.compound
      ? EXERCISE_FATIGUE_INDEX.compound
      : EXERCISE_FATIGUE_INDEX.isolation;
    return total + volumeLoad * intensityFactor;
  }, 0);
}

// Ajusta treino baseado na fadiga acumulada
export function adjustWorkoutForFatigue(
  workout: WorkoutDay,
  targetFatigue: number,
  experience: TrainingExperience
): WorkoutDay {
  const currentFatigue = calculateFatigueIndex(workout);
  const adjustment = targetFatigue / currentFatigue;
  const strategy = PROGRESSION_STRATEGY[experience];

  // Não permite volume acima do máximo para o nível
  if (currentFatigue > strategy.maxVolumePerSession) {
    return reduceWorkoutVolume(workout, strategy.volumeReduction);
  }

  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      sets: Math.max(2, Math.round(exercise.sets * adjustment)),
    })),
  };
}

// Funções auxiliares
function getAverageReps(repsRange: string): number {
  const [min, max] = repsRange.split("-").map(Number);
  return (min + max) / 2;
}

function reduceWorkoutVolume(
  workout: WorkoutDay,
  reductionFactor: number
): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      sets: Math.max(2, Math.floor(exercise.sets * reductionFactor)),
    })),
  };
}

// Implementar lógica de progressão
export function calculateProgression(
  currentExercise: Exercise,
  history: ExerciseHistory[]
): ExerciseProgression {
  if (!history.length) {
    return {
      shouldDeload: false,
      readyToProgress: false,
    };
  }

  const recentSessions = history.slice(-3); // Últimas 3 sessões
  const consistentProgress = checkConsistentProgress(recentSessions);
  const plateauReached = checkPlateau(recentSessions);

  return {
    shouldDeload: plateauReached,
    readyToProgress: consistentProgress,
    nextReps: calculateNextReps(currentExercise.reps),
    nextWeight: calculateNextWeight(recentSessions),
  };
}

// Funções auxiliares para progressão
function checkConsistentProgress(history: ExerciseHistory[]): boolean {
  // Implementar lógica de verificação de progresso consistente
  return history.length >= 3;
}

function checkPlateau(history: ExerciseHistory[]): boolean {
  // Implementar lógica de verificação de plateau
  return false;
}

function calculateNextReps(currentReps: string): string {
  const [min, max] = currentReps.split("-").map(Number);
  return `${min + 1}-${max + 1}`;
}

function calculateNextWeight(history: ExerciseHistory[]): number {
  const lastWeight = history[history.length - 1].weight;
  return lastWeight * 1.025; // Aumento de 2.5%
}

// Calcula o nível de fadiga alvo baseado na experiência
export function calculateTargetFatigue(experience: TrainingExperience): number {
  const strategy = PROGRESSION_STRATEGY[experience];
  return strategy.maxVolumePerSession * 0.8; // 80% do volume máximo
}
