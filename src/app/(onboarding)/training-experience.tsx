import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionCard } from "../../components/SelectionCard";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";
import { Button } from "../../components/Button";

const CURRENT_STEP = 2;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

const EXPERIENCE_OPTIONS = [
  {
    value: "none",
    title: "Nunca treinei",
    subtitle: "Primeira vez em uma academia",
    icon: "weight-lifter",
  },
  {
    value: "beginner",
    title: "Iniciante",
    subtitle: "Menos de 6 meses de treino",
    icon: "dumbbell",
  },
  {
    value: "intermediate",
    title: "Intermediário",
    subtitle: "6 meses a 2 anos de treino",
    icon: "arm-flex",
  },
  {
    value: "advanced",
    title: "Avançado",
    subtitle: "Mais de 2 anos de treino",
    icon: "weight",
  },
] as const;

export default function TrainingExperienceScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();
  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  const handleSelect = (
    experience: (typeof EXPERIENCE_OPTIONS)[number]["value"]
  ) => {
    dispatch({
      type: "SET_TRAINING_EXPERIENCE",
      payload: experience,
    });
  };

  const handleNext = () => {
    if (["intermediate", "advanced"].includes(data.trainingExperience)) {
      dispatch({
        type: "SET_TRAINING_STYLE",
        payload: "other"
      });
      dispatch({
        type: "SET_TRAINING_TIME",
        payload: "60_min"
      });
      dispatch({
        type: "SET_TRAINING_GOALS",
        payload: "general_fitness"
      });
      
      router.push("/training-frequency");
    } else {
      if (data.trainingExperience === "none") {
        router.push("/training-time");
      } else {
        router.push("/training-style");
      }
    }
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={totalSteps}
      showBackButton
      footer={
        <Button
          label="Próximo"
          onPress={handleNext}
          disabled={!data.trainingExperience}
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Qual sua experiência{"\n"}com musculação?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso nos ajudará a personalizar seu programa
      </Text>

      <View style={styles.options}>
        {EXPERIENCE_OPTIONS.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.trainingExperience === option.value}
            onPress={() => handleSelect(option.value)}
            leftContent={
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={
                  data.trainingExperience === option.value
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
