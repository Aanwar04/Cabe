import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  border: string;
  overlay: string;
}

interface Theme {
  dark: boolean;
  colors: ThemeColors;
}

const LightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#f56300',
    secondary: '#0066cc',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    textSecondary: '#565656',
    error: '#ff3b30',
    border: '#c3c3c3',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
};

const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#ff7b3d',
    secondary: '#4da6ff',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    error: '#ff6b6b',
    border: '#404040',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(preferences => {
      setSystemColorScheme(preferences.colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const isDark = (): boolean => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  };

  const theme: Theme = isDark() ? DarkTheme : LightTheme;

  const toggleTheme = (): void => {
    setThemeModeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return 'light';
    });
  };

  const setThemeMode = (mode: 'light' | 'dark' | 'system'): void => {
    setThemeModeState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: isDark(),
        toggleTheme,
        setThemeMode,
        themeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { Theme, ThemeColors };
