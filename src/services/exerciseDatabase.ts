import { Exercise } from "./training";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core";

export interface ExerciseData {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  muscleGroups: string[];
  levels: ("beginner" | "intermediate" | "advanced")[];
  equipment: ("bodyweight" | "dumbbell" | "barbell" | "machine" | "cable")[];
  compound: boolean;
  unilateral: boolean;
  priority: number;
  videoUrl?: string;
  tips?: string[];
}

export interface ExerciseLevel {
  beginner: string;
  intermediate: string;
  advanced: string;
}

export const EXERCISES: Record<MuscleGroup, ExerciseData[]> = {
  chest: [
    {
      id: "bench_press",
      name: "Supino Reto",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: true,
      unilateral: false,
      priority: 5,
      tips: [
        "Mantenha os cotovelos em 45 graus",
        "Controle a descida",
        "Respire durante o movimento",
      ],
    },
    {
      id: "incline_press",
      name: "Supino Inclinado",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: true,
      unilateral: false,
      priority: 4,
      tips: ["Mantenha o banco entre 30-45 graus"],
    },
    {
      id: "decline_press",
      name: "Supino Declinado",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: true,
      unilateral: false,
      priority: 3,
    },
    {
      id: "dumbbell_fly",
      name: "Crucifixo com Halteres",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["beginner", "intermediate"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
    {
      id: "cable_crossover",
      name: "Cross-over na Polia",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["cable"],
      compound: false,
      unilateral: true,
      priority: 2,
    },
    {
      id: "push_up",
      name: "Flexão de Braço",
      targetMuscle: "chest",
      muscleGroups: ["chest", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["bodyweight"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
  ],
  back: [
    {
      id: "lat_pulldown",
      name: "Puxada na Polia Alta",
      targetMuscle: "back",
      muscleGroups: ["back", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["cable"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "bent_over_row",
      name: "Remada Curvada com Barra",
      targetMuscle: "back",
      muscleGroups: ["back", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "one_arm_dumbbell_row",
      name: "Remada Unilateral com Halteres",
      targetMuscle: "back",
      muscleGroups: ["back", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: true,
      unilateral: true,
      priority: 4,
    },
    {
      id: "seated_cable_row",
      name: "Remada Sentado na Máquina",
      targetMuscle: "back",
      muscleGroups: ["back", "shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["cable"],
      compound: true,
      unilateral: false,
      priority: 4,
    },
    {
      id: "deadlift",
      name: "Levantamento Terra",
      targetMuscle: "back",
      muscleGroups: ["back", "legs"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "back_extension",
      name: "Hiperextensão Lombar",
      targetMuscle: "back",
      muscleGroups: ["back", "core"],
      levels: ["beginner", "intermediate"],
      equipment: ["machine", "bodyweight"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
  ],
  shoulders: [
    {
      id: "military_press",
      name: "Desenvolvimento Militar",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "lateral_raise",
      name: "Elevação Lateral com Halteres",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 4,
    },
    {
      id: "front_raise",
      name: "Elevação Frontal com Halteres",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["beginner", "intermediate"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 3,
    },
    {
      id: "reverse_fly",
      name: "Elevação Posterior",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["beginner", "intermediate"],
      equipment: ["dumbbell", "machine"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
    {
      id: "arnold_press",
      name: "Arnold Press",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: true,
      unilateral: false,
      priority: 4,
    },
    {
      id: "upright_row",
      name: "Remada Vertical",
      targetMuscle: "shoulders",
      muscleGroups: ["shoulders", "triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "cable"],
      compound: true,
      unilateral: false,
      priority: 3,
    },
  ],
  biceps: [
    {
      id: "barbell_curl",
      name: "Rosca Direta com Barra",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell"],
      compound: false,
      unilateral: false,
      priority: 5,
      tips: [
        "Mantenha os cotovelos junto ao corpo",
        "Evite usar impulso do corpo",
      ],
    },
    {
      id: "alternate_dumbbell_curl",
      name: "Rosca Alternada com Halteres",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 4,
    },
    {
      id: "hammer_curl",
      name: "Rosca Martelo",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 4,
    },
    {
      id: "concentration_curl",
      name: "Rosca Concentrada",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 3,
    },
    {
      id: "preacher_curl",
      name: "Rosca Scott",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: false,
      unilateral: false,
      priority: 4,
    },
    {
      id: "twenty_one_curl",
      name: "Rosca 21",
      targetMuscle: "biceps",
      muscleGroups: ["biceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: false,
      unilateral: false,
      priority: 2,
      tips: ["7 repetições parciais baixas, 7 altas e 7 completas"],
    },
  ],
  triceps: [
    {
      id: "triceps_pushdown",
      name: "Tríceps na Polia Alta",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["cable"],
      compound: false,
      unilateral: false,
      priority: 5,
    },
    {
      id: "skull_crusher",
      name: "Tríceps Testa",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: false,
      unilateral: false,
      priority: 4,
      tips: ["Mantenha os cotovelos apontados para cima"],
    },
    {
      id: "dips",
      name: "Mergulho",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["intermediate", "advanced"],
      equipment: ["bodyweight"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "overhead_extension",
      name: "Extensão Unilateral com Halter",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["beginner", "intermediate"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 3,
    },
    {
      id: "triceps_kickback",
      name: "Tríceps Coice",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["beginner", "intermediate"],
      equipment: ["dumbbell"],
      compound: false,
      unilateral: true,
      priority: 3,
    },
    {
      id: "rope_pushdown",
      name: "Extensão de Tríceps na Corda",
      targetMuscle: "triceps",
      muscleGroups: ["triceps"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["cable"],
      compound: false,
      unilateral: false,
      priority: 4,
    },
  ],
  legs: [
    {
      id: "squat",
      name: "Agachamento Livre",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["barbell"],
      compound: true,
      unilateral: false,
      priority: 5,
      tips: [
        "Mantenha o peito erguido",
        "Joelhos alinhados com os pés",
        "Desça até a paralela ou abaixo",
      ],
    },
    {
      id: "leg_press",
      name: "Leg Press",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["machine"],
      compound: true,
      unilateral: false,
      priority: 5,
    },
    {
      id: "lunges",
      name: "Afundo com Halteres",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbell", "bodyweight"],
      compound: true,
      unilateral: true,
      priority: 4,
    },
    {
      id: "romanian_deadlift",
      name: "Stiff",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["intermediate", "advanced"],
      equipment: ["barbell", "dumbbell"],
      compound: true,
      unilateral: false,
      priority: 5,
      tips: ["Mantenha as pernas levemente flexionadas"],
    },
    {
      id: "leg_extension",
      name: "Extensão de Pernas",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["machine"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
    {
      id: "leg_curl",
      name: "Flexão de Pernas",
      targetMuscle: "legs",
      muscleGroups: ["legs"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["machine"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
  ],
  core: [
    {
      id: "plank",
      name: "Prancha",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["beginner", "intermediate", "advanced"],
      equipment: ["bodyweight"],
      compound: true,
      unilateral: false,
      priority: 5,
      tips: ["Mantenha o corpo alinhado", "Contraia o abdômen"],
    },
    {
      id: "crunch",
      name: "Abdominal Crunch",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["beginner", "intermediate"],
      equipment: ["bodyweight"],
      compound: false,
      unilateral: false,
      priority: 4,
    },
    {
      id: "leg_raise",
      name: "Elevação de Pernas",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["intermediate", "advanced"],
      equipment: ["bodyweight"],
      compound: false,
      unilateral: false,
      priority: 4,
    },
    {
      id: "russian_twist",
      name: "Abdominal Oblíquo",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["beginner", "intermediate"],
      equipment: ["bodyweight", "dumbbell"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
    {
      id: "swiss_ball_crunch",
      name: "Crunch na Bola Suíça",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["beginner", "intermediate"],
      equipment: ["bodyweight"],
      compound: false,
      unilateral: false,
      priority: 3,
    },
    {
      id: "reverse_crunch",
      name: "Abdominal Reverso",
      targetMuscle: "core",
      muscleGroups: ["core"],
      levels: ["intermediate", "advanced"],
      equipment: ["bodyweight"],
      compound: false,
      unilateral: false,
      priority: 4,
    },
  ],
};

// Funções auxiliares para seleção de exercícios
export function getExercisesForLevel(
  muscle: MuscleGroup,
  level: ExerciseLevel
): ExerciseData[] {
  return EXERCISES[muscle].filter((ex) => ex.levels.includes(level));
}

export function getCompoundExercises(
  muscle: MuscleGroup,
  level: ExerciseLevel
): ExerciseData[] {
  return getExercisesForLevel(muscle, level).filter((ex) => ex.compound);
}

export function getIsolationExercises(
  muscle: MuscleGroup,
  level: ExerciseLevel
): ExerciseData[] {
  return getExercisesForLevel(muscle, level).filter((ex) => !ex.compound);
}

// Funções auxiliares para filtrar exercícios baseados em:
export function getExercisesByEquipment(
  muscle: MuscleGroup,
  equipment: string[]
): ExerciseData[] {
  return EXERCISES[muscle].filter((ex) =>
    ex.equipment.some((eq) => equipment.includes(eq))
  );
}

export function getProgressionExercises(
  muscle: MuscleGroup,
  currentExercise: string
): ExerciseData[] {
  const current = EXERCISES[muscle].find((ex) => ex.id === currentExercise);
  if (!current) return [];

  return EXERCISES[muscle].filter((ex) =>
    ex.levels.some((l) => current.levels.indexOf(l) < ex.levels.indexOf(l))
  );
}
