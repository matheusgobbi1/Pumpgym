import { ExerciseData } from '../types/exercise';

const WGER_API_URL = 'https://wger.de/api/v2';
const WGER_TOKEN = 'token 798a2cd15731bfc4f958baec8ce8168dd85a79cf';

export async function fetchExercises(): Promise<ExerciseData[]> {
  try {
    console.log("🔍 Iniciando busca de exercícios...");
    
    const response = await fetch(`${WGER_API_URL}/exercise/?language=2&limit=100`, {
      headers: {
        'Authorization': WGER_TOKEN
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📊 Total de exercícios recebidos:", data.results?.length || 0);
    console.log("🔍 Exemplo de exercício recebido:", JSON.stringify(data.results[0], null, 2));

    // Primeiro filtro: remove exercícios sem dados essenciais
    const validExercises = data.results.filter((exercise: any) => {
      const isValid = Boolean(
        exercise?.name && 
        Array.isArray(exercise?.muscles) && 
        Array.isArray(exercise?.equipment)
      );
      
      if (!isValid) {
        console.log("⚠️ Exercício inválido descartado:", exercise?.name || "sem nome");
      }
      
      return isValid;
    });

    console.log("✅ Exercícios válidos encontrados:", validExercises.length);

    // Mapeamento seguro com validação em cada campo
    const processedExercises = validExercises
      .map((exercise: any) => {
        try {
          // Extrai e valida os dados antes de usar
          const muscles = Array.isArray(exercise.muscles) 
            ? exercise.muscles.map((m: any) => String(m?.name || "unknown").toLowerCase())
            : [];
            
          const equipment = Array.isArray(exercise.equipment)
            ? exercise.equipment.map((e: any) => String(e?.name || "unknown").toLowerCase())
            : [];

          const category = exercise.category?.name 
            ? String(exercise.category.name).toLowerCase()
            : "other";

          const result = {
            id: String(exercise.id),
            name: String(exercise.name),
            muscleGroups: muscles,
            levels: ["beginner", "intermediate", "advanced"],
            equipment: equipment,
            compound: muscles.length > 1,
            description: String(exercise.description || ""),
            category: category,
            variations: Array.isArray(exercise.variations) ? exercise.variations : [],
            priority: 1,
            unilateral: false
          };

          console.log("✅ Exercício processado:", result.name);
          return result;

        } catch (error) {
          console.error("❌ Erro ao processar exercício:", {
            error,
            exercise: exercise?.name || "unknown"
          });
          return null;
        }
      })
      .filter(Boolean);

    console.log("📊 Resumo final:", {
      totalRecebidos: data.results?.length || 0,
      validosEncontrados: validExercises.length,
      processadosComSucesso: processedExercises.length
    });

    return processedExercises;

  } catch (error) {
    console.error('❌ Erro ao buscar exercícios:', error);
    return [];
  }
}

// Função para buscar um exercício específico
export async function fetchExerciseById(id: string): Promise<ExerciseData | null> {
  try {
    console.log(`🔍 Buscando exercício ID: ${id}`);
    
    const response = await fetch(`${WGER_API_URL}/exercise/${id}`, {
      headers: {
        'Authorization': WGER_TOKEN
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const exercise = await response.json();
    console.log("📊 Dados do exercício recebido:", JSON.stringify(exercise, null, 2));

    if (!exercise?.name) {
      console.warn("⚠️ Exercício não encontrado:", id);
      return null;
    }

    // Extrai e valida os dados antes de usar
    const muscles = Array.isArray(exercise.muscles) 
      ? exercise.muscles.map((m: any) => String(m?.name || "unknown").toLowerCase())
      : [];
      
    const equipment = Array.isArray(exercise.equipment)
      ? exercise.equipment.map((e: any) => String(e?.name || "unknown").toLowerCase())
      : [];

    const category = exercise.category?.name 
      ? String(exercise.category.name).toLowerCase()
      : "other";

    const result = {
      id: String(exercise.id),
      name: String(exercise.name),
      muscleGroups: muscles,
      levels: ["beginner", "intermediate", "advanced"],
      equipment: equipment,
      compound: muscles.length > 1,
      description: String(exercise.description || ""),
      category: category,
      variations: Array.isArray(exercise.variations) ? exercise.variations : [],
      priority: 1,
      unilateral: false
    };

    console.log("✅ Exercício processado com sucesso:", result.name);
    return result;

  } catch (error) {
    console.error('❌ Erro ao buscar exercício:', error);
    return null;
  }
} 