import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, Theme } from "../constants/theme";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setSystemTheme: () => void;
  useSystemTheme: boolean;
};

const THEME_STORAGE_KEY = "@theme_preference";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const [useSystemTheme, setUseSystemTheme] = useState(true);

  // Carrega preferência salva ao iniciar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Atualiza tema quando mudar preferência do sistema
  useEffect(() => {
    if (useSystemTheme) {
      setIsDark(systemColorScheme === "dark");
    }
  }, [systemColorScheme, useSystemTheme]);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedPreference) {
        const { isDark: savedIsDark, useSystem } = JSON.parse(savedPreference);
        setUseSystemTheme(useSystem);
        if (!useSystem) {
          setIsDark(savedIsDark);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar preferência de tema:", error);
    }
  };

  const saveThemePreference = async (dark: boolean, useSystem: boolean) => {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ isDark: dark, useSystem })
      );
    } catch (error) {
      console.error("Erro ao salvar preferência de tema:", error);
    }
  };

  const toggleTheme = () => {
    setUseSystemTheme(false);
    setIsDark((prev) => {
      const newValue = !prev;
      saveThemePreference(newValue, false);
      return newValue;
    });
  };

  const setSystemTheme = () => {
    setUseSystemTheme(true);
    setIsDark(systemColorScheme === "dark");
    saveThemePreference(systemColorScheme === "dark", true);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDark, 
        toggleTheme, 
        setSystemTheme, 
        useSystemTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
