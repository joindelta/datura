import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@/constants/theme";

type ScreenInsetsOptions = {
  hasTabBar?: boolean;
  hasTransparentHeader?: boolean;
  headerHeight?: number;
  tabBarHeight?: number;
};

export function useScreenInsets(options: ScreenInsetsOptions = {}) {
  const {
    hasTabBar = true,
    hasTransparentHeader = true,
    headerHeight = 0,
    tabBarHeight = 88,
  } = options;

  const insets = useSafeAreaInsets();

  const paddingTop = hasTransparentHeader
    ? insets.top + headerHeight + Spacing.xl
    : Spacing.xl;

  const paddingBottom = hasTabBar
    ? tabBarHeight + Spacing.xl
    : insets.bottom + Spacing.xl;

  const scrollInsetBottom = insets.bottom + 16;

  return {
    insets,
    paddingTop,
    paddingBottom,
    scrollInsetBottom,
  };
}
