import { Exercise } from "../services/training";

export function averageRestTime(exercises: Exercise[]): number {
  if (!exercises.length) return 0;
  
  const totalRest = exercises.reduce((sum, ex) => sum + ex.restTime, 0);
  return Math.round(totalRest / exercises.length);
} 