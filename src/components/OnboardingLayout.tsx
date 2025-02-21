import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stepper } from "./Stepper";
import { useColors } from "../constants/colors";
import { ThemeToggle } from "./ThemeToggle";
import { useRef, useEffect } from "react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  footer?: React.ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  footer,
  onBack,
}: OnboardingLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Mostra o botão de voltar em todas as telas exceto na primeira
  const showBackButton = pathname !== "/(onboarding)/gender";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
          <ThemeToggle />
        </View>
        <View style={styles.stepperContainer}>
          <Stepper currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      </View>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Animated.ScrollView>

      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  stepperContainer: {
    width: "100%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  footer: {
    padding: 24,
  },
});
