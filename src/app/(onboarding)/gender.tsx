import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { SelectionCard } from "../../components/SelectionCard";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useColors } from "../../constants/colors";

const TOTAL_STEPS = 10;
const CURRENT_STEP = 1;

const GENDER_OPTIONS = [
  {
    id: "masculino" as const,
    title: "Masculino",
  },
  {
    id: "feminino" as const,
    title: "Feminino",
  },
  {
    id: "outro" as const,
    title: "Outro",
  },
] as const;

export default function GenderScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();

  const handleNext = () => {
    if (data.gender) {
      router.push("/training-frequency");
    }
  };

  const handleBack = () => {
    Alert.alert(
      "Sair do cadastro",
      "Tem certeza que deseja sair? Seu progresso será perdido.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => router.replace("/"),
        },
      ]
    );
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      footer={
        <Button label="Próximo" onPress={handleNext} disabled={!data.gender} />
      }
      onBack={handleBack}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Escolha seu gênero
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso será usado para calibrar seu plano personalizado
      </Text>

      <View style={styles.options}>
        {GENDER_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.title}
            selected={data.gender === option.id}
            onPress={() =>
              dispatch({
                type: "SET_GENDER",
                payload: option.id,
              })
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
});
