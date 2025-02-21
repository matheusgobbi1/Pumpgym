import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { SelectionCard } from "../../components/SelectionCard";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../../constants/colors";
import { Button } from "../../components/Button";

const CURRENT_STEP = 4;
const TOTAL_STEPS = 14;

const TIME_OPTIONS = [
  {
    value: "30_min",
    title: "30 minutos",
    subtitle: "Treino curto e intenso",
    icon: "clock-time-three",
  },
  {
    value: "45_min",
    title: "45 minutos",
    subtitle: "Treino moderado",
    icon: "clock-time-six",
  },
  {
    value: "60_min",
    title: "1 hora",
    subtitle: "Treino completo",
    icon: "clock-time-nine",
  },
  {
    value: "90_min",
    title: "1 hora e 30 minutos",
    subtitle: "Treino extenso",
    icon: "clock",
  },
  {
    value: "120_min",
    title: "2 horas ou mais",
    subtitle: "Treino longo",
    icon: "clock-plus",
  },
] as const;

export default function TrainingTimeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();

  const handleSelect = (time: typeof TIME_OPTIONS[number]["value"]) => {
    dispatch({
      type: "SET_TRAINING_TIME",
      payload: time,
    });
  };

  const handleNext = () => {
    router.push("/training-goals");
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
          disabled={!data.trainingTime} 
        />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Quanto tempo você tem{"\n"}disponível para treinar?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Ajustaremos a intensidade e volume do treino
      </Text>

      <View style={styles.options}>
        {TIME_OPTIONS.map((option) => (
          <SelectionCard
            key={option.value}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.trainingTime === option.value}
            onPress={() => handleSelect(option.value)}
            leftContent={
              <MaterialCommunityIcons
                name={option.icon}
                size={24}
                color={
                  data.trainingTime === option.value
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