import { View, Text, StyleSheet, Animated } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../constants/colors";
import { useEffect, useRef } from "react";
import { useSound } from "../hooks/useSound";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const colors = useColors();
  const { playErrorSound } = useSound();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playErrorSound();
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [message]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: `${colors.error}15`,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <MaterialCommunityIcons name="alert" size={20} color={colors.error} />
      <Text style={[styles.message, { color: colors.error }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
});
