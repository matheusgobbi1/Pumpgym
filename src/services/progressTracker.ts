import { db } from '../config/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  getDoc,
  getDocs, 
  query, 
  where,
  orderBy,
  setDoc 
} from 'firebase/firestore';
import { SetData, ExerciseHistory, ExerciseProgress } from '../types/training';

export class ProgressTracker {
  static async saveWorkoutProgress(userId: string, workoutId: string, exercises: { 
    exerciseId: string; 
    sets: SetData[] 
  }[]) {
    try {
      const timestamp = Date.now();
      
      // 1. Validar dados
      if (!userId || !exercises.length) {
        console.error('Invalid data:', { userId, exercisesCount: exercises.length });
        return false;
      }

      // 2. Salvar histórico do treino
      const workoutHistoryRef = collection(db, 'users', userId, 'workoutHistory');
      
      const workoutData = {
        workoutId: workoutId || `workout_${timestamp}`,
        exercises: exercises.map(ex => ({
          ...ex,
          sets: ex.sets.map(set => ({
            ...set,
            timestamp: set.timestamp || timestamp
          }))
        })),
        timestamp,
        date: new Date().toISOString()
      };

      const docRef = await addDoc(workoutHistoryRef, workoutData);

      // 3. Atualizar progresso de cada exercício
      const progressUpdates = exercises.map(exercise => 
        this.updateExerciseProgress(userId, exercise.exerciseId, exercise.sets)
      );

      await Promise.all(progressUpdates);

      console.log('Workout saved successfully:', docRef.id);
      return true;
    } catch (error) {
      console.error('Error saving workout:', error);
      return false;
    }
  }

  static async getExerciseProgress(userId: string, exerciseId: string): Promise<ExerciseProgress | null> {
    try {
      const progressRef = doc(db, 'users', userId, 'exerciseProgress', exerciseId);
      const snapshot = await getDoc(progressRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.data() as ExerciseProgress;
    } catch (error) {
      console.error('Error getting exercise progress:', error);
      return null;
    }
  }

  static async updateExerciseProgress(userId: string, exerciseId: string, sets: SetData[]) {
    try {
      const progressRef = doc(db, 'users', userId, 'exerciseProgress', exerciseId);
      const maxSet = this.findMaxSet(sets);
      
      // Buscar progresso atual
      const currentProgress = await this.getExerciseProgress(userId, exerciseId);
      const previousMax = currentProgress?.personalBest;

      const updatedProgress: ExerciseProgress = {
        exerciseId,
        history: [...(currentProgress?.history || []), {
          exerciseId,
          sets,
          date: Date.now(),
          workoutId: 'current'
        }],
        personalBest: this.updatePersonalBest(previousMax, maxSet),
        lastPerformance: sets,
        suggestedProgress: this.calculateSuggestedProgress(sets, currentProgress?.history || [])
      };

      await setDoc(progressRef, updatedProgress);
      return updatedProgress;
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      return null;
    }
  }

  private static findMaxSet(sets: SetData[]): SetData {
    return sets.reduce((max, set) => {
      const currentVolume = set.weight * set.reps;
      const maxVolume = max.weight * max.reps;
      return currentVolume > maxVolume ? set : max;
    }, sets[0]);
  }

  private static updatePersonalBest(previous: any, current: SetData) {
    if (!previous) return {
      weight: current.weight,
      reps: current.reps,
      date: Date.now()
    };

    const previousVolume = previous.weight * previous.reps;
    const currentVolume = current.weight * current.reps;

    return currentVolume > previousVolume ? {
      weight: current.weight,
      reps: current.reps,
      date: Date.now()
    } : previous;
  }

  private static calculateSuggestedProgress(currentSets: SetData[], history: ExerciseHistory[]) {
    const lastSet = currentSets[currentSets.length - 1];
    const suggestedWeight = Math.round((lastSet.weight + 2.5) * 10) / 10;

    return {
      weight: suggestedWeight,
      reps: lastSet.reps,
      reason: "Aumento gradual de carga baseado no último treino"
    };
  }
} 