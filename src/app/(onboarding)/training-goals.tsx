import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionCard } from "../../components/SelectionCard";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";
import { Button } from "../../components/Button";

const CURRENT_STEP = 5;
const TOTAL_STEPS = 14;

const GOALS_OPTIONS = [
  {
    value: "strength",
    title: "Força",
    subtitle: "Foco em aumentar cargas e força máxima",
    icon: "weight-lifter",
  },
  {
    value: "hypertrophy",
    title: "Hipertrofia",
    subtitle: "Foco em ganho de massa muscular",
    icon: "arm-flex",
  },
  {
    value: "endurance",
    title: "Resistência",
    subtitle: "Foco em maior resistência muscular",
    icon: "run",
  },
  {
    value: "weight_loss",
    title: "Perda de Gordura",
    subtitle: "Foco em definição muscular",
    icon: "fire",
  },
  {
    value: "general_fitness",
    title: "Condicionamento Geral",
    subtitle: "Equilíbrio entre força e resistência",
    icon: "heart-pulse",
  },
] as const;

export default function TrainingGoalsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();

  const handleSelect = (goal: typeof GOALS_OPTIONS[number]["value"]) => {
    dispatch({
      type: "SET_TRAINING_GOALS",
      payload: goal,
    });
  };

  const handleNext = () => {
    router.push("/training-frequency");
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      showBackButton
      footer={
        <Button 
          label="Próximo" 
          onPress={handleNext}
          disabled={!data.trainingGoals} 
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Qual seu principal{"\n"}objetivo no treino?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso definirá o foco do seu programa
      </Text>

      <View style={styles.options}>
        {GOALS_OPTIONS.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.trainingGoals === option.value}
            onPress={() => handleSelect(option.value)}
            leftContent={
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={
                  data.trainingGoals === option.value
                    ? colors.primary
                    : colors.text
                }
              />
            }
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  options: {
    gap: 12,
  },
}); 