import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { AuthProvider } from "../contexts/AuthContext";
import { TrainingProvider } from "../contexts/TrainingContext";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <AuthProvider>
            <OnboardingProvider>
              <TrainingProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(onboarding)" />
                </Stack>
              </TrainingProvider>
            </OnboardingProvider>
          </AuthProvider>
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
