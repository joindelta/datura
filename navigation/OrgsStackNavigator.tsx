import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import OrganizationsScreen from "@/screens/OrganizationsScreen";
import OrganizationHubScreen from "@/screens/OrganizationHubScreen";
import CreateOrganizationScreen from "@/screens/CreateOrganizationScreen";
import CreatePostScreen from "@/screens/CreatePostScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type OrgsStackParamList = {
  Organizations: undefined;
  OrganizationHub: { orgId: string };
  CreateOrganization: undefined;
  CreatePost: { orgId?: string; orgName?: string; postToOrgFeed?: boolean };
};

const Stack = createNativeStackNavigator<OrgsStackParamList>();

export default function OrgsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark, transparent: false }),
      }}
    >
      <Stack.Screen
        name="Organizations"
        component={OrganizationsScreen}
        options={({ navigation }) => ({
          headerTitle: "Organizations",
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("CreateOrganization")}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Feather name="plus" size={24} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="OrganizationHub"
        component={OrganizationHubScreen}
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="CreateOrganization"
        component={CreateOrganizationScreen}
        options={{
          headerTitle: "New Organization",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
