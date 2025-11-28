import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import MessagesScreen from "@/screens/MessagesScreen";
import ConversationScreen from "@/screens/ConversationScreen";
import NewConversationScreen from "@/screens/NewConversationScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type MessagesStackParamList = {
  Messages: undefined;
  Conversation: { conversationId: string };
  NewConversation: { userId?: string; userName?: string };
};

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
      }}
    >
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={({ navigation }) => ({
          headerTitle: "Messages",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("NewConversation", {})}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Feather name="edit" size={22} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({ route }) => ({
          headerTitle: "Chat",
        })}
      />
      <Stack.Screen
        name="NewConversation"
        component={NewConversationScreen}
        options={{
          headerTitle: "New Message",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
