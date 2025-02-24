export interface ExerciseData {
  id: string;
  name: string;
  muscleGroups: string[];
  levels: ("beginner" | "intermediate" | "advanced")[];
  equipment: string[];
  compound: boolean;
  description: string;
  category: string;
  variations: number[];
  priority?: number;
  unilateral?: boolean;
} 