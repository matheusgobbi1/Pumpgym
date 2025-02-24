import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import * as Haptics from 'expo-haptics';

export function LogoutButton() {
  const { theme } = useTheme();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: theme.buttonBackground }
      ]}
      onPress={handleLogout}
    >
      <Ionicons 
        name="log-out-outline" 
        size={24} 
        color={theme.error} 
      />
      <Text style={[styles.text, { color: theme.error }]}>
        Sair do App
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
}); 