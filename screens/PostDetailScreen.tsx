import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post, Comment } from "@/types";
import { FeedStackParamList } from "@/navigation/FeedStackNavigator";

type PostDetailRouteProp = RouteProp<FeedStackParamList, "PostDetail">;

function Avatar({ color, size = 40, name }: { color: string; size?: number; name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" },
      ]}
    >
      <ThemedText
        type="body"
        style={{ fontSize: size * 0.4, fontWeight: "600" }}
        lightColor="#fff"
        darkColor="#fff"
      >
        {initial}
      </ThemedText>
    </View>
  );
}

function CommentItem({
  comment,
  onReply,
  isReply = false,
}: {
  comment: Comment;
  onReply: (comment: Comment) => void;
  isReply?: boolean;
}) {
  const { theme } = useTheme();
  const timeAgo = getTimeAgo(comment.createdAt);

  return (
    <View style={[styles.commentItem, isReply && styles.replyItem]}>
      <Avatar color={comment.authorAvatarColor} size={32} name={comment.authorName} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            {comment.authorName}
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {timeAgo}
          </ThemedText>
        </View>
        <ThemedText type="body" style={styles.commentText}>
          {comment.content}
        </ThemedText>
        {!isReply ? (
          <Pressable
            style={({ pressed }) => [styles.replyButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => onReply(comment)}
          >
            <ThemedText type="caption" style={{ color: theme.primary }}>
              Reply
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<PostDetailRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { posts, getPostComments, createComment, togglePostLike } = useData();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const post = posts.find((p) => p.id === route.params.postId);

  const loadComments = useCallback(async () => {
    if (!post) return;
    const postComments = await getPostComments(post.id);
    setComments(postComments.sort((a, b) => a.createdAt - b.createdAt));
  }, [post, getPostComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !post) return;

    setIsLoading(true);
    try {
      await createComment(post.id, newComment.trim(), replyingTo?.id);
      setNewComment("");
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (!post) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="body">Post not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parentId === parentId);

  const renderComment = ({ item }: { item: Comment }) => (
    <View>
      <CommentItem comment={item} onReply={handleReply} />
      {getReplies(item.id).map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={handleReply}
          isReply
        />
      ))}
    </View>
  );

  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={rootComments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent]}
        ListHeaderComponent={
          <View style={[styles.postSection, { borderBottomColor: theme.border }]}>
            <View style={styles.postHeader}>
              <Avatar color={post.authorAvatarColor} name={post.authorName} />
              <View style={styles.postHeaderText}>
                <ThemedText type="h4">{post.authorName}</ThemedText>
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
                onPress={() => togglePostLike(post.id)}
              >
                <Feather
                  name="heart"
                  size={20}
                  color={post.isLiked ? theme.error : theme.textSecondary}
                />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6 }}>
                  {post.likes}
                </ThemedText>
              </Pressable>
              <View style={styles.actionButton}>
                <Feather name="message-circle" size={20} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: 6 }}>
                  {comments.length}
                </ThemedText>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              No comments yet. Be the first to comment!
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            paddingBottom: Platform.OS === "ios" ? insets.bottom : Spacing.md,
          },
        ]}
      >
        {replyingTo ? (
          <View style={[styles.replyingTo, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Replying to {replyingTo.authorName}
            </ThemedText>
            <Pressable onPress={cancelReply}>
              <Feather name="x" size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={theme.textSecondary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: theme.primary,
                opacity: (!newComment.trim() || isLoading) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSubmitComment}
            disabled={!newComment.trim() || isLoading}
          >
            <Feather name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
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
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  postSection: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  postHeaderText: {
    marginLeft: Spacing.md,
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
  emptyComments: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  commentItem: {
    flexDirection: "row",
    paddingVertical: Spacing.sm,
  },
  replyItem: {
    marginLeft: Spacing["3xl"],
  },
  commentContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  commentText: {
    marginBottom: Spacing.xs,
  },
  replyButton: {
    paddingVertical: Spacing.xs,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: Spacing.md,
  },
  replyingTo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
