import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { useColors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useState } from "react";
import { validateUserData } from "../../services/validation";
import { ErrorMessage } from "../../components/ErrorMessage";

const CURRENT_STEP_BEGINNER = 7;
const CURRENT_STEP_ADVANCED = 4;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const YEARS = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - i
);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BirthDateScreen() {
  const router = useRouter();
  const { data, dispatch } = useOnboarding();
  const colors = useColors();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  const currentStep = isAdvancedUser ? CURRENT_STEP_ADVANCED : CURRENT_STEP_BEGINNER;
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  const isValid = 
    selectedMonth !== null && 
    selectedDay !== null && 
    selectedYear !== null;

  const handleNext = () => {
    if (isValid) {
      const birthDate = new Date(selectedYear, selectedMonth, selectedDay);
      const errors = validateUserData({ ...data, birthDate });
      const birthDateError = errors.find((e) => e.field === "birthDate");

      if (birthDateError) {
        setError(birthDateError.message);
        return;
      }

      setError(null);
      dispatch({
        type: "SET_BIRTH_DATE",
        payload: birthDate,
      });
      router.push("/measurements");
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
          disabled={!isValid} 
        />
      }
      showBackButton
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Quando você{"\n"}nasceu?
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Isso será usado para calibrar seu plano personalizado
      </Text>

      {error && <ErrorMessage message={error} />}

      <View style={styles.selectors}>
        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text }]}>Mês</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.option,
                  { backgroundColor: colors.buttonBackground },
                  selectedMonth === index && {
                    backgroundColor: `${colors.primary}15`,
                    borderColor: colors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedMonth === index && {
                      color: colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text }]}>Dia</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.option,
                  { backgroundColor: colors.buttonBackground },
                  selectedDay === day && {
                    backgroundColor: `${colors.primary}15`,
                    borderColor: colors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedDay === day && {
                      color: colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.column}>
          <Text style={[styles.label, { color: colors.text }]}>Ano</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.option,
                  { backgroundColor: colors.buttonBackground },
                  selectedYear === year && {
                    backgroundColor: `${colors.primary}15`,
                    borderColor: colors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    selectedYear === year && {
                      color: colors.primary,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
  selectors: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  column: {
    flex: 1,
    marginHorizontal: 8,
    height: 200,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  option: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});
