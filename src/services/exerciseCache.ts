import { ExerciseData } from "./exerciseDatabase";

class ExerciseCache {
  private cache = new Map<string, ExerciseData[]>();
  private readonly MAX_CACHE_SIZE = 100;

  generateKey(muscle: string, level: string, count: number): string {
    return `${muscle}_${level}_${count}`;
  }

  get(key: string): ExerciseData[] | undefined {
    return this.cache.get(key);
  }

  set(key: string, exercises: ExerciseData[]): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove a entrada mais antiga
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, exercises);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const exerciseCache = new ExerciseCache(); 