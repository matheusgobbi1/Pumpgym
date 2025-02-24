import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Exercise } from '../types/Exercise';

const PRESET_TIMES = [
  { time: 30, icon: '🔥', label: 'Curto' },
  { time: 60, icon: '⚡', label: 'Médio' },
  { time: 90, icon: '💪', label: 'Longo' },
  { time: 120, icon: '🏋️', label: 'Extra' },
];

interface RestTimerProps {
  exercise: Exercise;
  onComplete: () => void;
  onSkip: () => void;
  isVisible: boolean;
  intensity: string;
}

export function RestTimer({ exercise, onComplete, onSkip, isVisible, intensity }: RestTimerProps) {
  const insets = useSafeAreaInsets();
  const [selectedTime, setSelectedTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(selectedTime);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Animação do progresso
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: timeLeft * 1000,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleTimeSelect = (time: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTime(time);
    setTimeLeft(time);
    setIsRunning(false);
    progressAnim.setValue(1);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: 50 }}
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 20,
          bottom: 0,
        }
      ]}
    >
      <View style={styles.presets}>
        {PRESET_TIMES.map((preset) => (
          <Pressable
            key={preset.time}
            style={[
              styles.presetButton,
              selectedTime === preset.time && styles.presetButtonActive
            ]}
            onPress={() => handleTimeSelect(preset.time)}
          >
            <Text style={styles.presetIcon}>{preset.icon}</Text>
            <Text style={styles.presetTime}>{preset.time}s</Text>
            <Text style={styles.presetLabel}>{preset.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Animated.View
          style={[
            styles.progressRing,
            {
              backgroundColor: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.primary + '20', colors.primary]
              })
            }
          ]}
        />
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.labelText}>Tempo Restante</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.button} onPress={onSkip}>
          <Ionicons name="close-circle" size={32} color={colors.textSecondary} />
          <Text style={styles.buttonText}>Pular</Text>
        </Pressable>

        <Pressable style={styles.mainButton} onPress={toggleTimer}>
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={32}
            color={colors.white}
          />
        </Pressable>

        <Pressable style={styles.button} onPress={() => handleTimeSelect(selectedTime)}>
          <Ionicons name="refresh" size={32} color={colors.textSecondary} />
          <Text style={styles.buttonText}>Reiniciar</Text>
        </Pressable>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  presetButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.background + '20',
  },
  presetButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  presetIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  presetTime: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  presetLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    opacity: 0.2,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  labelText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    alignItems: 'center',
  },
  mainButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
}); 