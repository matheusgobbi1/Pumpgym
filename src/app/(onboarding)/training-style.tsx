import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionCard } from "../../components/SelectionCard";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";
import { Button } from "../../components/Button";

const CURRENT_STEP = 3;
const TOTAL_STEPS = 14;

const STYLE_OPTIONS = [
  {
    value: "full_body",
    title: "Full Body",
    subtitle: "Treino do corpo inteiro em cada sessão",
    icon: "human",
  },
  {
    value: "upper_lower",
    title: "Upper Lower",
    subtitle: "Alternando entre superior e inferior",
    icon: "human-handsup",
  },
  {
    value: "push_pull_legs",
    title: "Push Pull Legs",
    subtitle: "Dividido em empurrar, puxar e pernas",
    icon: "arm-flex",
  },
  {
    value: "other",
    title: "Outro",
    subtitle: "Um treino diferente dos listados",
    icon: "dots-horizontal",
  },
] as const;

export default function TrainingStyleScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();

  const handleSelect = (style: (typeof STYLE_OPTIONS)[number]["value"]) => {
    dispatch({
      type: "SET_TRAINING_STYLE",
      payload: style,
    });
  };

  const handleNext = () => {
    router.push("/training-time");
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
          disabled={!data.trainingStyle}
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Como você costuma{"\n"}dividir seu treino?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Selecione o estilo que mais se aproxima do seu treino atual
      </Text>

      <View style={styles.options}>
        {STYLE_OPTIONS.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.trainingStyle === option.value}
            onPress={() => handleSelect(option.value)}
            leftContent={
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={
                  data.trainingStyle === option.value
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
