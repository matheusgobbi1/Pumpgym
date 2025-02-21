import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";

export type MacroDistribution =
  | "moderate" // Moderate Carb (30/35/35)
  | "lower" // Lower Carb (40/40/20)
  | "higher"; // Higher Carb (30/20/50)

export type TrainingExperience =
  | "beginner" // Iniciante
  | "intermediate" // 6 meses - 2 anos
  | "advanced" // 2+ anos
  | "none"; // Nunca treinou

export type TrainingStyle =
  | "full_body"
  | "upper_lower"
  | "push_pull_legs"
  | "other"
  | "none";

export type TrainingTime =
  | "30_min"
  | "45_min"
  | "60_min"
  | "90_min"
  | "120_min";

export type TrainingGoals =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "weight_loss"
  | "general_fitness";

export type OnboardingData = {
  gender?: "masculino" | "feminino" | "outro";
  birthDate?: Date;
  height?: number;
  weight?: number;
  goal?: "lose" | "maintain" | "gain";
  weightGoal?: number;
  weightSpeed?: number;
  trainingFrequency?:
    | "sedentary" // Trabalho em escritório
    | "light" // 1-2x por semana
    | "moderate" // 3-5x por semana
    | "heavy" // 6-7x por semana
    | "athlete"; // 2x por dia
  diet?: "classic" | "lowcarb" | "vegetarian" | "vegan" | "pescatarian";
  referralSource?:
    | "instagram"
    | "facebook"
    | "tiktok"
    | "youtube"
    | "google"
    | "tv";
  macroDistribution?: MacroDistribution;
  trainingExperience?: TrainingExperience;
  trainingStyle?: TrainingStyle;
  trainingTime?: TrainingTime;
  trainingGoals?: TrainingGoals;
  trainingDays?: number[]; // 0 = domingo, 1 = segunda, etc
};

type ReferralSource =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "google"
  | "tv"
  | null;

type OnboardingAction =
  | { type: "SET_GENDER"; payload: OnboardingData["gender"] }
  | { type: "SET_BIRTH_DATE"; payload: Date }
  | { type: "SET_MEASUREMENTS"; payload: { height: number; weight: number } }
  | { type: "SET_GOAL"; payload: OnboardingData["goal"] }
  | { type: "SET_WEIGHT_GOAL"; payload: number }
  | { type: "SET_WEIGHT_SPEED"; payload: number }
  | {
      type: "SET_TRAINING_FREQUENCY";
      payload: OnboardingData["trainingFrequency"];
    }
  | { type: "SET_DIET"; payload: OnboardingData["diet"] }
  | { type: "SET_REFERRAL_SOURCE"; payload: OnboardingData["referralSource"] }
  | { type: "RESET" }
  | { type: "SET_MACRO_DISTRIBUTION"; payload: MacroDistribution }
  | { type: "SET_TRAINING_EXPERIENCE"; payload: TrainingExperience }
  | { type: "SET_TRAINING_STYLE"; payload: TrainingStyle }
  | { type: "SET_TRAINING_TIME"; payload: TrainingTime }
  | { type: "SET_TRAINING_GOALS"; payload: TrainingGoals }
  | { type: "SET_TRAINING_DAYS"; payload: number[] };

type OnboardingContextType = {
  data: OnboardingData;
  dispatch: React.Dispatch<OnboardingAction>;
};

const initialState: OnboardingData = {
  gender: undefined,
  trainingFrequency: undefined,
  height: undefined,
  weight: undefined,
  birthDate: undefined,
  goal: undefined,
  weightSpeed: undefined,
  diet: undefined,
  macroDistribution: "moderate",
};

function onboardingReducer(
  state: OnboardingData,
  action: OnboardingAction
): OnboardingData {
  switch (action.type) {
    case "SET_GENDER":
      return { ...state, gender: action.payload };
    case "SET_TRAINING_FREQUENCY":
      return { ...state, trainingFrequency: action.payload };
    case "SET_MEASUREMENTS":
      return {
        ...state,
        height: action.payload.height,
        weight: action.payload.weight,
      };
    case "SET_BIRTH_DATE":
      return { ...state, birthDate: action.payload };
    case "SET_GOAL":
      return { ...state, goal: action.payload };
    case "SET_WEIGHT_GOAL":
      return { ...state, weightGoal: action.payload };
    case "SET_WEIGHT_SPEED":
      return { ...state, weightSpeed: action.payload };
    case "SET_DIET":
      return { ...state, diet: action.payload };
    case "SET_REFERRAL_SOURCE":
      return { ...state, referralSource: action.payload };
    case "RESET":
      return initialState;
    case "SET_MACRO_DISTRIBUTION":
      return { ...state, macroDistribution: action.payload };
    case "SET_TRAINING_EXPERIENCE":
      return { ...state, trainingExperience: action.payload };
    case "SET_TRAINING_STYLE":
      return { ...state, trainingStyle: action.payload };
    case "SET_TRAINING_TIME":
      return { ...state, trainingTime: action.payload };
    case "SET_TRAINING_GOALS":
      return { ...state, trainingGoals: action.payload };
    case "SET_TRAINING_DAYS":
      return { ...state, trainingDays: action.payload };
    default:
      return state;
  }
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(onboardingReducer, initialState);

  // Log quando os dados mudam
  useEffect(() => {
    console.log("📝 Estado do Onboarding atualizado:", data);
  }, [data]);

  return (
    <OnboardingContext.Provider value={{ data, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
