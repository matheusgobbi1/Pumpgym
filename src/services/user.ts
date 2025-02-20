import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { OnboardingData } from "../contexts/OnboardingContext";
import { validateUserData } from "./validation";
import { createNutritionPlan } from "./nutrition";

interface UserProfile extends OnboardingData {
  createdAt: Date;
  updatedAt: Date;
}

export async function saveUserProfile(userId: string, data: OnboardingData) {
  try {
    console.log("🔍 Validando dados do usuário...");
    const errors = validateUserData(data);
    if (errors.length > 0) {
      console.error("❌ Erros de validação:", errors);
      throw new Error(
        `Dados inválidos: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("📝 Preparando dados para o Firestore...");
    const userProfile = {
      gender: data.gender,
      birthDate: data.birthDate?.toISOString(),
      height: data.height,
      weight: data.weight,
      goal: data.goal,
      weightGoal: data.weightGoal || null,
      weightSpeed: data.weightSpeed || null,
      trainingFrequency: data.trainingFrequency,
      diet: data.diet,
      referralSource: data.referralSource,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("📤 Dados a serem salvos:", userProfile);
    await setDoc(doc(db, "users", userId), userProfile);
    console.log("✅ Dados salvos com sucesso no Firestore!");

    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar perfil:", error);
    throw error;
  }
}

export async function createUserNutritionPlan(
  userId: string,
  data: OnboardingData
) {
  try {
    console.log("🔄 Calculando plano nutricional...");
    console.log("Dados de entrada:", {
      weight: data.weight,
      height: data.height,
      gender: data.gender,
      trainingFrequency: data.trainingFrequency,
      goal: data.goal,
    });

    // Cálculo do BMR usando a fórmula de Harris-Benedict
    const age = data.birthDate
      ? Math.floor(
          (new Date().getTime() - data.birthDate.getTime()) / 31557600000
        )
      : 30;

    let bmr = 0;

    if (data.gender === "masculino") {
      bmr = Math.abs(
        88.362 + 13.397 * data.weight! + 4.799 * data.height! - 5.677 * age
      );
    } else {
      bmr = Math.abs(
        447.593 + 9.247 * data.weight! + 3.098 * data.height! - 4.33 * age
      );
    }

    // Usando a função do nutrition.ts para calcular o plano
    const nutritionPlan = createNutritionPlan(data);
    console.log("📊 Plano nutricional calculado:", nutritionPlan);

    console.log("💾 Salvando plano no Firestore...");
    await setDoc(doc(db, "nutritionPlans", userId), nutritionPlan);
    console.log("✅ Plano nutricional salvo com sucesso!");

    return nutritionPlan;
  } catch (error) {
    console.error("❌ Erro ao criar plano nutricional:", error);
    throw error;
  }
}
