import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/contexts/DataContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AVATAR_COLORS } from "@/types";

export default function QRScannerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { addComrade } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedUser, setScannedUser] = useState<{ id: string; name: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      if (data.startsWith("comrade://user/")) {
        const userId = data.replace("comrade://user/", "");
        setScannedUser({
          id: userId,
          name: "Scanned Comrade",
        });
      } else {
        setScannedUser({
          id: data.substring(0, 20),
          name: "New Comrade",
        });
      }
    } catch (error) {
      console.error("Failed to parse QR code:", error);
      setScanned(false);
    }
  };

  const handleAddComrade = async () => {
    if (!scannedUser) return;

    setIsAdding(true);
    try {
      await addComrade(scannedUser.id);
      navigation.goBack();
    } catch (error) {
      console.error("Failed to add comrade:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedUser(null);
  };

  if (Platform.OS === "web") {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.webFallback, { paddingTop: insets.top + Spacing.xl }]}>
          <Feather name="camera-off" size={64} color={theme.textSecondary} />
          <ThemedText type="h3" style={styles.webTitle}>
            Camera Not Available
          </ThemedText>
          <ThemedText type="body" style={[styles.webText, { color: theme.textSecondary }]}>
            Run this app in Expo Go on your mobile device to scan QR codes
          </ThemedText>
          <Button onPress={() => navigation.goBack()} style={{ marginTop: Spacing.xl }}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText type="body">Loading camera...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.permissionContainer, { paddingTop: insets.top + Spacing["4xl"] }]}>
          <Feather name="camera" size={64} color={theme.textSecondary} />
          <ThemedText type="h3" style={styles.permissionTitle}>
            Camera Access Required
          </ThemedText>
          <ThemedText type="body" style={[styles.permissionText, { color: theme.textSecondary }]}>
            We need camera access to scan QR codes and connect with comrades
          </ThemedText>
          <Button onPress={requestPermission} style={{ marginTop: Spacing.xl }}>
            Grant Permission
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: "rgba(0,0,0,0.5)", opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={24} color="#fff" />
          </Pressable>
          <ThemedText type="h4" lightColor="#fff" darkColor="#fff">
            Scan QR Code
          </ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.scanArea}>
          <View style={[styles.scanFrame, { borderColor: theme.primary }]}>
            <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
          </View>
        </View>

        {scannedUser ? (
          <View style={[styles.resultContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.scannedAvatar, { backgroundColor: AVATAR_COLORS[0] }]}>
              <ThemedText type="h3" lightColor="#fff" darkColor="#fff">
                {scannedUser.name.charAt(0)}
              </ThemedText>
            </View>
            <ThemedText type="h4" style={styles.scannedName}>
              {scannedUser.name}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              ID: {scannedUser.id.substring(0, 12)}...
            </ThemedText>
            <View style={styles.resultButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.resultButton,
                  { backgroundColor: theme.backgroundSecondary, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={handleScanAgain}
              >
                <ThemedText type="body">Scan Again</ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.resultButton,
                  { backgroundColor: theme.primary, opacity: isAdding ? 0.5 : pressed ? 0.8 : 1 },
                ]}
                onPress={handleAddComrade}
                disabled={isAdding}
              >
                <ThemedText type="body" style={{ color: "#fff" }}>
                  {isAdding ? "Adding..." : "Add Comrade"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.hint}>
            <ThemedText type="body" lightColor="#fff" darkColor="#fff" style={{ textAlign: "center" }}>
              Point your camera at a comrade's QR code
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  webTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  webText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  permissionText: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  scanArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: BorderRadius.sm,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: BorderRadius.sm,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: BorderRadius.sm,
  },
  hint: {
    padding: Spacing.xl,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  resultContainer: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  scannedAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  scannedName: {
    marginBottom: Spacing.xs,
  },
  resultButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  resultButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
