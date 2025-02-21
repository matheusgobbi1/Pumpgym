import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrainingProgram } from "./training";

const STORAGE_KEYS = {
  TRAINING_PROGRAM: "@training_program",
  EXERCISE_HISTORY: "@exercise_history",
} as const;

// Implementar armazenamento local
export async function saveTrainingProgram(
  program: TrainingProgram
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TRAINING_PROGRAM,
      JSON.stringify(program)
    );
  } catch (error) {
    console.error("Erro ao salvar programa:", error);
    throw error;
  }
}

export async function getTrainingProgram(): Promise<TrainingProgram | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TRAINING_PROGRAM);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Erro ao recuperar programa:", error);
    return null;
  }
}
