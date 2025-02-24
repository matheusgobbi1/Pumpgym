import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { colors } from "../../constants/colors";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, saveAuthCredentials } from "../../services/firebase";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await saveAuthCredentials(email, password);
      
      // Novo usuário sempre vai para onboarding
      router.replace('/(onboarding)/gender');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      Alert.alert('Erro', 'Não foi possível criar sua conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      <Button
        label={loading ? "Criando..." : "Criar Conta"}
        onPress={handleRegister}
        disabled={loading}
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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    color: colors.text,
  },
  error: {
    color: colors.error,
    marginBottom: 16,
  },
}); 