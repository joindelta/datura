import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MessagesStackParamList } from "@/navigation/MessagesStackNavigator";
import { AVATAR_COLORS } from "@/types";

type NewConversationRouteProp = RouteProp<MessagesStackParamList, "NewConversation">;

interface MockComrade {
  id: string;
  name: string;
  avatarColor: string;
}

export default function NewConversationScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MessagesStackParamList>>();
  const route = useRoute<NewConversationRouteProp>();
  const { comrades, createConversation, conversations } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComrades, setSelectedComrades] = useState<MockComrade[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const mockComrades: MockComrade[] = [
    { id: "1", name: "Alex Chen", avatarColor: AVATAR_COLORS[0] },
    { id: "2", name: "Jordan Smith", avatarColor: AVATAR_COLORS[1] },
    { id: "3", name: "Taylor Brown", avatarColor: AVATAR_COLORS[2] },
    { id: "4", name: "Morgan Lee", avatarColor: AVATAR_COLORS[3] },
    { id: "5", name: "Casey Wilson", avatarColor: AVATAR_COLORS[4] },
  ];

  useEffect(() => {
    if (route.params?.userId && route.params?.userName) {
      const preselected = {
        id: route.params.userId,
        name: route.params.userName,
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };
      setSelectedComrades([preselected]);
    }
  }, [route.params]);

  const filteredComrades = mockComrades.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleComrade = (comrade: MockComrade) => {
    const isSelected = selectedComrades.find((c) => c.id === comrade.id);
    if (isSelected) {
      setSelectedComrades(selectedComrades.filter((c) => c.id !== comrade.id));
    } else {
      setSelectedComrades([...selectedComrades, comrade]);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedComrades.length === 0 || !user) return;

    setIsCreating(true);
    try {
      const participantIds = [user.id, ...selectedComrades.map((c) => c.id)];
      const participantNames = selectedComrades.map((c) => c.name);
      const type = selectedComrades.length > 1 ? "group" : "direct";

      const conversation = await createConversation(
        participantIds,
        participantNames,
        type
      );

      navigation.replace("Conversation", { conversationId: conversation.id });
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderComrade = ({ item }: { item: MockComrade }) => {
    const isSelected = selectedComrades.find((c) => c.id === item.id);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.comradeRow,
          {
            backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
          },
        ]}
        onPress={() => toggleComrade(item)}
      >
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <ThemedText type="body" style={styles.avatarText} lightColor="#fff" darkColor="#fff">
            {item.name.charAt(0)}
          </ThemedText>
        </View>
        <ThemedText type="body" style={styles.comradeName}>
          {item.name}
        </ThemedText>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isSelected ? theme.primary : "transparent",
              borderColor: isSelected ? theme.primary : theme.border,
            },
          ]}
        >
          {isSelected ? <Feather name="check" size={14} color="#fff" /> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { borderBottomColor: theme.border }]}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Feather name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search comrades..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {selectedComrades.length > 0 ? (
        <View style={[styles.selectedContainer, { borderBottomColor: theme.border }]}>
          <FlatList
            horizontal
            data={selectedComrades}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.selectedChip, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => toggleComrade(item)}
              >
                <ThemedText type="small">{item.name}</ThemedText>
                <Feather name="x" size={14} color={theme.textSecondary} />
              </Pressable>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedList}
          />
        </View>
      ) : null}

      <FlatList
        data={filteredComrades}
        renderItem={renderComrade}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              No comrades found
            </ThemedText>
          </View>
        }
      />

      {selectedComrades.length > 0 ? (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              {
                backgroundColor: theme.primary,
                opacity: isCreating ? 0.5 : pressed ? 0.8 : 1,
              },
            ]}
            onPress={handleCreateConversation}
            disabled={isCreating}
          >
            <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
              {selectedComrades.length > 1 ? "Create Group Chat" : "Start Chat"}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  selectedContainer: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  selectedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  comradeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  comradeName: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  createButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
