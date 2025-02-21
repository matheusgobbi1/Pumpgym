import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { colors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useState } from "react";
import { ErrorMessage } from "../../components/ErrorMessage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TOTAL_STEPS = 14;
const CURRENT_STEP = 10;

export default function WeightGoalScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const [weightGoal, setWeightGoal] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    const goalWeight = parseFloat(weightGoal);

    if (data.goal === "maintain") {
      dispatch({
        type: "SET_WEIGHT_GOAL",
        payload: data.weight!,
      });
      router.push("/weight-speed");
      return;
    }

    // Validações
    if (data.goal === "lose") {
      if (goalWeight >= data.weight!) {
        setError("Meta de peso deve ser menor que seu peso atual");
        return;
      }
      if (goalWeight < data.weight! * 0.7) {
        setError("Meta muito baixa. Considere uma meta mais saudável");
        return;
      }
    } else if (data.goal === "gain") {
      if (goalWeight <= data.weight!) {
        setError("Meta de peso deve ser maior que seu peso atual");
        return;
      }
      if (goalWeight > data.weight! * 1.3) {
        setError("Meta muito alta. Considere uma meta mais gradual");
        return;
      }
    }

    setError(null);
    dispatch({
      type: "SET_WEIGHT_GOAL",
      payload: goalWeight,
    });
    router.push("/weight-speed");
  };

  const getRecommendedRange = () => {
    if (!data.weight || !data.goal) return null;

    if (data.goal === "lose") {
      const min = Math.round(data.weight * 0.7);
      const max = Math.round(data.weight * 0.9);
      return `${min}kg - ${max}kg`;
    } else if (data.goal === "gain") {
      const min = Math.round(data.weight * 1.1);
      const max = Math.round(data.weight * 1.3);
      return `${min}kg - ${max}kg`;
    }
    return null;
  };

  const recommendedRange = getRecommendedRange();

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          label="Próximo"
          onPress={handleNext}
          disabled={!weightGoal && data.goal !== "maintain"}
        />
      }
    >
      <Text style={styles.title}>
        {data.goal === "maintain"
          ? "Ótimo!\nVamos manter seu\npeso atual"
          : "Qual seu\npeso meta?"}
      </Text>

      {data.goal !== "maintain" && (
        <>
          <Text style={styles.subtitle}>
            Defina uma meta realista para alcançar resultados sustentáveis
          </Text>

          {error && <ErrorMessage message={error} />}

          <View style={styles.form}>
            <Text style={styles.label}>Peso Meta (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weightGoal}
              onChangeText={setWeightGoal}
              placeholder={data.weight?.toString()}
              maxLength={3}
              placeholderTextColor={colors.textSecondary}
            />

            {recommendedRange && (
              <Text style={styles.recommendation}>
                Faixa recomendada: {recommendedRange}
              </Text>
            )}

            <View style={styles.tipCard}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.tipText}>
                Uma meta realista ajuda a manter a motivação e alcançar
                resultados duradouros. Considere mudanças graduais de 5-15% do
                seu peso atual.
              </Text>
            </View>
          </View>
        </>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  form: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  recommendation: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
