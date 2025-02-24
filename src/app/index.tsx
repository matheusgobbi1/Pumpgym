import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../components/Button";
import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '../components/SplashScreen';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkAuthState() {
      try {
        if (isLoading) return;

        // Se não há usuário, vai para login
        if (!user) {
          console.log("👤 Usuário não autenticado, redirecionando para login...");
          router.replace('/(auth)/login');
          return;
        }

        console.log("🔍 Verificando estado do usuário...");

        // Verifica se já completou onboarding
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        
        if (hasCompletedOnboarding === 'true') {
          console.log("✅ Onboarding completo, indo para home");
          router.replace('/(tabs)/home');
          return;
        }

        // Verifica se tem perfil no Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.hasCompletedOnboarding) {
            console.log("✅ Perfil encontrado, indo para home");
            await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
            router.replace('/(tabs)/home');
          } else {
            console.log("👉 Perfil sem onboarding, continuando onboarding");
            router.replace('/(onboarding)/gender');
          }
        } else {
          console.log("👉 Perfil não encontrado, iniciando onboarding");
          router.replace('/(onboarding)/gender');
        }

      } catch (error) {
        console.error('❌ Erro ao verificar estado:', error);
        // Em caso de erro, volta para login
        router.replace('/(auth)/login');
      }
    }

    checkAuthState();
  }, [user, isLoading]);

  // Mostra splash screen enquanto carrega
  return <SplashScreen />;
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
