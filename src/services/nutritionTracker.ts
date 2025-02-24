import { db } from '../config/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  getDoc,
  setDoc 
} from 'firebase/firestore';
import { NutritionPlan, MealHistory, NutritionProgress } from '../types/nutrition';

export class NutritionTracker {
  static async saveNutritionPlan(userId: string, plan: NutritionPlan) {
    try {
      const planRef = doc(db, 'users', userId, 'nutritionPlan', 'current');
      await setDoc(planRef, {
        ...plan,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error saving nutrition plan:', error);
      return false;
    }
  }

  static async getNutritionPlan(userId: string): Promise<NutritionPlan | null> {
    try {
      const planRef = doc(db, 'users', userId, 'nutritionPlan', 'current');
      const snapshot = await getDoc(planRef);
      
      if (!snapshot.exists()) {
        return null;
      }
      
      return snapshot.data() as NutritionPlan;
    } catch (error) {
      console.error('Error getting nutrition plan:', error);
      return null;
    }
  }

  static async saveMealHistory(userId: string, meal: MealHistory) {
    try {
      const mealRef = collection(db, 'users', userId, 'nutritionPlan', 'current', 'mealHistory');
      await addDoc(mealRef, {
        ...meal,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error saving meal history:', error);
      return false;
    }
  }

  static async saveNutritionProgress(userId: string, progress: NutritionProgress) {
    try {
      const progressRef = doc(db, 'users', userId, 'nutritionPlan', 'current', 'nutritionProgress', progress.date);
      await setDoc(progressRef, {
        ...progress,
        timestamp: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error saving nutrition progress:', error);
      return false;
    }
  }
} 