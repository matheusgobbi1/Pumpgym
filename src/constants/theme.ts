export const lightTheme = {
  primary: "#FF6B00",
  background: "#FFFFFF",
  backgroundSecondary: "#F5F5F5",
  text: "#1A1A1A",
  textSecondary: "#757575",
  buttonBackground: "#F5F5F5",
  buttonText: "#FFFFFF",
  buttonDisabled: "#9CA3AF",
  border: "#E5E5E5",
  error: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  white: "#FFFFFF",
  card: "#FFFFFF",
  isDark: false,
};

export const darkTheme = {
  primary: "#FF6B00",
  background: "#1A1A1A",
  backgroundSecondary: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#999999",
  buttonBackground: "#2A2A2A",
  buttonText: "#FFFFFF",
  buttonDisabled: "#4B5563",
  border: "#333333",
  error: "#DC2626",
  warning: "#F59E0B",
  success: "#10B981",
  white: "#FFFFFF",
  card: "#2A2A2A",
  isDark: true,
};

export type Theme = typeof lightTheme; 