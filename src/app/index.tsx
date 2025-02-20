import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { auth } from "../services/firebase";
import { signInAnonymously } from "firebase/auth";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

export default function LoginScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/gender");
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Não foi possível iniciar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
      {error && <Text style={styles.error}>{error}</Text>}
      <Button
        label={isLoading ? "Carregando..." : "Começar"}
        onPress={handleLogin}
        disabled={isLoading}
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
  error: {
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
});
