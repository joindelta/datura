import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import FeedScreen from "@/screens/FeedScreen";
import PostDetailScreen from "@/screens/PostDetailScreen";
import NewConversationScreen from "@/screens/NewConversationScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";
import { useData } from "@/contexts/DataContext";
import { CITIES } from "@/types";

export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  NewConversation: { userId?: string; userName?: string };
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStackNavigator() {
  const { theme, isDark } = useTheme();
  const { selectedCity, getCityName } = useData();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <HeaderTitle title={getCityName(selectedCity)} />
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Feather name="search" size={22} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          headerTitle: "Post",
        }}
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
