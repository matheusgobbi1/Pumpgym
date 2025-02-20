import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useColors } from "../constants/colors";
import { useTheme } from "../contexts/ThemeContext";
import { memo } from "react";
import { useSound } from "../hooks/useSound";

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  leftContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SelectionCard = memo(function SelectionCard({
  title,
  subtitle,
  selected,
  onPress,
  leftContent,
  style,
}: SelectionCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { playSelectSound } = useSound();

  const handlePress = async () => {
    await playSelectSound();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? selected
              ? `${colors.primary}15`
              : colors.buttonBackground
            : selected
            ? `${colors.primary}10`
            : colors.buttonBackground,
          borderColor: selected ? colors.primary : "transparent",
        },
        style,
      ]}
    >
      {leftContent && <View style={styles.leftContent}>{leftContent}</View>}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: selected ? colors.primary : colors.text,
              fontWeight: selected ? "600" : "400",
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  leftContent: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
  },
});
