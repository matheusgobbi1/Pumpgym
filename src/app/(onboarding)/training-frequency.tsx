import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { SelectionCard } from "../../components/SelectionCard";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CURRENT_STEP_BEGINNER = 6;
const CURRENT_STEP_ADVANCED = 3;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

const TRAINING_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentário",
    subtitle: "Trabalho em escritório, pouca atividade física",
    icon: "briefcase-outline",
  },
  {
    value: "light",
    label: "Exercício Leve",
    subtitle: "1-2 dias por semana",
    icon: "walk",
  },
  {
    value: "moderate",
    label: "Exercício Moderado",
    subtitle: "3-5 dias por semana",
    icon: "run",
  },
  {
    value: "heavy",
    label: "Exercício Intenso",
    subtitle: "6-7 dias por semana",
    icon: "weight-lifter",
  },
  {
    value: "athlete",
    label: "Atleta",
    subtitle: "Treinos intensos 2x por dia",
    icon: "medal-outline",
  },
] as const;

export default function TrainingFrequencyScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();
  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  
  const currentStep = isAdvancedUser ? CURRENT_STEP_ADVANCED : CURRENT_STEP_BEGINNER;
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  const handleSelect = (
    frequency: (typeof TRAINING_OPTIONS)[number]["value"]
  ) => {
    dispatch({
      type: "SET_TRAINING_FREQUENCY",
      payload: frequency,
    });
  };

  const handleNext = () => {
    if (isAdvancedUser) {
      router.push("/birth-date");
    } else {
      router.push("/training-days");
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      footer={
        <Button
          label="Próximo"
          onPress={handleNext}
          disabled={!data.trainingFrequency}
        />
      }
      showBackButton
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Qual seu nível de{"\n"}atividade física?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso será usado para calibrar seu plano personalizado
      </Text>

      <View style={styles.options}>
        {TRAINING_OPTIONS.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.label}
            subtitle={option.subtitle}
            selected={data.trainingFrequency === option.value}
            leftContent={
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={colors.text}
              />
            }
            onPress={() => handleSelect(option.value)}
          />
        ))}
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
  options: {
    marginTop: 24,
    gap: 12,
  },
});
