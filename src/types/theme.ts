import { colors } from "../constants/colors";

export type Colors = typeof colors;

export interface Theme {
  primary: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  buttonBackground: string;
  buttonText: string;
  buttonDisabled: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  white: string;
  card: string;
  isDark: boolean;
  colors: Colors;
  // Você pode adicionar mais propriedades do tema aqui
  // como fontes, espaçamentos, etc.
} 