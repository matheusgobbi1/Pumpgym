import { TrainingExperience, TrainingGoals } from "../contexts/OnboardingContext";
import { EXPERIENCE_CONFIG, GOALS_CONFIG } from "../services/training";
import { ExerciseData } from './exercise';
import { MuscleGroup } from "../services/exerciseDatabase";

export type VolumeDistribution = "ascending" | "balanced" | "descending";
export type ExerciseEquipment = "bodyweight" | "dumbbell" | "barbell" | "machine" | "cable";

export interface WorkoutConfig extends Record<TrainingExperience, {
  setsPerExercise: number;
  exercisesPerMuscle: number;
  restTime: number;
  reps: string;
  complexityLimit: number;
  weeklyProgression: number;
}> {}

export interface ValidationIssue {
  type: "recovery" | "volume" | "balance";
  message: string;
  muscle: MuscleGroup;
  days: number[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export type MuscleGroup = 
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core";

export interface WorkoutParams {
  day: number;
  config: {
    setsPerExercise: number;
    exercisesPerMuscle: number;
    restTime: number;
    reps: string;
    complexityLimit: number;
    weeklyProgression: number;
  };
  goalConfig: {
    setsMultiplier: number;
    restTimeMultiplier: number;
    repsAdjustment: string;
    compoundFocus: number;
    volumeDistribution: VolumeDistribution;
  };
  timeAdjustment: number;
  variation: number;
  level: TrainingExperience;
  exercises?: ExerciseData[];
}

export interface GoalConfig {
  setsMultiplier: number;
  restTimeMultiplier: number;
  repsAdjustment: string;
  compoundFocus: number;
  volumeDistribution: VolumeDistribution;
}

export type WorkoutError = {
  code: 'VOLUME_HIGH' | 'RECOVERY_LOW' | 'TIME_INVALID' | 'EXERCISE_DISTRIBUTION';
  message: string;
  details?: Record<string, any>;
};

export type ExperienceConfig = typeof EXPERIENCE_CONFIG;
export type GoalsConfig = typeof GOALS_CONFIG;

export interface SetTracking {
  weight: number;
  reps: number;
  isComplete: boolean;
}

export interface Exercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  notes?: string;
  targetMuscle?: MuscleGroup;
  muscleGroups?: string[];
  equipment?: string[];
  compound?: boolean;
  unilateral?: boolean;
}

export interface ExerciseData extends Exercise {
  id: string;
  levels: string[];
}

export interface SetData {
  weight: number;
  reps: number;
  timestamp: number;
}

export interface WorkoutData {
  name: string;
  exercises: Exercise[];
}

export interface AIGeneratedWorkout {
  name: string;
  focusArea: string;
  exercises: Exercise[];
  scheduledDays: number[];
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string | number;
  restTime: number;
  notes?: string;
}

export interface WorkoutProgress {
  completedExercises: number;
  totalExercises: number;
  streak: number;
  lastWorkout?: Date;
}

export interface AITrainingPlan {
  workouts: AIGeneratedWorkout[];
  recommendations: {
    frequency: number;
    restDays: number[];
    progression: string;
    notes: string;
  };
}

export interface ExerciseHistory {
  exerciseId: string;
  sets: SetData[];
  date: number;
  workoutId: string;
}

export interface ExerciseProgress {
  lastWeight: number;
  bestWeight: number;
  totalVolume: number;
  history: SetData[];
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  focusArea: string;
  duration?: number;
  difficulty?: string;
} 