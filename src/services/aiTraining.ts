import { OnboardingData } from "../contexts/OnboardingContext";
import { EXERCISES } from "./exerciseDatabase";
import { generateTrainingPlan } from "./aiTrainingGenerator";

export interface AITrainingPlan {
  workouts: AIGeneratedWorkout[];
  recommendations: {
    frequency: number;
    restDays: number[];
    progression: string;
    notes: string;
  };
}

export interface AIGeneratedWorkout {
  name: string;
  focusArea: string;
  exercises: Array<{
    exerciseId: string;
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    notes?: string;
  }>;
}

export async function generateAITraining(userData: OnboardingData): Promise<AITrainingPlan> {
  try {
    return await generateTrainingPlan(userData);
  } catch (error) {
    console.error("❌ Erro ao gerar treino:", error);
    throw new Error("Não foi possível gerar seu programa de treino");
  }
}

// Funções auxiliares... 