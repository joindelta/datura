import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";

type CreatePostParams = {
  CreatePost: {
    orgId?: string;
    orgName?: string;
    postToOrgFeed?: boolean;
  };
};

type CreatePostRouteProp = RouteProp<CreatePostParams, "CreatePost">;

export default function CreatePostScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<CreatePostRouteProp>();
  const insets = useSafeAreaInsets();
  const { createPost, getCityName, selectedCity } = useData();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const { orgId, orgName, postToOrgFeed } = route.params || {};
  const isOrgPost = !!orgId;

  const handlePost = async () => {
    if (!content.trim()) return;

    setIsPosting(true);
    try {
      await createPost(
        content.trim(),
        postToOrgFeed ? orgId : undefined,
        postToOrgFeed ? orgName : undefined
      );
      navigation.goBack();
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const canPost = content.trim().length > 0 && !isPosting;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          onPress={handleClose}
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h4">Create Post</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.postButton,
            {
              backgroundColor: canPost ? theme.primary : theme.backgroundSecondary,
              opacity: canPost ? (pressed ? 0.8 : 1) : 0.5,
            },
          ]}
          onPress={handlePost}
          disabled={!canPost}
        >
          <ThemedText
            type="body"
            style={{ color: canPost ? "#fff" : theme.textSecondary, fontWeight: "600" }}
          >
            {isPosting ? "Posting..." : "Post"}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.userRow}>
          <View style={[styles.avatar, { backgroundColor: user?.avatarColor || theme.primary }]}>
            <ThemedText type="body" lightColor="#fff" darkColor="#fff" style={{ fontWeight: "600" }}>
              {user?.displayName.charAt(0).toUpperCase() || "?"}
            </ThemedText>
          </View>
          <View>
            <ThemedText type="h4">{user?.displayName}</ThemedText>
            <View style={styles.postingTo}>
              <Feather
                name={isOrgPost && postToOrgFeed ? "briefcase" : "globe"}
                size={12}
                color={theme.textSecondary}
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                {isOrgPost && postToOrgFeed
                  ? `Posting to ${orgName}`
                  : `Posting to ${getCityName(selectedCity)}`}
              </ThemedText>
            </View>
          </View>
        </View>

        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="What's on your mind?"
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          autoFocus
          maxLength={500}
          textAlignVertical="top"
        />

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {content.length}/500
          </ThemedText>
          <View style={styles.encryptedBadge}>
            <Feather name="lock" size={12} color={theme.success} />
            <ThemedText type="caption" style={{ color: theme.success, marginLeft: 4 }}>
              End-to-end encrypted
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  postButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  postingTo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  encryptedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
});
