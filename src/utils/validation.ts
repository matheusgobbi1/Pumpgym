import { WorkoutParams, WorkoutError } from "../types/training";
import { TRAINING_CONSTANTS } from "../constants/training";

export function validateWorkoutParams(params: WorkoutParams): WorkoutError[] {
  const errors: WorkoutError[] = [];

  // Validações básicas
  if (!params.level || !params.config || !params.goalConfig) {
    errors.push({
      code: 'TIME_INVALID',
      message: "Parâmetros obrigatórios faltando",
    });
    return errors;
  }

  if (params.timeAdjustment <= 0) {
    errors.push({
      code: 'TIME_INVALID',
      message: "Ajuste de tempo inválido",
      details: { timeAdjustment: params.timeAdjustment },
    });
  }

  // Validar séries
  if (params.config.setsPerExercise < TRAINING_CONSTANTS.MIN_SETS) {
    errors.push({
      code: 'VOLUME_HIGH',
      message: "Número de séries muito baixo",
      details: { sets: params.config.setsPerExercise },
    });
  }

  if (params.config.setsPerExercise > TRAINING_CONSTANTS.MAX_SETS) {
    errors.push({
      code: 'VOLUME_HIGH',
      message: "Número de séries muito alto",
      details: { sets: params.config.setsPerExercise },
    });
  }

  return errors;
} 