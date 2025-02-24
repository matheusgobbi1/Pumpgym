import { OnboardingData } from "../contexts/OnboardingContext";
import { AITrainingPlan } from "../types/training";
import { EXERCISES } from "./exerciseDatabase";
import OpenAI from 'openai';
import Constants from 'expo-constants';

type TrainingStyle = "full_body" | "push_pull_legs" | "upper_lower";

const openai = new OpenAI({
  apiKey: Constants.expoConfig?.extra?.openaiApiKey?.trim()
});

// Tipagem para a resposta da IA
interface AIWorkout {
  name: string;
  focusArea: string;
  exercises: Array<{
    exerciseId?: string;
    name?: string;
    sets?: number;
    reps?: string;
    restTime?: number;
    notes?: string;
  }>;
}

interface AIResponse {
  workouts: AIWorkout[];
  recommendations?: {
    frequency?: number;
    restDays?: number[];
    progression?: string;
    notes?: string;
  };
}

export async function generateTrainingPlan(userData: OnboardingData): Promise<AITrainingPlan> {
  try {
    console.log("🔍 Iniciando geração do plano de treino...");
    console.log("📊 Dados recebidos:", userData);
    
    const trainingStyle = determineTrainingStyle(userData);
    console.log("✅ Estilo de treino:", trainingStyle);

    const trainingDays = userData.trainingDays || [];
    let workouts = [];

    if (trainingStyle === "push_pull_legs") {
      // Dividir os dias em 3 grupos
      const pushDays = trainingDays.slice(0, Math.floor(trainingDays.length / 3));
      const pullDays = trainingDays.slice(Math.floor(trainingDays.length / 3), Math.floor(2 * trainingDays.length / 3));
      const legsDays = trainingDays.slice(Math.floor(2 * trainingDays.length / 3));

      console.log("📅 Distribuição PPL:", {
        push: pushDays,
        pull: pullDays,
        legs: legsDays
      });

      workouts = [
        {
          name: "Treino Push (Peito, Ombro, Tríceps)",
          focusArea: "PUSH",
          exercises: generatePushWorkout(userData),
          scheduledDays: pushDays
        },
        {
          name: "Treino Pull (Costas, Bíceps)",
          focusArea: "PULL",
          exercises: generatePullWorkout(userData),
          scheduledDays: pullDays
        },
        {
          name: "Treino Legs (Pernas, Core)",
          focusArea: "LEGS",
          exercises: generateLegsWorkout(userData),
          scheduledDays: legsDays
        }
      ];
    } else {
      // Full Body para cada dia
      workouts = trainingDays.map((day, index) => ({
        name: `Treino Full Body ${String.fromCharCode(65 + index)}`,
        focusArea: "FULL_BODY",
        exercises: [
          ...generatePushWorkout(userData).slice(0, 2),
          ...generatePullWorkout(userData).slice(0, 2),
          ...generateLegsWorkout(userData).slice(0, 2)
        ],
        scheduledDays: [day]
      }));
    }

    console.log("💪 Treinos gerados:", JSON.stringify(workouts, null, 2));

    return {
      workouts,
      recommendations: {
        frequency: trainingDays.length,
        restDays: Array.from({ length: 7 }).map((_, i) => i).filter(day => !trainingDays.includes(day)),
        progression: "Aumente o peso gradualmente quando conseguir completar todas as séries",
        notes: generateTrainingNotes(userData)
      }
    };
  } catch (error) {
    console.error("❌ Erro ao gerar treino:", error);
    throw error;
  }
}

function generatePushWorkout(userData: OnboardingData) {
  return [
    {
      exerciseId: "bench_press",
      name: "Supino Reto",
      sets: 3,
      reps: "12",
      restTime: 90,
      notes: "Mantenha os cotovelos a 45 graus"
    },
    // ... mais exercícios push
  ];
}

function generatePullWorkout(userData: OnboardingData) {
  return [
    {
      exerciseId: "lat_pulldown",
      name: "Puxada na Polia Alta",
      sets: 3,
      reps: "12",
      restTime: 90,
      notes: "Mantenha as escápulas retraídas"
    },
    // ... mais exercícios pull
  ];
}

