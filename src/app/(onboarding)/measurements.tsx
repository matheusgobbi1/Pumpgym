import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import {
  useOnboarding,
  OnboardingData,
} from "../../contexts/OnboardingContext";
import { useState } from "react";
import { validateUserData } from "../../services/validation";
import { ErrorMessage } from "../../components/ErrorMessage";

const TOTAL_STEPS = 10;
const CURRENT_STEP = 5;

export default function MeasurementsScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (height && weight) {
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);

      if (isNaN(heightNum) || isNaN(weightNum)) {
        setError("Por favor, insira valores numéricos válidos");
        return;
      }

      const validationData: OnboardingData = {
        ...data,
        height: heightNum,
        weight: weightNum,
      };

      const errors = validateUserData(validationData);
      const measurementErrors = errors.filter(
        (e) => e.field === "height" || e.field === "weight"
      );

      if (measurementErrors.length > 0) {
        setError(measurementErrors[0].message);
        return;
      }

      dispatch({
        type: "SET_MEASUREMENTS",
        payload: { height: heightNum, weight: weightNum },
      });

      router.push("/goal");
    }
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button
          label="Próximo"
          onPress={handleNext}
          disabled={!height || !weight}
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>Altura & peso</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso será usado para calibrar seu plano personalizado
      </Text>

      {error && <ErrorMessage message={error} />}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Altura (cm)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.buttonBackground,
                color: colors.text,
              },
            ]}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            maxLength={3}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Peso (kg)</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.buttonBackground,
                color: colors.text,
              },
            ]}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            maxLength={3}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
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
  form: {
    marginTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
});
