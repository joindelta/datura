import { Platform, StyleSheet } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ScreenScrollView } from "./ScreenScrollView";

interface ScreenKeyboardAwareScrollViewProps extends KeyboardAwareScrollViewProps {
  hasTabBar?: boolean;
  hasHeader?: boolean;
}

export function ScreenKeyboardAwareScrollView({
  children,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = "handled",
  hasTabBar = true,
  hasHeader = true,
  ...scrollViewProps
}: ScreenKeyboardAwareScrollViewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const paddingTop = hasHeader ? Spacing.xl : insets.top + Spacing.xl;
  const paddingBottom = hasTabBar ? 88 + Spacing.xl : insets.bottom + Spacing.xl;

  if (Platform.OS === "web") {
    return (
      <ScreenScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        hasTabBar={hasTabBar}
        hasHeader={hasHeader}
        {...scrollViewProps}
      >
        {children}
      </ScreenScrollView>
    );
  }

  return (
    <KeyboardAwareScrollView
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
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...scrollViewProps}
    >
      {children}
    </KeyboardAwareScrollView>
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
