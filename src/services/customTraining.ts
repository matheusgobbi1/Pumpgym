import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface CustomWorkout {
  id: string;
  name: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    restTime: number;
    notes?: string;
  }[];
  focusArea: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function saveCustomWorkout(userId: string, workout: CustomWorkout) {
  const workoutRef = doc(db, "users", userId, "workouts", workout.id);
  await setDoc(workoutRef, {
    ...workout,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
} 