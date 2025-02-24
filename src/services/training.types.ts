// Criar um arquivo de tipos compartilhado
export interface BaseWorkout {
  id: string;
  name: string;
  exercises: Exercise[];
  focusArea: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomWorkout extends BaseWorkout {
  type: 'custom';
}

export interface AIWorkout extends BaseWorkout {
  type: 'ai';
  recommendations: {
    frequency: number;
    restDays: number[];
    progression: string;
    notes: string;
  };
} 