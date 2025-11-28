import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post, CITIES } from "@/types";
import { FeedStackParamList } from "@/navigation/FeedStackNavigator";

function Avatar({ color, size = 40, name }: { color: string; size?: number; name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <ThemedText
        type="body"
        style={[styles.avatarText, { fontSize: size * 0.4 }]}
        lightColor="#fff"
        darkColor="#fff"
      >
        {initial}
      </ThemedText>
    </View>
  );
}

function PostCard({
  post,
  onPress,
  onLike,
  onComment,
  onMessage,
}: {
  post: Post;
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onMessage: () => void;
}) {
  const { theme } = useTheme();
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.postCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.postHeader}>
        <Avatar color={post.authorAvatarColor} name={post.authorName} />
        <View style={styles.postHeaderText}>
          <View style={styles.authorRow}>
            <ThemedText type="h4">{post.authorName}</ThemedText>
            {post.isOrgPost && post.organizationName ? (
              <View style={[styles.orgBadge, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="briefcase" size={12} color={theme.primary} />
                <ThemedText type="caption" style={{ color: theme.primary, marginLeft: 4 }}>
                  {post.organizationName}
                </ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {timeAgo}
          </ThemedText>
        </View>
      </View>

      <ThemedText type="body" style={styles.postContent}>
        {post.content}
      </ThemedText>

      <View style={styles.postActions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onLike}
        >
          <Feather
            name={post.isLiked ? "heart" : "heart"}
            size={20}
            color={post.isLiked ? theme.error : theme.textSecondary}
          />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6 }}>
            {post.likes}
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onComment}
        >
          <Feather name="message-circle" size={20} color={theme.textSecondary} />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6 }}>
            {post.commentCount}
          </ThemedText>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={onMessage}
        >
          <Feather name="send" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { posts, selectedCity, setSelectedCity, getCityName, refreshPosts, togglePostLike, isLoading } = useData();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredPosts = posts.filter((p) => p.city === selectedCity);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshPosts();
    setRefreshing(false);
  }, [refreshPosts]);

  const handlePostPress = (post: Post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const handleLike = async (postId: string) => {
    await togglePostLike(postId);
  };

  const handleComment = (post: Post) => {
    navigation.navigate("PostDetail", { postId: post.id });
  };

  const handleMessage = (post: Post) => {
    navigation.navigate("NewConversation", {
      userId: post.authorId,
      userName: post.authorName,
    });
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item)}
      onMessage={() => handleMessage(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={48} color={theme.textSecondary} />
      <ThemedText type="h3" style={styles.emptyTitle}>
        No posts yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Be the first to share something in {getCityName(selectedCity)}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["5xl"],
          },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            progressViewOffset={headerHeight}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showCityPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCityPicker(false)}
        >
          <View
            style={[
              styles.cityPickerModal,
              { backgroundColor: theme.surface, top: headerHeight + Spacing.sm },
            ]}
          >
            {CITIES.map((city) => (
              <Pressable
                key={city.id}
                style={({ pressed }) => [
                  styles.cityOption,
                  {
                    backgroundColor:
                      selectedCity === city.id
                        ? theme.backgroundSecondary
                        : pressed
                          ? theme.backgroundSecondary
                          : "transparent",
                  },
                ]}
                onPress={() => {
                  setSelectedCity(city.id);
                  setShowCityPicker(false);
                }}
              >
                <ThemedText type="body">{city.name}</ThemedText>
                {selectedCity === city.id ? (
                  <Feather name="check" size={18} color={theme.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  separator: {
    height: Spacing.md,
  },
  postCard: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "600",
  },
  postHeaderText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  orgBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  postContent: {
    marginBottom: Spacing.lg,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing["5xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cityPickerModal: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.sm,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cityOption: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
