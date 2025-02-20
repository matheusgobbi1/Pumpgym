import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../contexts/ThemeContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
              }}
            />
          </GestureHandlerRootView>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
