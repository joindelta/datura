import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function CreateOrganizationScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { createOrganization } = useData();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await createOrganization(name.trim(), description.trim(), isPublic);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create organization:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView contentContainerStyle={styles.content}>
      <View style={styles.previewContainer}>
        <View style={[styles.previewAvatar, { backgroundColor: theme.primary }]}>
          <Feather name="briefcase" size={32} color="#fff" />
        </View>
        <ThemedText type="h3" style={styles.previewName}>
          {name || "Organization Name"}
        </ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText type="small" style={styles.label}>
          Name
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
          placeholder="Enter organization name"
          placeholderTextColor={theme.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          maxLength={50}
        />
      </View>

      <View style={styles.inputContainer}>
        <ThemedText type="small" style={styles.label}>
          Description
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
          placeholder="What is this organization about?"
          placeholderTextColor={theme.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={200}
          textAlignVertical="top"
        />
        <ThemedText type="caption" style={[styles.charCount, { color: theme.textSecondary }]}>
          {description.length}/200
        </ThemedText>
      </View>

      <View style={[styles.settingRow, { borderColor: theme.border }]}>
        <View style={styles.settingInfo}>
          <Feather
            name={isPublic ? "globe" : "lock"}
            size={20}
            color={theme.text}
          />
          <View style={styles.settingText}>
            <ThemedText type="body">
              {isPublic ? "Public Organization" : "Private Organization"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {isPublic
                ? "Anyone can discover and join"
                : "Only invited comrades can join"}
            </ThemedText>
          </View>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          trackColor={{ false: theme.backgroundTertiary, true: theme.success }}
          thumbColor="#fff"
        />
      </View>

      <Button
        onPress={handleCreate}
        disabled={!name.trim() || isCreating}
        style={[styles.createButton, { backgroundColor: theme.primary }]}
      >
        {isCreating ? "Creating..." : "Create Organization"}
      </Button>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.xl,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  previewName: {
    textAlign: "center",
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
    minHeight: 100,
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: Spacing.xl,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  createButton: {
    marginTop: Spacing.lg,
  },
});
