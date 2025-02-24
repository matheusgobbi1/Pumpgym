import React, { useState } from 'react';
import { View } from 'react-native';
import { CustomWorkout } from '../services/customTraining';

export function WorkoutBuilder({ 
  initialWorkout,
  onSave 
}: {
  initialWorkout?: CustomWorkout;
  onSave: (workout: CustomWorkout) => void;
}) {
  const [exercises, setExercises] = useState<CustomWorkout['exercises']>([]);
  
  // Interface para adicionar/editar exercícios
  // ...

  return (
    <View>
      {/* UI para construir treino */}
    </View>
  );
} 