import { ExerciseData } from "./exerciseDatabase";

type CacheKey = string;
type CachedExercise = {
  id: string;
  name: string;
  targetMuscle: string;
  compound: boolean;
  priority: number;
};

class ExerciseCache {
  private cache: Map<CacheKey, CachedExercise[]>;
  private maxSize: number;
  private expirationTime: number; // em milissegundos

  constructor(maxSize = 100, expirationTimeMinutes = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.expirationTime = expirationTimeMinutes * 60 * 1000;
  }

  generateKey(muscle: string, level: string, count: number): CacheKey {
    return `${muscle}_${level}_${count}`;
  }

  get(key: CacheKey): CachedExercise[] | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Retorna uma cópia profunda para evitar mutações indesejadas
    return JSON.parse(JSON.stringify(entry));
  }

  set(key: CacheKey, exercises: CachedExercise[]): void {
    // Limpa o cache se atingir o tamanho máximo
    if (this.cache.size >= this.maxSize) {
      this.clearOldest();
    }

    // Armazena uma cópia profunda dos exercícios
    this.cache.set(key, JSON.parse(JSON.stringify(exercises)));

    // Configura expiração automática
    setTimeout(() => {
      this.cache.delete(key);
    }, this.expirationTime);
  }

  private clearOldest(): void {
    // Remove a entrada mais antiga do cache
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Exporta uma única instância do cache
export const exerciseCache = new ExerciseCache(); 