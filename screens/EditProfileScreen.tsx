import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AVATAR_COLORS } from "@/types";

export default function EditProfileScreen() {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuth();
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || AVATAR_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarColor: selectedColor,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    displayName.trim() !== user?.displayName ||
    bio.trim() !== (user?.bio || "") ||
    selectedColor !== user?.avatarColor;

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: selectedColor }]}>
          <ThemedText
            type="h1"
            lightColor="#fff"
            darkColor="#fff"
            style={styles.avatarText}
          >
            {displayName.charAt(0).toUpperCase() || "?"}
          </ThemedText>
        </View>
        <ThemedText type="small" style={[styles.avatarHint, { color: theme.textSecondary }]}>
          Choose your avatar color
        </ThemedText>
        <View style={styles.colorPicker}>
          {AVATAR_COLORS.map((color) => (
            <Pressable
              key={color}
              style={({ pressed }) => [
                styles.colorOption,
                { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
                selectedColor === color && [styles.selectedColor, { borderColor: theme.text }],
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText type="small" style={styles.label}>
          Display Name
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="Enter your name"
          placeholderTextColor={theme.textSecondary}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          maxLength={30}
        />
      </View>

      <View style={styles.inputContainer}>
        <ThemedText type="small" style={styles.label}>
          Bio
        </ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.inputBackground,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="Tell us about yourself"
          placeholderTextColor={theme.textSecondary}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          maxLength={150}
          textAlignVertical="top"
        />
        <ThemedText type="caption" style={[styles.charCount, { color: theme.textSecondary }]}>
          {bio.length}/150
        </ThemedText>
      </View>

      <Button
        onPress={handleSave}
        disabled={!displayName.trim() || !hasChanges || isSaving}
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
      >
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xl,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
  },
  avatarHint: {
    marginBottom: Spacing.md,
  },
  colorPicker: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  selectedColor: {
    borderWidth: 3,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
  },
  charCount: {
    textAlign: "right",
    marginTop: Spacing.xs,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
