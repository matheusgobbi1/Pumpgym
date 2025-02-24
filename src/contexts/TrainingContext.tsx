import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from "react";
import { AITrainingPlan, Exercise, SetData, ExerciseProgress, AIGeneratedWorkout } from "../types/training";
import { getUserPrograms, WorkoutProgram, getUserActiveProgram } from "../services/training";
import { useAuth } from "./AuthContext";
import { useOnboarding } from "./OnboardingContext";
import { ProgressTracker } from '../services/progressTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface TrainingState {
  activeProgram: AITrainingPlan | null;
  isLoading: boolean;
  error: string | null;
  selectedDay: number | null;
}

interface TrainingContextType {
  activeProgram: AITrainingPlan | null;
  isLoading: boolean;
  error: string | null;
  getWorkoutForDay: (day: number) => AIGeneratedWorkout | null;
  isTrainingDay: (day: number) => boolean;
  exerciseProgress: Record<string, ExerciseProgress>;
  finishWorkout: (workoutId: string, exercises: { exerciseId: string; sets: SetData[] }[]) => Promise<boolean>;
  getExerciseProgress: (exerciseId: string) => Promise<ExerciseProgress | null>;
}

type TrainingAction =
  | { type: 'SET_PROGRAM'; payload: AITrainingPlan | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_DAY'; payload: number | null };

const initialState: TrainingState = {
  activeProgram: null,
  isLoading: true,
  error: null,
  selectedDay: new Date().getDay(),
};

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'SET_PROGRAM':
      return { 
        ...state, 
        activeProgram: action.payload,
        error: null 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELECTED_DAY':
      return { ...state, selectedDay: action.payload };
    default:
      return state;
  }
}

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trainingReducer, initialState);
  const { user } = useAuth();
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, ExerciseProgress>>({});

  useEffect(() => {
    const loadProgram = async () => {
      console.log("🔄 TrainingContext - Iniciando carregamento", { userId: user?.uid });
      
      if (!user?.uid) {
        console.log("❌ TrainingContext - Sem usuário");
        dispatch({ type: 'SET_PROGRAM', payload: null });
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Buscar programa
        const program = await getUserActiveProgram(user.uid);
        
        console.log("📥 TrainingContext - Resposta:", {
          hasProgram: !!program,
          workouts: program?.workouts?.length,
          firstWorkout: program?.workouts[0]?.name
        });

        dispatch({ type: 'SET_PROGRAM', payload: program });
      } catch (error) {
        console.error("❌ TrainingContext - Erro:", error);
        dispatch({ type: 'SET_PROGRAM', payload: null });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (user?.uid) {
      loadProgram();
    }
  }, [user?.uid]);

  // Limpar programa quando usuário deslogar
  useEffect(() => {
    if (!user) {
      dispatch({ type: 'SET_PROGRAM', payload: null });
    }
  }, [user]);

  const getWorkoutForDay = (day: number) => {
    if (!state.activeProgram?.workouts) return null;
    return state.activeProgram.workouts.find(w => w.scheduledDays.includes(day)) || null;
  };

  const isTrainingDay = (day: number) => {
    if (!state.activeProgram?.workouts) return false;
    return state.activeProgram.workouts.some(w => w.scheduledDays.includes(day));
  };

  const finishWorkout = async (workoutId: string, exercises: { exerciseId: string; sets: SetData[] }[]) => {
    if (!user) return false;
    
    const success = await ProgressTracker.saveWorkoutProgress(
      user.uid,
      workoutId,
      exercises
    );

    if (success) {
      // Atualizar estado local
      const updatedProgress: Record<string, ExerciseProgress> = {};
      for (const exercise of exercises) {
        const progress = await ProgressTracker.getExerciseProgress(user.uid, exercise.exerciseId);
        if (progress) {
          updatedProgress[exercise.exerciseId] = progress;
        }
      }
      setExerciseProgress(prev => ({ ...prev, ...updatedProgress }));
    }
    return success;
  };

  const getExerciseProgress = async (exerciseId: string) => {
    const progress = await ProgressTracker.getExerciseProgress(user?.uid || '', exerciseId);
    if (progress) {
      setExerciseProgress(prev => ({ ...prev, [exerciseId]: progress }));
    }
    return progress;
  };

  const value = {
    ...state,
    getWorkoutForDay,
    isTrainingDay,
    exerciseProgress,
    finishWorkout,
    getExerciseProgress,
  };

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
} 