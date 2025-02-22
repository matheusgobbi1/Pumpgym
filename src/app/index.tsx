import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      if (user) {
        try {
          const hasCompletedOnboarding = await AsyncStorage.getItem(`@onboarding_completed_${user.uid}`);
          if (hasCompletedOnboarding === 'true') {
            router.replace("/(tabs)/home");
          } else {
            router.replace("/(onboarding)/gender");
          }
        } catch (error) {
          console.error('Erro ao verificar status do onboarding:', error);
        }
      }
    };

    if (!isLoading) {
      checkAuthAndOnboarding();
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PumpGym</Text>
      <Text style={styles.subtitle}>
        Sua jornada para uma vida mais saudável começa aqui
      </Text>
      
      <Button
        label="Criar conta"
        onPress={() => router.push("/(auth)/register")}
      />
      
      <Button
        label="Já tenho conta"
        variant="secondary"
        onPress={() => router.push("/(auth)/login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 48,
  },
});
