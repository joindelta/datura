import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Post, OrgMembership } from "@/types";
import { OrgsStackParamList } from "@/navigation/OrgsStackNavigator";

type OrgHubRouteProp = RouteProp<OrgsStackParamList, "OrganizationHub">;

export default function OrganizationHubScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute<OrgHubRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<OrgsStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    organizations,
    userMemberships,
    posts,
    getOrganizationMembers,
    joinOrganization,
  } = useData();
  const [activeTab, setActiveTab] = useState<"feed" | "members" | "about">("feed");
  const [members, setMembers] = useState<OrgMembership[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const org = organizations.find((o) => o.id === route.params.orgId);
  const isMember = userMemberships.some((m) => m.organizationId === route.params.orgId);
  const isOwner = org?.ownerId === user?.id;
  const orgPosts = posts.filter((p) => p.organizationId === route.params.orgId);

  const loadMembers = useCallback(async () => {
    if (!org) return;
    const orgMembers = await getOrganizationMembers(org.id);
    setMembers(orgMembers);
  }, [org, getOrganizationMembers]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleJoin = async () => {
    if (!org) return;
    setIsJoining(true);
    try {
      await joinOrganization(org.id);
    } catch (error) {
      console.error("Failed to join organization:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = (postToOrg: boolean) => {
    navigation.navigate("CreatePost", {
      orgId: org?.id,
      orgName: org?.name,
      postToOrgFeed: postToOrg,
    });
  };

  if (!org) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="body">Organization not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const renderFeedTab = () => (
    <View style={styles.tabContent}>
      {isMember ? (
        <View style={[styles.postButtonsRow, { borderBottomColor: theme.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => handleCreatePost(false)}
          >
            <Feather name="globe" size={16} color="#fff" />
            <ThemedText type="small" style={{ color: "#fff", marginLeft: Spacing.xs }}>
              Post to City
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.postButton,
              { backgroundColor: theme.secondary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => handleCreatePost(true)}
          >
            <Feather name="briefcase" size={16} color="#fff" />
            <ThemedText type="small" style={{ color: "#fff", marginLeft: Spacing.xs }}>
              Post to Org
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
      {orgPosts.length > 0 ? (
        orgPosts.map((post) => (
          <View
            key={post.id}
            style={[styles.postCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <ThemedText type="small" style={{ fontWeight: "600" }}>
              {post.authorName}
            </ThemedText>
            <ThemedText type="body" style={{ marginTop: Spacing.xs }}>
              {post.content}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              {getTimeAgo(post.createdAt)}
            </ThemedText>
          </View>
        ))
      ) : (
        <View style={styles.emptyTab}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            No posts yet
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      {members.map((membership) => (
        <View
          key={membership.id}
          style={[styles.memberRow, { borderBottomColor: theme.border }]}
        >
          <View style={[styles.memberAvatar, { backgroundColor: theme.primary }]}>
            <Feather name="user" size={18} color="#fff" />
          </View>
          <View style={styles.memberInfo}>
            <ThemedText type="body">
              {membership.userId === user?.id ? user.displayName : "Comrade"}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
            </ThemedText>
          </View>
          {membership.role === "owner" ? (
            <Feather name="star" size={18} color={theme.secondary} />
          ) : null}
        </View>
      ))}
      {isOwner ? (
        <Pressable
          style={({ pressed }) => [
            styles.inviteButton,
            { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="user-plus" size={18} color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.primary, marginLeft: Spacing.sm }}>
            Invite Comrades
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.aboutSection}>
        <ThemedText type="h4" style={styles.aboutLabel}>
          Description
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {org.description || "No description provided."}
        </ThemedText>
      </View>
      <View style={styles.aboutSection}>
        <ThemedText type="h4" style={styles.aboutLabel}>
          Created
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {new Date(org.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <View style={styles.aboutSection}>
        <ThemedText type="h4" style={styles.aboutLabel}>
          Visibility
        </ThemedText>
        <View style={styles.visibilityRow}>
          <Feather
            name={org.isPublic ? "globe" : "lock"}
            size={16}
            color={theme.textSecondary}
          />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}>
            {org.isPublic ? "Public" : "Private"}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: org.avatarColor }]}>
          <Feather name="briefcase" size={48} color="#fff" />
          <ThemedText type="h2" style={styles.orgName} lightColor="#fff" darkColor="#fff">
            {org.name}
          </ThemedText>
          <View style={styles.metaRow}>
            <Feather name="users" size={14} color="rgba(255,255,255,0.8)" />
            <ThemedText
              type="small"
              lightColor="rgba(255,255,255,0.8)"
              darkColor="rgba(255,255,255,0.8)"
              style={{ marginLeft: Spacing.xs }}
            >
              {org.memberCount} members
            </ThemedText>
          </View>
          {!isMember ? (
            <Pressable
              style={({ pressed }) => [
                styles.joinButton,
                { backgroundColor: "#fff", opacity: isJoining ? 0.5 : pressed ? 0.9 : 1 },
              ]}
              onPress={handleJoin}
              disabled={isJoining}
            >
              <ThemedText type="body" style={{ color: org.avatarColor, fontWeight: "600" }}>
                {isJoining ? "Joining..." : "Join Organization"}
              </ThemedText>
            </Pressable>
          ) : (
            <View style={[styles.memberBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Feather name="check" size={14} color="#fff" />
              <ThemedText type="small" lightColor="#fff" darkColor="#fff" style={{ marginLeft: 4 }}>
                {isOwner ? "Owner" : "Member"}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
          {(["feed", "members", "about"] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && [styles.activeTab, { borderBottomColor: theme.primary }],
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <ThemedText
                type="body"
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? theme.primary : theme.textSecondary },
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {activeTab === "feed" && renderFeedTab()}
        {activeTab === "members" && renderMembersTab()}
        {activeTab === "about" && renderAboutTab()}
      </ScrollView>
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
  header: {
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
    paddingBottom: Spacing["2xl"],
    alignItems: "center",
  },
  orgName: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  joinButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
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
  tabContent: {
    padding: Spacing.lg,
  },
  postButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  postButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  postCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  emptyTab: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  memberInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  aboutSection: {
    marginBottom: Spacing.xl,
  },
  aboutLabel: {
    marginBottom: Spacing.sm,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
