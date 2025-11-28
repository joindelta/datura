import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Conversation } from "@/types";
import { MessagesStackParamList } from "@/navigation/MessagesStackNavigator";

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const displayName =
    conversation.type === "group"
      ? conversation.participantNames.join(", ")
      : conversation.participantNames[0] || "Unknown";

  const initial = displayName.charAt(0).toUpperCase();
  const timeAgo = conversation.lastMessageAt
    ? getTimeAgo(conversation.lastMessageAt)
    : "";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationRow,
        {
          backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: theme.primary },
        ]}
      >
        {conversation.type === "group" ? (
          <Feather name="users" size={20} color="#fff" />
        ) : (
          <ThemedText type="body" style={styles.avatarText} lightColor="#fff" darkColor="#fff">
            {initial}
          </ThemedText>
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameRow}>
            <ThemedText type="h4" numberOfLines={1} style={styles.conversationName}>
              {displayName}
            </ThemedText>
            {conversation.isEncrypted ? (
              <Feather name="lock" size={12} color={theme.success} />
            ) : null}
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {timeAgo}
          </ThemedText>
        </View>
        <View style={styles.messagePreviewRow}>
          <ThemedText
            type="body"
            numberOfLines={1}
            style={[styles.messagePreview, { color: theme.textSecondary }]}
          >
            {conversation.lastMessage || "No messages yet"}
          </ThemedText>
          {conversation.unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="caption" style={styles.unreadText}>
                {conversation.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const { conversations, refreshConversations } = useData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshConversations();
    setRefreshing(false);
  }, [refreshConversations]);

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("Conversation", { conversationId: conversation.id });
  };

  const handleNewMessage = () => {
    navigation.navigate("NewConversation", {});
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = a.lastMessageAt || 0;
    const bTime = b.lastMessageAt || 0;
    return bTime - aTime;
  });

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationRow
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="message-circle" size={48} color={theme.textSecondary} />
      <ThemedText type="h3" style={styles.emptyTitle}>
        No messages yet
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start a conversation with a comrade
      </ThemedText>
      <Pressable
        style={({ pressed }) => [
          styles.startButton,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handleNewMessage}
      >
        <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
          Start a Conversation
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sortedConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: theme.border }]} />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  conversationContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  conversationName: {
    flex: 1,
  },
  messagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  messagePreview: {
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    marginLeft: 66 + Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["5xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  startButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
