import React from 'react';
import { 
  TextInput, 
  TextInputProps, 
  StyleSheet, 
  View,
  Text 
} from 'react-native';
import { colors } from '../constants/colors';

interface InputProps extends TextInputProps {
  error?: string;
  label?: string;
}

export function Input({ 
  error, 
  label,
  style,
  ...rest 
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
}); 