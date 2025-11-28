import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#2C2416",
    textSecondary: "#6B5D4F",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B5D4F",
    tabIconSelected: "#8B7355",
    link: "#8B7355",
    backgroundRoot: "#fffff0",
    backgroundDefault: "#ffffff",
    backgroundSecondary: "#F5F5F0",
    backgroundTertiary: "#E5DDD3",
    primary: "#8B7355",
    secondary: "#D4A373",
    surface: "#ffffff",
    border: "#E5DDD3",
    success: "#6B8E23",
    error: "#C1440E",
    inputBackground: "#ffffff",
  },
  dark: {
    text: "#F5F5F0",
    textSecondary: "#A89B8C",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A89B8C",
    tabIconSelected: "#D4A373",
    link: "#D4A373",
    backgroundRoot: "#1A1612",
    backgroundDefault: "#252019",
    backgroundSecondary: "#302A22",
    backgroundTertiary: "#3B342B",
    primary: "#D4A373",
    secondary: "#8B7355",
    surface: "#252019",
    border: "#3B342B",
    success: "#8DB343",
    error: "#E05A1E",
    inputBackground: "#252019",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
};
