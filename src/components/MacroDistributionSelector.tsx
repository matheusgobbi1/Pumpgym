import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "../constants/colors";
import {
  useOnboarding,
  MacroDistribution,
} from "../contexts/OnboardingContext";
import { useSound } from "../hooks/useSound";
import React, { useState } from "react";
import { MotiView, AnimatePresence } from "moti";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

const MACRO_DISTRIBUTIONS = {
  moderate: {
    label: "Moderate Carb",
    description: "Balanceado para resultados consistentes",
    protein: 30,
    fat: 35,
    carbs: 35,
    icon: "chart-pie",
    color: "#FF5A00",
  },
  lower: {
    label: "Lower Carb",
    description: "Foco em proteína e gorduras boas",
    protein: 40,
    fat: 40,
    carbs: 20,
    icon: "chart-donut",
    color: "#4CAF50",
  },
  higher: {
    label: "Higher Carb",
    description: "Ideal para alto desempenho",
    protein: 30,
    fat: 20,
    carbs: 50,
    icon: "chart-arc",
    color: "#2196F3",
  },
} as const;

export function MacroDistributionSelector() {
  const colors = useColors();
  const { data, dispatch } = useOnboarding();
  const { playSelectSound } = useSound();
  const [selectedType, setSelectedType] = useState<MacroDistribution>(
    data.macroDistribution || "moderate"
  );

  const handleSelect = async (type: MacroDistribution) => {
    playSelectSound();
    setSelectedType(type);

    dispatch({
      type: "SET_MACRO_DISTRIBUTION",
      payload: type,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        Escolha sua Distribuição de Macros
      </Text>

      <View style={styles.cardsContainer}>
        {(
          Object.entries(MACRO_DISTRIBUTIONS) as [
            MacroDistribution,
            typeof MACRO_DISTRIBUTIONS.moderate
          ][]
        ).map(([type, config]) => {
          const isSelected = selectedType === type;

          return (
            <MotiView
              key={type}
              animate={{
                scale: isSelected ? 1.02 : 1,
                opacity: 1,
              }}
              transition={{
                type: "timing",
                duration: 150,
              }}
              style={[
                styles.cardWrapper,
                isSelected && { elevation: 8, shadowColor: config.color },
              ]}
            >
              <Pressable
                onPress={() => handleSelect(type)}
                style={[
                  styles.card,
                  {
                    backgroundColor: isSelected
                      ? `${config.color}15`
                      : colors.buttonBackground,
                    borderColor: isSelected ? config.color : "transparent",
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons
                    name={config.icon as any}
                    size={32}
                    color={isSelected ? config.color : colors.text}
                  />
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: isSelected ? config.color : colors.text },
                    ]}
                  >
                    {config.label}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.cardDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {config.description}
                </Text>

                <MacroBar
                  protein={config.protein}
                  carbs={config.carbs}
                  fat={config.fat}
                  isSelected={isSelected}
                  color={config.color}
                />

                <View style={styles.macroValues}>
                  <MacroValue
                    label="Proteína"
                    value={config.protein}
                    color={isSelected ? config.color : colors.text}
                    icon="food-steak"
                  />
                  <MacroValue
                    label="Carboidrato"
                    value={config.carbs}
                    color={isSelected ? config.color : colors.text}
                    icon="bread-slice"
                  />
                  <MacroValue
                    label="Gordura"
                    value={config.fat}
                    color={isSelected ? config.color : colors.text}
                    icon="oil"
                  />
                </View>
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
}

function MacroValue({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.macroValue}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      <Text style={[styles.macroValueText, { color }]}>{value}%</Text>
      <Text style={[styles.macroValueLabel, { color }]}>{label}</Text>
    </View>
  );
}

function MacroBar({
  protein,
  carbs,
  fat,
  isSelected,
  color,
}: {
  protein: number;
  carbs: number;
  fat: number;
  isSelected: boolean;
  color: string;
}) {
  const colors = useColors();

  return (
    <View style={styles.barContainer}>
      <MotiView
        style={[
          styles.barSegment,
          { backgroundColor: isSelected ? color : colors.primary },
        ]}
        animate={{ flex: protein / 100 }}
        transition={{ type: "spring", damping: 15 }}
      />
      <MotiView
        style={[
          styles.barSegment,
          {
            backgroundColor: isSelected ? color : colors.primary,
            opacity: 0.7,
          },
        ]}
        animate={{ flex: carbs / 100 }}
        transition={{ type: "spring", damping: 15 }}
      />
      <MotiView
        style={[
          styles.barSegment,
          {
            backgroundColor: isSelected ? color : colors.primary,
            opacity: 0.4,
          },
        ]}
        animate={{ flex: fat / 100 }}
        transition={{ type: "spring", damping: 15 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  cardsContainer: {
    gap: 16,
    alignItems: "center",
  },
  cardWrapper: {
    width: CARD_WIDTH,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  macroValues: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  macroValue: {
    alignItems: "center",
    gap: 4,
  },
  macroValueText: {
    fontSize: 16,
    fontWeight: "600",
  },
  macroValueLabel: {
    fontSize: 12,
  },
  benefitsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
  },
  barContainer: {
    height: 8,
    flexDirection: "row",
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 8,
  },
  barSegment: {
    height: "100%",
  },
});
