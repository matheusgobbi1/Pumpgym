import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";

const CURRENT_STEP_BEGINNER = 6;
const CURRENT_STEP_ADVANCED = 3;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

const WEEK_DAYS = [
  { id: 0, name: "Domingo", short: "Dom" },
  { id: 1, name: "Segunda", short: "Seg" },
  { id: 2, name: "Terça", short: "Ter" },
  { id: 3, name: "Quarta", short: "Qua" },
  { id: 4, name: "Quinta", short: "Qui" },
  { id: 5, name: "Sexta", short: "Sex" },
  { id: 6, name: "Sábado", short: "Sáb" },
] as const;

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48 - 16) / 3;

export default function TrainingDaysScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();
  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  const currentStep = isAdvancedUser ? CURRENT_STEP_ADVANCED : CURRENT_STEP_BEGINNER;
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  const toggleDay = (dayId: number) => {
    const currentDays = data.trainingDays || [];
    dispatch({
      type: "SET_TRAINING_DAYS",
      payload: currentDays.includes(dayId)
        ? currentDays.filter(d => d !== dayId)
        : [...currentDays, dayId].sort((a, b) => a - b),
    });
  };

  const handleNext = () => {
    router.push("/birth-date");
  };

  const isValid = (data.trainingDays?.length || 0) > 0;

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      footer={
        <View style={styles.footer}>
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {data.trainingDays?.length || 0} {data.trainingDays?.length === 1 ? 'dia' : 'dias'} selecionado{data.trainingDays?.length === 1 ? '' : 's'}
          </Text>
          <Button 
            label="Próximo" 
            onPress={handleNext}
            disabled={!isValid}
          />
        </View>
      }
      showBackButton
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Quais dias você{"\n"}pode treinar?
      </Text>

      <View style={styles.infoContainer}>
        <MaterialCommunityIcons
          name="information"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          {isAdvancedUser 
            ? "Selecione os dias disponíveis para treino. Para PPL, recomendamos 5-6 dias" 
            : "Selecione os dias que você tem disponível para treinar. Recomendamos 3-4 dias"}
        </Text>
      </View>

      <View style={styles.calendar}>
        {WEEK_DAYS.map((day, index) => (
          <MotiView
            key={day.id}
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: "timing",
              duration: 300,
              delay: index * 100,
            }}
          >
            <Pressable
              onPress={() => toggleDay(day.id)}
              style={({ pressed }) => [
                styles.dayCard,
                {
                  backgroundColor: data.trainingDays?.includes(day.id)
                    ? colors.primary
                    : colors.buttonBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: data.trainingDays?.includes(day.id)
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {day.short}
              </Text>
              {data.trainingDays?.includes(day.id) && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  style={styles.checkmark}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={colors.buttonText}
                  />
                </MotiView>
              )}
            </Pressable>
          </MotiView>
        ))}
      </View>

      <View style={styles.tips}>
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
          Dica: Distribua os treinos ao longo da semana para melhor recuperação
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  dayCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayName: {
    fontSize: 18,
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  footer: {
    gap: 16,
  },
  counter: {
    textAlign: "center",
    fontSize: 16,
  },
  tips: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
  },
}); 