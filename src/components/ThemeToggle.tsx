import { TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useColors } from "../constants/colors";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const colors = useColors();

  return (
    <TouchableOpacity onPress={toggleTheme}>
      <MaterialCommunityIcons
        name={isDark ? "weather-night" : "weather-sunny"}
        size={24}
        color={colors.text}
      />
    </TouchableOpacity>
  );
} 