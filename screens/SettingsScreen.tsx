import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function SettingsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const {
    user,
    biometricEnabled,
    biometricAvailable,
    enableBiometric,
    disableBiometric,
    logout,
  } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      await enableBiometric();
    } else {
      await disableBiometric();
    }
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      performLogout();
      return;
    }

    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Your data will be cleared from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderSettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
    danger,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingRow,
        { opacity: onPress && pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: danger ? theme.error : theme.backgroundSecondary }]}>
        <Feather name={icon as any} size={18} color={danger ? "#fff" : theme.text} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText type="body" style={danger ? { color: theme.error } : undefined}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {rightElement}
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          SECURITY
        </ThemedText>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {renderSettingRow({
            icon: "shield",
            title: "Biometric Authentication",
            subtitle: biometricAvailable
              ? biometricEnabled
                ? "Enabled"
                : "Disabled"
              : "Not available on this device",
            rightElement: biometricAvailable ? (
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: theme.backgroundTertiary, true: theme.success }}
                thumbColor="#fff"
              />
            ) : null,
          })}
          {renderSettingRow({
            icon: "lock",
            title: "End-to-End Encryption",
            subtitle: "All messages are encrypted",
            rightElement: (
              <Feather name="check-circle" size={20} color={theme.success} />
            ),
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ACCOUNT
        </ThemedText>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {renderSettingRow({
            icon: "user",
            title: "Profile",
            subtitle: user?.displayName,
            rightElement: <Feather name="chevron-right" size={20} color={theme.textSecondary} />,
            onPress: () => navigation.navigate("EditProfile" as never),
          })}
          {renderSettingRow({
            icon: "map-pin",
            title: "City",
            subtitle: user?.city || "Not set",
            rightElement: <Feather name="chevron-right" size={20} color={theme.textSecondary} />,
          })}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          ABOUT
        </ThemedText>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {renderSettingRow({
            icon: "info",
            title: "Version",
            rightElement: (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                1.0.0
              </ThemedText>
            ),
          })}
          {renderSettingRow({
            icon: "file-text",
            title: "Privacy Policy",
            rightElement: <Feather name="external-link" size={18} color={theme.textSecondary} />,
          })}
          {renderSettingRow({
            icon: "file-text",
            title: "Terms of Service",
            rightElement: <Feather name="external-link" size={18} color={theme.textSecondary} />,
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.sectionContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {renderSettingRow({
            icon: "log-out",
            title: isLoggingOut ? "Logging out..." : "Log Out",
            onPress: handleLogout,
            danger: true,
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
          Made with care for your community
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    fontWeight: "600",
  },
  sectionContent: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  settingContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  footer: {
    paddingVertical: Spacing.xl,
  },
});
