import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

export default function UserProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const tabBarHeight = useBottomTabBarHeight();
  const { comrades, posts } = useData();
  const [showQR, setShowQR] = useState(false);

  const userPosts = posts.filter((p) => p.authorId === user?.id);

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleScanQR = () => {
    navigation.navigate("QRScanner");
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.notFound}>
          <ThemedText type="body">Not logged in</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScreenScrollView contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
          <ThemedText
            type="h1"
            lightColor="#fff"
            darkColor="#fff"
            style={styles.avatarText}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText type="h2" style={styles.displayName}>
          {user.displayName}
        </ThemedText>
        {user.bio ? (
          <ThemedText type="body" style={[styles.bio, { color: theme.textSecondary }]}>
            {user.bio}
          </ThemedText>
        ) : null}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText type="h3">{comrades.length}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Comrades
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statItem}>
            <ThemedText type="h3">{userPosts.length}</ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Posts
            </ThemedText>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            { borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleEditProfile}
        >
          <ThemedText type="body" style={{ color: theme.primary }}>
            Edit Profile
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.qrSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.qrHeader}>
          <ThemedText type="h4">My QR Code</ThemedText>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            onPress={() => setShowQR(!showQR)}
          >
            <Feather
              name={showQR ? "chevron-up" : "chevron-down"}
              size={24}
              color={theme.text}
            />
          </Pressable>
        </View>
        {showQR ? (
          <View style={styles.qrContainer}>
            <View style={[styles.qrPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
              <Image
                source={require("../assets/images/icon.png")}
                style={styles.qrLogo}
                resizeMode="contain"
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                QR Code for {user.displayName}
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                ID: {user.id.substring(0, 8)}
              </ThemedText>
            </View>
            <ThemedText type="small" style={[styles.qrHint, { color: theme.textSecondary }]}>
              Share this QR code with comrades to connect
            </ThemedText>
          </View>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.actionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handleScanQR}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.primary }]}>
          <Feather name="camera" size={20} color="#fff" />
        </View>
        <View style={styles.actionContent}>
          <ThemedText type="h4">Add Comrade</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Scan a QR code to connect
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </Pressable>

      <View style={styles.postsSection}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          My Posts
        </ThemedText>
        {userPosts.length > 0 ? (
          userPosts.slice(0, 5).map((post) => (
            <View
              key={post.id}
              style={[styles.postPreview, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <ThemedText type="body" numberOfLines={2}>
                {post.content}
              </ThemedText>
              <View style={styles.postMeta}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </ThemedText>
                <View style={styles.postStats}>
                  <Feather name="heart" size={12} color={theme.textSecondary} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                    {post.likes}
                  </ThemedText>
                  <Feather name="message-circle" size={12} color={theme.textSecondary} style={{ marginLeft: 8 }} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: 4 }}>
                    {post.commentCount}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyPosts}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              No posts yet
            </ThemedText>
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
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
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 40,
  },
  displayName: {
    marginBottom: Spacing.xs,
  },
  bio: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  editButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  qrSection: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  qrLogo: {
    width: 60,
    height: 60,
  },
  qrHint: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  postsSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  postPreview: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyPosts: {
    alignItems: "center",
    padding: Spacing.xl,
  },
});
