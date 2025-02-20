import { View, StyleSheet } from "react-native";
import { useColors } from "../constants/colors";

type StepperProps = {
  currentStep: number;
  totalSteps: number;
};

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            { backgroundColor: colors.buttonBackground },
            index <= currentStep - 1 && { backgroundColor: colors.primary },
            index === currentStep - 1 && { backgroundColor: colors.primary },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
});
