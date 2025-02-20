export interface OnboardingData {
  gender?: "masculino" | "feminino" | "outro";
  birthDate?: Date;
  height?: number;
  weight?: number;
  goal?: "lose" | "maintain" | "gain";
  weightGoal?: number;
  weightSpeed?: number;
  trainingFrequency?: "0-2" | "3-5" | "6+";
  diet?: "classic" | "lowcarb" | "vegetarian" | "vegan" | "pescatarian";
  referralSource?: "instagram" | "facebook" | "tiktok" | "youtube" | "google" | "tv";
} 