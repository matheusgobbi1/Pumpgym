import React, { forwardRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Exercise, SetData } from '../types/training';

interface ExerciseBottomSheetProps {
  exercise: Exercise | null;
  onSetComplete: (exerciseId: string, setIndex: number, setData: SetData) => void;
  completedSets: SetData[];
  lastWeekSets?: SetData[];
}

const DEFAULT_SET_DATA: SetData = {
  weight: 0,
  reps: 0,
  timestamp: Date.now(),
};

export const ExerciseBottomSheet = forwardRef<BottomSheetModal, ExerciseBottomSheetProps>(
  ({ exercise, onSetComplete, completedSets, lastWeekSets }, ref) => {
    const { theme } = useTheme();
    const snapPoints = ['85%'];
    const [activeSetIndex, setActiveSetIndex] = useState<number | null>(null);
    const [currentSetData, setCurrentSetData] = useState<SetData>(DEFAULT_SET_DATA);

    useEffect(() => {
      setCurrentSetData(DEFAULT_SET_DATA);
      setActiveSetIndex(null);
    }, [exercise?.exerciseId]);

    if (!exercise) return null;

    const handleSetPress = (setIndex: number) => {
      setActiveSetIndex(setIndex);
      setCurrentSetData(DEFAULT_SET_DATA);
      
      const lastWeekSet = lastWeekSets?.[setIndex];
      if (lastWeekSet) {
        setCurrentSetData(lastWeekSet);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleSetComplete = () => {
      if (activeSetIndex === null || !exercise) return;
      
      const setData: SetData = {
        ...currentSetData,
        timestamp: Date.now()
      };

      onSetComplete(exercise.exerciseId, activeSetIndex, setData);
      setActiveSetIndex(null);
      setCurrentSetData(DEFAULT_SET_DATA);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={[theme.primary + '20', 'transparent']}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>
                {exercise.name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Meta: {exercise.sets} séries • {exercise.reps} repetições
              </Text>
            </View>
          </LinearGradient>

          {/* Sets */}
          <View style={styles.setsContainer}>
            {[...Array(exercise.sets)].map((_, index) => {
              const isCompleted = completedSets[index];
              const isActive = activeSetIndex === index;
              const lastWeekSet = lastWeekSets?.[index];

              return (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ duration: index * 100 }}
                >
                  <Pressable
                    onPress={() => handleSetPress(index)}
                    style={({ pressed }) => [
                      styles.setCard,
                      { backgroundColor: theme.backgroundSecondary },
                      isActive && { borderColor: theme.primary, borderWidth: 1 },
                      pressed && { opacity: 0.9 }
                    ]}
                  >
                    <View style={styles.setInfo}>
                      <Text style={[styles.setText, { color: theme.text }]}>
                        Série {index + 1}
                      </Text>
                      {lastWeekSet && (
                        <Text style={[styles.lastWeekText, { color: theme.textSecondary }]}>
                          Semana anterior: {lastWeekSet.weight}kg × {lastWeekSet.reps}
                        </Text>
                      )}
                    </View>

                    {isCompleted ? (
                      <View style={styles.completedSet}>
                        <Text style={[styles.weightText, { color: theme.success }]}>
                          {completedSets[index].weight}kg × {completedSets[index].reps}
                        </Text>
                        {completedSets[index].rpe && (
                          <Text style={[styles.rpeText, { color: theme.textSecondary }]}>
                            RPE {completedSets[index].rpe}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <MaterialCommunityIcons 
                        name={isActive ? "check-circle" : "plus-circle-outline"}
                        size={24} 
                        color={isActive ? theme.primary : theme.textSecondary} 
                      />
                    )}
                  </Pressable>

                  {isActive && (
                    <MotiView
                      from={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 300 }}
                      style={[styles.setInputContainer, { backgroundColor: theme.backgroundSecondary }]}
                    >
                      <View style={styles.inputRow}>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                            Peso (kg)
                          </Text>
                          <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            keyboardType="numeric"
                            value={currentSetData.weight.toString()}
                            onChangeText={(text) => setCurrentSetData(prev => ({ ...prev, weight: Number(text) || 0 }))}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                            Reps
                          </Text>
                          <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            keyboardType="numeric"
                            value={currentSetData.reps.toString()}
                            onChangeText={(text) => setCurrentSetData(prev => ({ ...prev, reps: Number(text) || 0 }))}
                          />
                        </View>
                        <View style={styles.inputGroup}>
                          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                            RPE
                          </Text>
                          <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                            keyboardType="numeric"
                            placeholder="0-10"
                            value={currentSetData.rpe?.toString() || ''}
                            onChangeText={(text) => setCurrentSetData(prev => ({ ...prev, rpe: Number(text) || undefined }))}
                          />
                        </View>
                      </View>
                      <Pressable
                        onPress={handleSetComplete}
                        style={[styles.completeButton, { backgroundColor: theme.primary }]}
                      >
                        <Text style={styles.completeButtonText}>
                          Completar Série
                        </Text>
                      </Pressable>
                    </MotiView>
                  )}
                </MotiView>
              );
            })}
          </View>

          {/* Notas do exercício */}
          {exercise.notes && (
            <View style={[styles.notesCard, { backgroundColor: theme.backgroundSecondary }]}>
              <MaterialCommunityIcons name="information" size={20} color={theme.primary} />
              <Text style={[styles.notesText, { color: theme.textSecondary }]}>
                {exercise.notes}
              </Text>
            </View>
          )}
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 0,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  setsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  setInfo: {
    flex: 1,
  },
  setText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastWeekText: {
    fontSize: 12,
    marginTop: 2,
  },
  weightTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  weightText: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  setInputContainer: {
    padding: 16,
    marginTop: -8,
    marginBottom: 8,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  completeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedSet: {
    alignItems: 'flex-end',
  },
  rpeText: {
    fontSize: 12,
    marginTop: 2,
  },
}); 