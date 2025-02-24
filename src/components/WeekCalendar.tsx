import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MotiView } from '@motify/components';

interface WeekCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isTrainingDay: (date: Date) => boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = (SCREEN_WIDTH - 32) / 7;

export function WeekCalendar({ selectedDate, onSelectDate, isTrainingDay }: WeekCalendarProps) {
  const { theme } = useTheme();
  const today = new Date();
  
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <View style={styles.container}>
      {weekDays.map((date, index) => {
        const isSelected = date.getDay() === selectedDate.getDay();
        const isWorkoutDay = isTrainingDay(date);
        const isToday = isSameDay(date, today);
        
        return (
          <Pressable
            key={index}
            onPress={() => onSelectDate(date)}
            style={[styles.dayButton, { width: DAY_WIDTH }]}
          >
            <MotiView
              animate={{
                scale: isSelected ? 1 : 0.9,
              }}
              style={[
                styles.dayContent,
                isSelected && { backgroundColor: theme.primary + '20' }
              ]}
            >
              {/* Nome do dia */}
              <Text
                style={[
                  styles.dayName,
                  { color: theme.textSecondary },
                  isSelected && { color: theme.primary },
                  isToday && { fontWeight: '700' }
                ]}
              >
                {format(date, 'EEE', { locale: ptBR }).slice(0, 3)}
              </Text>

              {/* Número do dia */}
              <Text
                style={[
                  styles.dayNumber,
                  { color: theme.text },
                  isSelected && { color: theme.primary },
                  isToday && { fontWeight: '700' }
                ]}
              >
                {format(date, 'd')}
              </Text>
              
              {/* Indicador de treino */}
              {isWorkoutDay && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={[
                    styles.workoutDot,
                    { backgroundColor: isSelected ? theme.primary : theme.primary + '40' }
                  ]}
                />
              )}
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dayButton: {
    alignItems: 'center',
  },
  dayContent: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    height: 70,
    justifyContent: 'center',
    width: '100%',
  },
  dayName: {
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '600',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
