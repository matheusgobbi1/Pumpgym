import { useTheme } from "../contexts/ThemeContext";

export const colors = {
  primary: "#FF5A00", // Laranja principal
  background: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#757575",
  border: "#E0E0E0",
  buttonBackground: "#F5F5F5",
  buttonText: "#1A1A1A",
  buttonDisabled: "#E0E0E0",
  error: "#DC3545", // Adicionando cor de erro
} as const;

export function useColors() {
  const { theme } = useTheme();
  return theme || colors; // Fallback para cores padrão se não houver tema
}
