import { ScrollView, ScrollViewProps, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface ScreenScrollViewProps extends ScrollViewProps {
  hasTabBar?: boolean;
  hasHeader?: boolean;
}

export function ScreenScrollView({
  children,
  contentContainerStyle,
  style,
  hasTabBar = true,
  hasHeader = true,
  ...scrollViewProps
}: ScreenScrollViewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = hasHeader ? Spacing.xl : insets.top + Spacing.xl;
  const paddingBottom = hasTabBar ? 88 + Spacing.xl : insets.bottom + Spacing.xl;

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.backgroundRoot },
        style,
      ]}
      contentContainerStyle={[
        {
          paddingTop,
          paddingBottom,
        },
        styles.contentContainer,
        contentContainerStyle,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom + 16 }}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
  },
});
