import React, { useState, useCallback } from "react";
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
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Organization } from "@/types";
import { OrgsStackParamList } from "@/navigation/OrgsStackNavigator";

function OrgCard({
  org,
  isMember,
  onPress,
}: {
  org: Organization;
  isMember: boolean;
  onPress: () => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.orgCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.orgAvatar, { backgroundColor: org.avatarColor }]}>
        <Feather name="briefcase" size={24} color="#fff" />
      </View>
      <View style={styles.orgContent}>
        <ThemedText type="h4" numberOfLines={1}>
          {org.name}
        </ThemedText>
        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ color: theme.textSecondary }}
        >
          {org.description}
        </ThemedText>
        <View style={styles.orgMeta}>
          <Feather name="users" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
            {org.memberCount} members
          </ThemedText>
          {isMember ? (
            <View style={[styles.memberBadge, { backgroundColor: theme.success }]}>
              <ThemedText type="caption" style={{ color: "#fff" }}>
                Member
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

export default function OrganizationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<OrgsStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    organizations,
    userMemberships,
    selectedCity,
    getCityName,
    refreshOrganizations,
  } = useData();
  const [activeTab, setActiveTab] = useState<"my" | "discover">("my");
  const [refreshing, setRefreshing] = useState(false);

  const myOrgIds = userMemberships.map((m) => m.organizationId);
  const myOrgs = organizations.filter((o) => myOrgIds.includes(o.id));
  const discoverOrgs = organizations.filter(
    (o) => !myOrgIds.includes(o.id) && o.city === selectedCity && o.isPublic
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshOrganizations();
    setRefreshing(false);
  }, [refreshOrganizations]);

  const handleOrgPress = (org: Organization) => {
    navigation.navigate("OrganizationHub", { orgId: org.id });
  };

  const handleCreateOrg = () => {
    navigation.navigate("CreateOrganization");
  };

  const renderOrg = ({ item }: { item: Organization }) => (
    <OrgCard
      org={item}
      isMember={myOrgIds.includes(item.id)}
      onPress={() => handleOrgPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="briefcase" size={48} color={theme.textSecondary} />
      <ThemedText type="h3" style={styles.emptyTitle}>
        {activeTab === "my" ? "No organizations yet" : "No organizations to discover"}
      </ThemedText>
      <ThemedText type="body" style={[styles.emptyText, { color: theme.textSecondary }]}>
        {activeTab === "my"
          ? "Create or join an organization to get started"
          : `No public organizations in ${getCityName(selectedCity)}`}
      </ThemedText>
      {activeTab === "my" ? (
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleCreateOrg}
        >
          <ThemedText type="body" style={{ color: "#fff", fontWeight: "600" }}>
            Create Organization
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );

  const currentData = activeTab === "my" ? myOrgs : discoverOrgs;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "my" && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setActiveTab("my")}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "my" ? theme.primary : theme.textSecondary },
            ]}
          >
            My Orgs
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "discover" && [styles.activeTab, { borderBottomColor: theme.primary }],
          ]}
          onPress={() => setActiveTab("discover")}
        >
          <ThemedText
            type="body"
            style={[
              styles.tabText,
              { color: activeTab === "discover" ? theme.primary : theme.textSecondary },
            ]}
          >
            Discover
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={currentData}
        renderItem={renderOrg}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: "600",
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  orgCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  orgAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  orgContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  orgMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  memberBadge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["4xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  createButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
