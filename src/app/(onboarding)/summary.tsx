import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { OnboardingLayout } from "../../components/OnboardingLayout";
import { colors } from "../../constants/colors";
import { useOnboarding } from "../../contexts/OnboardingContext";
import {
  createNutritionPlan,
  calculateGoalDate,
  NutritionPlan,
} from "../../services/nutrition";
import { calculateHealthMetrics, HealthMetrics } from "../../services/health";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { saveUserProfile, createUserNutritionPlan } from "../../services/user";
import { useState, useEffect } from "react";
import { LoadingSteps } from "../../components/LoadingSteps";
import { format } from "date-fns";
import React from "react";
import { MacroDistributionSelector } from "../../components/MacroDistributionSelector";
import { saveTrainingProgram } from "../../services/training";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from "../../contexts/OnboardingContext";
import { createUserTrainingProgram } from "../../services/training";
import { FeatureItem } from "../../components/FeatureItem";

const CURRENT_STEP_BEGINNER = 14;
const CURRENT_STEP_ADVANCED = 11;
const TOTAL_STEPS_BEGINNER = 14;
const TOTAL_STEPS_ADVANCED = 11;

interface UserProfile extends Omit<OnboardingData, 'hasCompletedOnboarding'> {
  hasCompletedOnboarding: boolean;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(
    null
  );
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(
    null
  );
  const [goalDate, setGoalDate] = useState<Date | null>(null);
  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience || '');
  const currentStep = isAdvancedUser ? CURRENT_STEP_ADVANCED : CURRENT_STEP_BEGINNER;
  const totalSteps = isAdvancedUser ? TOTAL_STEPS_ADVANCED : TOTAL_STEPS_BEGINNER;

  useEffect(() => {
    async function loadData() {
      try {
        if (!data.weight || !data.height || !data.gender || !data.trainingFrequency) {
          throw new Error("Dados incompletos");
        }

        // Tempo total para mostrar todos os steps (1.5s por step + delays)
        const totalSteps = 5; // Número de steps no LoadingSteps
        const stepDuration = 1500; // Duração de cada step
        const delayBetweenSteps = 200; // Delay entre steps
        const totalDuration = totalSteps * stepDuration + totalSteps * delayBetweenSteps;

        // Calculando tudo em background
        const nutrition = createNutritionPlan(data);
        const health = calculateHealthMetrics(data);
        const predictedDate = calculateGoalDate(data);

        // Aguarda o tempo total dos steps
        await new Promise((resolve) => setTimeout(resolve, totalDuration));

        setNutritionPlan(nutrition);
        setHealthMetrics(health);
        setGoalDate(predictedDate);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar seu plano. Tente novamente.");
        setIsLoading(false);
      }
    }

    loadData();
  }, [data]);

  useEffect(() => {
    if (data.macroDistribution) {
      const nutrition = createNutritionPlan(data);
      setNutritionPlan(nutrition);
    }
  }, [data.macroDistribution]);

  const handleFinish = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // 1. Salva o perfil primeiro
      await saveUserProfile(user.uid, {
        ...data,
        hasCompletedOnboarding: true
      });

      // 2. Marca como completo no AsyncStorage
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');

      // 3. Tenta gerar o programa de treino
      try {
        await createUserTrainingProgram(user.uid, data);
      } catch (error) {
        console.warn("Erro ao criar programa de treino, será criado depois:", error);
      }

      // 4. Redireciona para home mesmo se der erro no programa
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar seu perfil');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !nutritionPlan || !healthMetrics) {
    return <LoadingSteps />;
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      footer={<Button label="Começar Jornada" onPress={handleFinish} />}
      showBackButton
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Seu Plano{"\n"}Personalizado</Text>
        <Text style={styles.subtitle}>
          Baseado na fórmula Mifflin-St Jeor e suas informações pessoais
        </Text>

        {/* Health Score */}
        <View style={styles.scoreCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.scoreTitle}>Health Score</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{healthMetrics.healthScore}</Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <Text style={styles.scoreDescription}>
            Seu score de saúde é calculado com base no seu IMC, nível de
            atividade física e escolhas alimentares
          </Text>
          <View style={styles.recommendations}>
            {healthMetrics.recommendations.map((rec: string, index: number) => (
              <View key={index} style={styles.recommendationItem}>
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Macro Distribution Selector */}
        <MacroDistributionSelector />

        {/* Nutrition Plan */}
        <View style={styles.nutritionCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name="nutrition"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>Plano Nutricional Diário</Text>
          </View>

          <Text style={styles.disclaimer}>
            Esta é nossa recomendação inicial baseada nos seus objetivos. Você
            poderá ajustar estes valores a qualquer momento.
          </Text>

          <View style={styles.calorieContainer}>
            <MaterialCommunityIcons
              name="fire"
              size={32}
              color={colors.primary}
            />
            <View>
              <Text style={styles.calories}>
                {nutritionPlan.calories}
                <Text style={styles.unit}> kcal</Text>
              </Text>
              <Text style={styles.calorieDescription}>
                Consumo diário recomendado
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Distribuição de Macronutrientes
          </Text>
          <View style={styles.macrosContainer}>
            <View style={styles.macroItem}>
              <MaterialCommunityIcons
                name="food-steak"
                size={24}
                color={colors.text}
              />
              <Text style={styles.macroValue}>
                {nutritionPlan.macros.protein}g
              </Text>
              <Text style={styles.macroLabel}>Proteína</Text>
              <Text style={styles.macroTip}>
                Essencial para músculos e recuperação
              </Text>
            </View>

            <View style={styles.macroItem}>
              <MaterialCommunityIcons
                name="oil"
                size={24}
                color={colors.text}
              />
              <Text style={styles.macroValue}>{nutritionPlan.macros.fat}g</Text>
              <Text style={styles.macroLabel}>Gordura</Text>
              <Text style={styles.macroTip}>Importante para hormônios</Text>
            </View>

            <View style={styles.macroItem}>
              <MaterialCommunityIcons
                name="bread-slice"
                size={24}
                color={colors.text}
              />
              <Text style={styles.macroValue}>
                {nutritionPlan.macros.carbs}g
              </Text>
              <Text style={styles.macroLabel}>Carboidrato</Text>
              <Text style={styles.macroTip}>Energia para treinos</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Recomendações Diárias</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="water"
                size={24}
                color={colors.text}
              />
              <Text style={styles.infoValue}>
                {nutritionPlan.waterIntake}ml
              </Text>
              <Text style={styles.infoLabel}>Água</Text>
              <Text style={styles.infoTip}>Mantenha-se hidratado</Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={24}
                color={colors.text}
              />
              <Text style={styles.infoValue}>{nutritionPlan.meals}x</Text>
              <Text style={styles.infoLabel}>Refeições</Text>
              <Text style={styles.infoTip}>Distribua ao longo do dia</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.tipText}>
              Lembre-se: estes valores são recomendações iniciais e podem ser
              ajustados conforme sua adaptação e necessidades específicas.
            </Text>
          </View>

          {data.weightGoal && data.goal !== "maintain" && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Meta de Peso</Text>
              <View style={styles.goalContainer}>
                <View style={styles.weightContainer}>
                  <Text style={styles.weightLabel}>Atual</Text>
                  <Text style={styles.weightValue}>{data.weight}kg</Text>
                </View>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={24}
                  color={colors.primary}
                />
                <View style={styles.weightContainer}>
                  <Text style={styles.weightLabel}>Meta</Text>
                  <Text style={styles.weightValue}>{data.weightGoal}kg</Text>
                </View>
              </View>
              {goalDate && (
                <Text style={styles.goalDate}>
                  Previsão para atingir a meta: {format(goalDate, "dd/MM/yyyy")}
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  scoreCard: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.primary,
  },
  scoreMax: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  recommendations: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  nutritionCard: {
    backgroundColor: colors.buttonBackground,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  calories: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
  unit: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  infoItem: {
    alignItems: "center",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  scoreDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  disclaimer: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 24,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: `${colors.text}15`,
    marginVertical: 24,
  },
  calorieDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  macroTip: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  infoTip: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weightLabel: {
    fontSize: 14,
    color: colors.text,
  },
  weightValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  goalDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  features: {
    gap: 16,
  },
});
