import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ExerciseCard from '../components/ExerciseCard';

const TrainingScreen = () => {
  const [exercises, setExercises] = useState([]);

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ExerciseCard exercise={item} />
      )}
    />
  );
};

export default TrainingScreen; 