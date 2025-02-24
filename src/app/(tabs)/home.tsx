import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { useColors } from '../../constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const { data } = useOnboarding();
  const colors = useColors();
  const isAdvancedUser = ["intermediate", "advanced"].includes(data.trainingExperience);
  const router = useRouter();

  if (isAdvancedUser) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Crie seu treino</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Monte seu programa de treino personalizado
        </Text>
        <Button 
          label="Criar novo treino"
          onPress={() => router.push("/create-workout")}
          icon="plus"
        />
        {/* Outras opções para usuários avançados */}
      </View>
    );
  }

  return (
    // Tela atual com o treino gerado pela IA
    <View style={styles.container}>
      {/* Conteúdo atual do HomeScreen */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
}); 