import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(onboarding)" />
          </Stack>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
