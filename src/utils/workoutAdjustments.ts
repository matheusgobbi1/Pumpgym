import { WorkoutDay, Exercise } from "../services/training";
import { WorkoutError } from "../types/training";
import { TRAINING_CONSTANTS } from "../constants/training";

export function adjustWorkoutBasedOnErrors(
  workout: WorkoutDay,
  errors: WorkoutError[]
): WorkoutDay {
  let adjustedWorkout = { ...workout };

  errors.forEach(error => {
    switch (error.code) {
      case 'VOLUME_HIGH':
        adjustedWorkout = reduceWorkoutVolume(adjustedWorkout);
        break;
      case 'TIME_INVALID':
        adjustedWorkout = adjustWorkoutTime(adjustedWorkout);
        break;
      case 'EXERCISE_DISTRIBUTION':
        adjustedWorkout = rebalanceExercises(adjustedWorkout);
        break;
    }
  });

  return adjustedWorkout;
}

function reduceWorkoutVolume(workout: WorkoutDay): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map(ex => ({
      ...ex,
      sets: Math.max(
        TRAINING_CONSTANTS.MIN_SETS,
        Math.floor(ex.sets * TRAINING_CONSTANTS.DELOAD_VOLUME_REDUCTION)
      ),
    })),
  };
}

function adjustWorkoutTime(workout: WorkoutDay): WorkoutDay {
  return {
    ...workout,
    exercises: workout.exercises.map(ex => ({
      ...ex,
      restTime: Math.max(
        TRAINING_CONSTANTS.MIN_REST,
        Math.floor(ex.restTime * TRAINING_CONSTANTS.MIN_RECOVERY_MULTIPLIER)
      ),
    })),
  };
}

function rebalanceExercises(workout: WorkoutDay): WorkoutDay {
  const compounds = workout.exercises.filter(e => e.compound);
  const isolations = workout.exercises.filter(e => !e.compound);

  // Priorizar exercícios compostos
  return {
    ...workout,
    exercises: [
      ...compounds.map(ex => ({ ...ex, sets: ex.sets + 1 })),
      ...isolations.map(ex => ({ ...ex, sets: Math.max(2, ex.sets - 1) })),
    ],
  };
} 