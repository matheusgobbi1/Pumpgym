import {
  OnboardingData,
  MacroDistribution,
} from "../contexts/OnboardingContext";

export interface NutritionPlan {
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: number;
  waterIntake: number;
  dietType: string;
  createdAt: string;
}

interface MacroNutrients {
  protein: number;
  fat: number;
  carbs: number;
}

interface ActivityLevel {
  multiplier: number;
  proteinMultiplier: number;
  waterMultiplier: number;
}

interface MicroNutrients {
  vitaminD: number; // UI/dia
  calcium: number; // mg/dia
  iron: number; // mg/dia
}

interface MealTiming {
  preworkout: string;
  postworkout: string;
  mealSpacing: number;
}

const ACTIVITY_LEVELS: Record<string, ActivityLevel> = {
  sedentary: { multiplier: 1.2, proteinMultiplier: 1.6, waterMultiplier: 30 },
  light: { multiplier: 1.375, proteinMultiplier: 1.8, waterMultiplier: 35 },
  moderate: { multiplier: 1.55, proteinMultiplier: 2.0, waterMultiplier: 40 },
  heavy: { multiplier: 1.725, proteinMultiplier: 2.2, waterMultiplier: 45 },
  athlete: { multiplier: 1.9, proteinMultiplier: 2.4, waterMultiplier: 50 },
};

function calculateAge(birthDate: Date | undefined): number {
  if (!birthDate) {
    return 25; // Idade padrão caso não tenha data de nascimento
  }

  const age = Math.floor(
    (new Date().getTime() - birthDate.getTime()) / 31557600000
  );
  return age < 0 ? 0 : age;
}

function calculateBMR(data: OnboardingData): number {
  const age = calculateAge(data.birthDate);

  // Katch-McArdle para atletas (mais precisa para pessoas com baixa gordura)
  if (data.trainingFrequency === "athlete") {
    // LBM = Lean Body Mass (estimado)
    const estimatedBodyFat = data.gender === "masculino" ? 0.15 : 0.25;
    const leanMass = data.weight! * (1 - estimatedBodyFat);
    return 370 + 21.6 * leanMass;
  }

  // Mifflin-St Jeor para outros casos
  const baseBMR = 10 * data.weight! + 6.25 * data.height! - 5 * age;
  return data.gender === "masculino" ? baseBMR + 5 : baseBMR - 161;
}

function getActivityMultiplier(trainingFrequency: string): number {
  // Multiplicadores baseados no TDEE Calculator e estudos científicos
  switch (trainingFrequency) {
    case "sedentary": // Pouca ou nenhuma atividade
      return 1.2;
    case "light": // Exercício leve 1-2x/semana
      return 1.375;
    case "moderate": // Exercício moderado 3-5x/semana
      return 1.55;
    case "heavy": // Exercício intenso 6-7x/semana
      return 1.725;
    case "athlete": // Exercício muito intenso/atletas
      return 1.9;
    default:
      return 1.2;
  }
}

function calculateTDEE(bmr: number, activityMultiplier: number): number {
  return bmr * activityMultiplier;
}

function calculateCalorieTarget(
  tdee: number,
  goal: string,
  weightSpeed: number
): number {
  switch (goal) {
    case "lose":
      return tdee - 500; // Déficit fixo de 500kcal = perda de 0.5kg/semana
    case "gain":
      return tdee + 500; // Superávit fixo de 500kcal = ganho de 0.5kg/semana
    default:
      return tdee;
  }
}

function calculateMacros(
  calories: number,
  weight: number,
  goal: string,
  dietType: string,
  activityLevel: string,
  macroDistribution: MacroDistribution = "moderate"
): MacroNutrients {
  const distributions = {
    moderate: { protein: 30, fat: 35, carbs: 35 },
    lower: { protein: 40, fat: 40, carbs: 20 },
    higher: { protein: 30, fat: 20, carbs: 50 },
  };

  const { protein, fat, carbs } = distributions[macroDistribution];

  return {
    protein: Math.round((calories * protein) / 100 / 4),
    fat: Math.round((calories * fat) / 100 / 9),
    carbs: Math.round((calories * carbs) / 100 / 4),
  };
}

function calculateWaterIntake(weight: number, activityLevel: string): number {
  let baseIntake = weight * 35; // Base: 35ml por kg de peso

  // Ajuste baseado no nível de atividade
  switch (activityLevel) {
    case "sedentary":
      return baseIntake;
    case "light":
      return baseIntake * 1.1; // +10%
    case "moderate":
      return baseIntake * 1.2; // +20%
    case "heavy":
      return baseIntake * 1.4; // +40%
    case "athlete":
      return baseIntake * 1.6; // +60%
    default:
      return baseIntake;
  }
}

function calculateMealFrequency(calories: number, lifestyle: string): number {
  switch (lifestyle) {
    case "sedentary":
      return calories > 2000 ? 4 : 3;
    case "light":
      return calories > 2200 ? 5 : 4;
    case "moderate":
      return calories > 2500 ? 6 : 5;
    case "heavy":
      return calories > 3000 ? 7 : 6;
    case "athlete":
      return 8;
    default:
      return 5;
  }
}

function calculateMicroRequirements(data: OnboardingData): MicroNutrients {
  const baseRequirements = {
    vitaminD: 2000,
    calcium: 1000,
    iron: data.gender === "masculino" ? 8 : 18,
  };

  // Ajustes baseados em idade e nível de atividade
  if (data.trainingFrequency === "athlete") {
    baseRequirements.iron *= 1.3;
  }

  return baseRequirements;
}

function calculateMealTiming(trainingFrequency: string): MealTiming {
  return {
    preworkout: "2-3 horas antes",
    postworkout: "30-60 minutos após",
    mealSpacing: trainingFrequency === "athlete" ? 2.5 : 3,
  };
}

export function createNutritionPlan(data: OnboardingData): NutritionPlan {
  const bmr = calculateBMR(data);
  const activityMultiplier = getActivityMultiplier(data.trainingFrequency!);
  const tdee = calculateTDEE(bmr, activityMultiplier);
  const calorieTarget = calculateCalorieTarget(
    tdee,
    data.goal!,
    data.weightSpeed || 0
  );
  const macros = calculateMacros(
    calorieTarget,
    data.weight!,
    data.goal!,
    data.diet!,
    data.trainingFrequency!,
    data.macroDistribution
  );
  const waterIntake = calculateWaterIntake(
    data.weight!,
    data.trainingFrequency!
  );
  const meals = calculateMealFrequency(calorieTarget, data.trainingFrequency!);

  return {
    calories: Math.round(calorieTarget),
    macros,
    meals,
    waterIntake,
    dietType: data.diet!,
    createdAt: new Date().toISOString(),
  };
}

export function calculateGoalDate(data: OnboardingData): Date | null {
  if (
    !data.weightGoal ||
    !data.weight ||
    !data.weightSpeed ||
    data.goal === "maintain"
  ) {
    return null;
  }

  const weightDiff = Math.abs(data.weightGoal - data.weight);
  const weeksToGoal = weightDiff / data.weightSpeed;
  const daysToGoal = Math.ceil(weeksToGoal * 7);

  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + daysToGoal);

  return goalDate;
}
