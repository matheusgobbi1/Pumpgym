import { View, Text, StyleSheet, Dimensions, ViewStyle, TextStyle } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Pressable } from "react-native";
import { useState } from "react";

const CURRENT_STEP = 7;
const TOTAL_STEPS = 15;
const MAX_TRAINING_DAYS = 6;

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

// Definir interface para os estilos
interface Styles {
  title: TextStyle;
  infoContainer: ViewStyle;
  infoText: TextStyle;
  calendar: ViewStyle;
  dayCard: ViewStyle;
  dayName: TextStyle;
  checkmark: ViewStyle;
  footer: ViewStyle;
  counter: TextStyle;
  tips: ViewStyle;
  tipText: TextStyle;
}

export default function TrainingDaysScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data, dispatch } = useOnboarding();
  const [selectedDays, setSelectedDays] = useState<number[]>(data.trainingDays || []);

  const handleToggleDay = (dayId: number) => {
    setSelectedDays(current => {
      if (current.includes(dayId)) {
        return current.filter(id => id !== dayId);
      }
      if (current.length >= MAX_TRAINING_DAYS) {
        return current;
      }
      return [...current, dayId].sort((a, b) => a - b);
    });
  };

  const handleNext = () => {
    dispatch({
      type: "SET_TRAINING_DAYS",
      payload: selectedDays,
    });
    router.push("/birth-date");
  };

  return (
    <OnboardingLayout
      currentStep={CURRENT_STEP}
      totalSteps={TOTAL_STEPS}
      showBackButton
      footer={
        <View style={styles.footer}>
          <Text style={[styles.counter, { color: colors.textSecondary }]}>
            {selectedDays.length} {selectedDays.length === 1 ? 'dia' : 'dias'} selecionado{selectedDays.length === 1 ? '' : 's'}
          </Text>
          <Button
            label="Próximo"
            onPress={handleNext}
            disabled={selectedDays.length === 0}
          />
        </View>
      }
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Quais dias você{"\n"}pretende treinar?
      </Text>

      <View style={styles.infoContainer}>
        <MaterialCommunityIcons
          name="information"
          size={24}
          color={colors.primary}
        />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Selecione até {MAX_TRAINING_DAYS} dias, garantindo pelo menos 1 dia de descanso semanal
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
              onPress={() => handleToggleDay(day.id)}
              style={({ pressed }) => [
                styles.dayCard,
                {
                  backgroundColor: selectedDays.includes(day.id)
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
                    color: selectedDays.includes(day.id)
                      ? colors.buttonText
                      : colors.text,
                  },
                ]}
              >
                {day.short}
              </Text>
              {selectedDays.includes(day.id) && (
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

const styles = StyleSheet.create<Styles>({
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