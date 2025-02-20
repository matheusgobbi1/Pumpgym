import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useColors } from "../constants/colors";

interface ButtonProps {
  onPress: () => void;
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  onPress,
  label,
  variant = "primary",
  disabled,
  icon,
}: ButtonProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "secondary" && { backgroundColor: colors.buttonBackground },
        disabled && { backgroundColor: colors.buttonBackground },
        !disabled &&
          variant === "primary" && { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.buttonText,
          variant === "secondary" && { color: colors.text },
          disabled && { color: colors.textSecondary },
          !disabled && variant === "primary" && { color: colors.background },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  iconContainer: {
    marginRight: 8,
  },
});
