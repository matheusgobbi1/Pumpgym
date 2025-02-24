import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { colors } from "../../constants/colors";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, saveAuthCredentials } from "../../services/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Faz login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await saveAuthCredentials(email, password);

      // Verifica se o usuário tem perfil no Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userData = userDoc.data();

      // Se tem perfil vai para home, senão continua no onboarding
      if (userData) {
        router.replace('/(tabs)/home');
      }
      // Se não tem perfil, deixa o onboarding lidar com isso
      
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo de volta!</Text>
      <Text style={styles.subtitle}>Entre para continuar</Text>
      
      <Input
        label="Email"
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="Senha"
        placeholder="Digite sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button
        label={loading ? "Entrando..." : "Entrar"}
        onPress={handleLogin}
        disabled={loading}
      />
      
      <Button
        label="Criar uma conta"
        variant="secondary"
        onPress={() => router.push("/(auth)/register")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  error: {
    color: colors.error,
    marginBottom: 16,
  },
}); 