function generateLegsWorkout(userData: OnboardingData) {
  return [
    {
      exerciseId: "squat",
      name: "Agachamento",
      sets: 3,
      reps: "12",
      restTime: 90,
      notes: "Mantenha o core contraído"
    },
    // ... mais exercícios legs
  ];
}

function generateTrainingNotes(userData: OnboardingData): string {
  const notes = [
    "Faça aquecimento adequado antes de cada treino",
    "Mantenha uma boa hidratação",
    "Descanse pelo menos 7-8 horas por noite",
    `Foco em ${userData.trainingGoals === 'hypertrophy' ? 'hipertrofia' : 'força'}`
  ];

  return notes.join(". ") + ".";
}

function determineTrainingStyle(userData: OnboardingData): TrainingStyle {
  const trainingDays = userData.trainingDays || [];
  console.log("📅 Analisando dias de treino:", trainingDays.length, "dias");

  // Se não tiver dias suficientes, força Full Body
  if (trainingDays.length < 3) {
    console.log("⚠️ Poucos dias de treino, usando Full Body");
    return "full_body";
  }

  // Para iniciantes
  if (userData.trainingExperience === "none" || userData.trainingExperience === "beginner") {
    // Se tiver 5+ dias, pode fazer PPL
    if (trainingDays.length >= 5) {
      console.log("✅ Iniciante com 5+ dias, usando PPL");
      return "push_pull_legs";
    }
    // Senão, Full Body
    console.log("✅ Iniciante com menos de 5 dias, usando Full Body");
    return "full_body";
  }

  // Para intermediários/avançados
  if (trainingDays.length >= 5) {
    console.log("✅ Intermediário/Avançado com 5+ dias, usando PPL");
    return "push_pull_legs";
  }

  console.log("✅ Usando Full Body por padrão");
  return "full_body";
}

function generatePromptForTrainingStyle(
  style: TrainingStyle, 
  userData: OnboardingData
): string {
  const basePrompt = `
    Como um personal trainer experiente, crie um programa de treino Full Body para um iniciante.
    
    Perfil do Usuário:
    - Experiência: ${userData.trainingExperience}
    - Objetivo: ${userData.goal}
    - Dias disponíveis: ${userData.trainingDays?.join(", ")} (0=Domingo, 6=Sábado)
    
    Regras importantes:
    - Máximo de 6-8 exercícios por treino
    - 2-3 séries por exercício
    - 8-12 repetições por série
    - Foco em exercícios básicos e seguros
    - Incluir aquecimento e dicas de execução
    
    Exercícios disponíveis:
    ${Object.entries(EXERCISES).map(([muscle, exercises]) => `
    ${muscle.toUpperCase()}:
    ${exercises.map(e => `- ${e.name} (ID: ${e.id})`).join('\n')}
    `).join('\n')}

    Responda APENAS com um objeto JSON no seguinte formato:
    {
      "workouts": [
        {
          "name": "Treino Full Body A",
          "focusArea": "FULL_BODY",
          "exercises": [
            {
              "exerciseId": "ID_DO_EXERCICIO",
              "sets": 3,
              "reps": "8-12",
              "restTime": 60,
              "notes": "Dicas de execução aqui"
            }
          ]
        }
      ],
      "recommendations": {
        "frequency": 3,
        "restDays": [0, 3, 6],
        "progression": "Dicas de progressão",
        "notes": "Observações gerais"
      }
    }
  `;

  // Para iniciantes, mantemos o prompt simples
  if (userData.trainingExperience === "none" || userData.trainingExperience === "beginner") {
    return basePrompt;
  }

  // Para intermediários/avançados, adicionamos instruções específicas
  return basePrompt + `
    Considerações adicionais:
    - Maior volume de treino
    - Exercícios mais avançados
    - Técnicas de intensificação
    - Periodização sugerida
  `;
} 