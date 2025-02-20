import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { SelectionCard } from "../../components/SelectionCard";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TOTAL_STEPS = 10;
const CURRENT_STEP = 6;

const GOAL_OPTIONS = [
  {
    id: "lose" as const,
    title: "Perder peso",
    subtitle: "Reduzir medidas e % de gordura",
    icon: "trending-down",
  },
  {
    id: "maintain" as const,
    title: "Manter peso",
    subtitle: "Melhorar composição corporal",
    icon: "trending-neutral",
  },
  {
    id: "gain" as const,
    title: "Ganhar peso",
    subtitle: "Aumentar massa muscular",
    icon: "trending-up",
  },
] as const;

export default function GoalScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();

  const handleNext = () => {
    if (data.goal) {
      router.push("/weight-goal");
    }
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button label="Próximo" onPress={handleNext} disabled={!data.goal} />
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Qual seu objetivo{"\n"}principal?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Vamos personalizar seu plano de acordo
      </Text>

      <View style={styles.options}>
        {GOAL_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.goal === option.id}
            onPress={() =>
              dispatch({
                type: "SET_GOAL",
                payload: option.id,
              })
            }
            leftContent={
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.buttonBackground },
                ]}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={24}
                  color={data.goal === option.id ? colors.primary : colors.text}
                />
              </View>
            }
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
