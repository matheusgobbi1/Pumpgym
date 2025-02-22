import { TrainingExperience, TrainingGoals } from "../contexts/OnboardingContext";
import { EXPERIENCE_CONFIG, GOALS_CONFIG, Exercise } from "../services/training";

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
  exercises?: Exercise[];
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