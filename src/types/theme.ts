import { colors } from "../constants/colors";

export type Colors = typeof colors;

export interface Theme {
  colors: Colors;
  // Você pode adicionar mais propriedades do tema aqui
  // como fontes, espaçamentos, etc.
} 