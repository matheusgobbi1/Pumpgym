import { useTheme } from "../contexts/ThemeContext";

export const colors = {
  primary: '#FF6B00', // Laranja principal
  background: '#FFFFFF',
  backgroundSecondary: '#1A1A1A', // Cor escura para a tab bar
  text: '#FFFFFF', // Ícones ativos em branco
  textSecondary: '#757575', // Ícones inativos em cinza
  error: '#DC2626',
  success: '#16A34A',
  warning: '#CA8A04',
  border: '#E5E5E5',
  buttonBackground: "#F5F5F5",
  buttonText: "#FFFFFF",
  buttonDisabled: "#E0E0E0",
} as const;

// Definindo o tipo das cores para o TypeScript
export type Colors = typeof colors;

// Garantindo que o tema tenha todas as propriedades necessárias
export function useColors(): Colors {
  const { theme } = useTheme();
  return theme ? theme as Colors : colors;
}
