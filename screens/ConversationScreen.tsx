import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Message } from "@/types";
import { MessagesStackParamList } from "@/navigation/MessagesStackNavigator";

type ConversationRouteProp = RouteProp<MessagesStackParamList, "Conversation">;

function MessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const { theme } = useTheme();
  const timeAgo = formatTime(message.createdAt);

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isOwn ? theme.primary : theme.backgroundSecondary,
          },
        ]}
      >
        <ThemedText
          type="body"
          style={[styles.messageText, { color: isOwn ? "#fff" : theme.text }]}
        >
          {message.content}
        </ThemedText>
      </View>
      <ThemedText
        type="caption"
        style={[
          styles.messageTime,
          { color: theme.textSecondary },
          isOwn ? styles.ownTime : styles.otherTime,
        ]}
      >
        {timeAgo}
      </ThemedText>
    </View>
  );
}

export default function ConversationScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<ConversationRouteProp>();
  const insets = useSafeAreaInsets();
  const { conversations, getConversationMessages, sendMessage } = useData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find(
    (c) => c.id === route.params.conversationId
  );

  const loadMessages = useCallback(async () => {
    if (!conversation) return;
    const msgs = await getConversationMessages(conversation.id);
    setMessages(msgs.sort((a, b) => b.createdAt - a.createdAt));
  }, [conversation, getConversationMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    setIsLoading(true);
    try {
      await sendMessage(conversation.id, newMessage.trim());
      setNewMessage("");
      await loadMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isOwn={item.senderId === user?.id} />
  );

  if (!conversation) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="body">Conversation not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.encryptedBanner, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="lock" size={14} color={theme.success} />
        <ThemedText type="caption" style={{ color: theme.success, marginLeft: Spacing.xs }}>
          End-to-end encrypted
        </ThemedText>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              Start the conversation!
            </ThemedText>
          </View>
        }
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
        <View style={styles.inputRow}>
          <Pressable
            style={({ pressed }) => [
              styles.attachButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="plus" size={24} color={theme.textSecondary} />
          </Pressable>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Message..."
            placeholderTextColor={theme.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: theme.primary,
                opacity: (!newMessage.trim() || isLoading) ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            <Feather name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
  encryptedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 100,
  },
  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ scaleY: -1 }],
    paddingTop: Spacing["4xl"],
  },
  messageBubbleContainer: {
    marginBottom: Spacing.sm,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
  },
  otherMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  messageText: {},
  messageTime: {
    marginTop: Spacing.xs,
  },
  ownTime: {
    textAlign: "right",
  },
  otherTime: {
    textAlign: "left",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
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
