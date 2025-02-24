import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { SelectionCard } from "../../components/SelectionCard";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const CURRENT_STEP_BEGINNER = 12;
const CURRENT_STEP_ADVANCED = 9;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

const DIET_OPTIONS = [
  {
    id: "classic" as const,
    title: "Clássica",
    subtitle: "Sem restrições alimentares",
    icon: "food-steak",
  },
  {
    id: "pescatarian" as const,
    title: "Pescetariana",
    subtitle: "Peixes e frutos do mar",
    icon: "fish",
  },
  {
    id: "vegetarian" as const,
    title: "Vegetariana",
    subtitle: "Sem carnes",
    icon: "leaf",
  },
  {
    id: "vegan" as const,
    title: "Vegana",
    subtitle: "100% vegetal",
    icon: "sprout",
  },
] as const;

export default function DietScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();

  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  const currentStep = isAdvancedUser ? CURRENT_STEP_ADVANCED : CURRENT_STEP_BEGINNER;
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  const handleSelect = (diet: typeof DIET_OPTIONS[number]["id"]) => {
    dispatch({
      type: "SET_DIET",
      payload: diet,
    });
  };

  const handleNext = () => {
    router.push("/referral");
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      footer={
        <Button 
          label="Próximo" 
          onPress={handleNext}
          disabled={!data.diet} 
        />
      }
      showBackButton
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Você segue alguma{"\n"}dieta específica?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Isso nos ajuda a personalizar seu plano alimentar
        </Text>
      </View>

      <View style={styles.options}>
        {DIET_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            selected={data.diet === option.id}
            onPress={() => handleSelect(option.id)}
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
                  color={data.diet === option.id ? colors.primary : colors.text}
                />
              </View>
            }
            style={styles.card}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  options: {
    marginTop: 8,
    gap: 8,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
