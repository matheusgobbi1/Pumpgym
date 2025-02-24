export interface NutritionPlan {
  calories: number;
  createdAt: string;
  dietType: 'classic' | 'ketogenic' | 'vegetarian' | 'vegan';
  macros: {
    carbs: number;
    fat: number;
    protein: number;
  };
  meals: number;
  waterIntake: number;
  recommendations?: {
    mealTiming: string[];
    supplements?: string[];
    notes?: string;
  };
}

export interface MealHistory {
  date: string;
  meals: {
    time: string;
    foods: {
      name: string;
      portion: number;
      calories: number;
      macros: {
        carbs: number;
        fat: number;
        protein: number;
      };
    }[];
  }[];
  waterConsumed: number;
  totalCalories: number;
  macros: {
    carbs: number;
    fat: number;
    protein: number;
  };
}

export interface NutritionProgress {
  date: string;
  weight: number;
  measurements?: {
    waist?: number;
    hip?: number;
    chest?: number;
    // ... outras medidas
  };
  adherence: number; // 0-100%
  notes?: string;
} 