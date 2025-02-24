import { db } from "./firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { OnboardingData } from "../contexts/OnboardingContext";
import { validateUserData } from "./validation";
import { createNutritionPlan } from "./nutrition";

interface UserProfile extends OnboardingData {
  createdAt: Date;
  updatedAt: Date;
}

export async function saveUserProfile(userId: string, data: OnboardingData): Promise<boolean> {
  try {
    console.log("💾 Salvando perfil do usuário...");
    
    // Validar dados
    console.log("🔍 Validando dados do usuário...");
    const errors = validateUserData(data);
    if (errors.length > 0) {
      console.error("❌ Erros de validação:", errors);
      throw new Error(`Dados inválidos: ${errors.map((e) => e.message).join(", ")}`);
    }

    // Preparar dados
    const profileData = {
      ...data,
      hasCompletedOnboarding: data.hasCompletedOnboarding || false,
      updatedAt: serverTimestamp()
    };

    // Salvar no documento do usuário
    const userRef = doc(db, "users", userId);
    console.log("📤 Salvando dados:", profileData);
    
    // Verificar se o documento existe
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log("📝 Criando novo documento do usuário");
      profileData.createdAt = serverTimestamp();
    }
    
    // Salvar dados
    await setDoc(userRef, profileData, { merge: true });
    
    console.log("✅ Perfil salvo com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar perfil:", error);
    return false;
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
