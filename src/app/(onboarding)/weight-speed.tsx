import React from "react";
import { View, Text, StyleSheet, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import Slider from "@react-native-community/slider";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import {
  useOnboarding,
  OnboardingData,
} from "../../contexts/OnboardingContext";
import { useState, useEffect } from "react";
import { validateUserData } from "../../services/validation";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CURRENT_STEP = 11;
const TOTAL_STEPS = 14;

const GOAL_LABELS = {
  lose: "perder",
  gain: "ganhar",
  maintain: "manter",
};

const SPEED_RANGES = {
  lose: { min: 0.2, max: 1.0, recommended: 0.5 },
  gain: { min: 0.2, max: 1.0, recommended: 0.5 },
  maintain: { min: 0, max: 0, recommended: 0 },
};

const SPEED_FEEDBACK = {
  slow: {
    label: "Conservador",
    description: "Progresso mais lento e sustentável (0.2-0.3kg/semana)",
  },
  recommended: {
    label: "Recomendado",
    description: "Balanceado e efetivo (0.4-0.7kg/semana)",
  },
  fast: {
    label: "Agressivo",
    description: "Mais desafiador e intenso (0.8-1.0kg/semana)",
  },
};

export default function WeightSpeedScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();

  if (!data.goal || data.goal === "maintain") {
    router.push("/diet");
    return null;
  }

  const [speed, setSpeed] = useState(SPEED_RANGES[data.goal].recommended);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (speed) {
      const validationData: OnboardingData = {
        ...data,
        weightSpeed: speed,
      };

      const errors = validateUserData(validationData);
      const speedError = errors.find((e) => e.field === "weightSpeed");

      if (speedError) {
        setError(speedError.message);
        return;
      }

      dispatch({
        type: "SET_WEIGHT_SPEED",
        payload: speed,
      });

      router.push("/diet");
    }
  };

  const range = SPEED_RANGES[data.goal];
  const getFeedback = (currentSpeed: number) => {
    if (currentSpeed < 0.4) return SPEED_FEEDBACK.slow;
    if (currentSpeed <= 0.7) return SPEED_FEEDBACK.recommended;
    return SPEED_FEEDBACK.fast;
  };

  const feedback = getFeedback(speed);

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={<Button label="Próximo" onPress={handleNext} />}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Com que rapidez{"\n"}você deseja {GOAL_LABELS[data.goal]}
        {"\n"}seu objetivo
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {data.goal === "lose" ? "Perda" : "Ganho"} de peso por semana
      </Text>

      <Text style={[styles.value, { color: colors.text }]}>
        {speed.toFixed(1)} kg
      </Text>

      <View style={styles.sliderContainer}>
        <View style={styles.icons}>
          <MaterialCommunityIcons
            name="turtle"
            size={32}
            color={colors.text}
            style={{ opacity: speed < 0.4 ? 1 : 0.3 }}
          />
          <MaterialCommunityIcons
            name="rabbit"
            size={32}
            color={colors.text}
            style={{
              opacity: speed >= 0.4 && speed <= 0.7 ? 1 : 0.3,
            }}
          />
          <MaterialCommunityIcons
            name="rocket"
            size={32}
            color={colors.text}
            style={{ opacity: speed > 0.7 ? 1 : 0.3 }}
          />
        </View>

        <Slider
          style={styles.slider}
          minimumValue={range.min}
          maximumValue={range.max}
          value={range.recommended}
          onValueChange={setSpeed}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.buttonBackground}
          thumbTintColor={colors.primary}
          step={0.1}
        />

        <View style={styles.labels}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {range.min.toFixed(1)} kg
          </Text>
          <Text
            style={[
              styles.label,
              { color: colors.primary, fontWeight: "bold" },
            ]}
          >
            0.4-0.7 kg
          </Text>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {range.max.toFixed(1)} kg
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.recommendedContainer,
          { backgroundColor: colors.buttonBackground },
        ]}
      >
        <Text style={[styles.recommendedLabel, { color: colors.text }]}>
          {feedback.label}
        </Text>
        <Text
          style={[
            styles.recommendedDescription,
            { color: colors.textSecondary },
          ]}
        >
          {feedback.description}
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  value: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  sliderContainer: {
    marginTop: 24,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  label: {
    fontSize: 14,
  },
  recommendedContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  recommendedLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  recommendedDescription: {
    fontSize: 14,
    textAlign: "center",
  },
});
