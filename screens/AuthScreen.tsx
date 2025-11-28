import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { CITIES } from "@/types";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { findNearestCity } from "@/utils/locationUtils";

export default function AuthScreen() {
  const { theme } = useTheme();
  const { login, biometricAvailable, authenticateWithBiometric } = useAuth();
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState("");
  const [selectedCity, setSelectedCity] = useState("sf");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    detectUserLocation();
  }, []);

  const detectUserLocation = async () => {
    try {
      setIsDetectingLocation(true);
      setDetectionError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setDetectionError("Location permission denied");
        setIsDetectingLocation(false);
        return;
      }

      // For web, show helpful message instead of trying to access location
      if (Platform.OS === "web") {
        setDetectionError(
          "Run in Expo Go to automatically detect your city"
        );
        setIsDetectingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const cityId = findNearestCity(
        location.coords.latitude,
        location.coords.longitude
      );
      setSelectedCity(cityId);
      setDetectionError(null);
    } catch (error) {
      console.error("Error detecting location:", error);
      setDetectionError("Could not detect location");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleLogin = async () => {
    if (!displayName.trim()) return;
    
    setIsLoading(true);
    try {
      if (biometricAvailable && Platform.OS !== "web") {
        const success = await authenticateWithBiometric();
        if (!success) {
          setIsLoading(false);
          return;
        }
      }
      await login(displayName.trim(), selectedCity);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCityName = CITIES.find((c) => c.id === selectedCity)?.name || "Select City";

  return (
    <ThemedView style={styles.container}>
      <ScreenKeyboardAwareScrollView
        hasTabBar={false}
        hasHeader={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.appName}>
            Comrade
          </ThemedText>
          <ThemedText type="body" style={[styles.tagline, { color: theme.textSecondary }]}>
            Connect with your community
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.label}>
              Display Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText type="small" style={styles.label}>
              Your City {!isDetectingLocation && !detectionError && "✓"}
            </ThemedText>

            {detectionError ? (
              <View
                style={[
                  styles.detectionErrorContainer,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Feather name="alert-circle" size={16} color={theme.warning} />
                <ThemedText
                  type="caption"
                  style={[styles.detectionErrorText, { color: theme.warning }]}
                >
                  {detectionError}
                </ThemedText>
              </View>
            ) : null}

            <Pressable
              style={[
                styles.citySelector,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setShowCityPicker(!showCityPicker)}
              disabled={isDetectingLocation}
            >
              <View style={styles.citySelectorContent}>
                <ThemedText type="body">{selectedCityName}</ThemedText>
                {isDetectingLocation && (
                  <Feather
                    name="map-pin"
                    size={16}
                    color={theme.textSecondary}
                    style={styles.detectingIcon}
                  />
                )}
              </View>
              <Feather
                name={showCityPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>

            {showCityPicker ? (
              <View
                style={[
                  styles.cityList,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
              >
                {CITIES.map((city) => (
                  <Pressable
                    key={city.id}
                    style={({ pressed }) => [
                      styles.cityOption,
                      {
                        backgroundColor:
                          selectedCity === city.id
                            ? theme.backgroundSecondary
                            : pressed
                              ? theme.backgroundSecondary
                              : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedCity(city.id);
                      setShowCityPicker(false);
                    }}
                  >
                    <ThemedText type="body">{city.name}</ThemedText>
                    {selectedCity === city.id ? (
                      <Feather name="check" size={18} color={theme.primary} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <Button
            onPress={handleLogin}
            disabled={!displayName.trim() || isLoading}
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
          >
            {isLoading ? "Setting up..." : "Get Started"}
          </Button>

          {biometricAvailable && Platform.OS !== "web" ? (
            <View style={styles.biometricHint}>
              <Feather name="shield" size={16} color={theme.success} />
              <ThemedText
                type="caption"
                style={[styles.hintText, { color: theme.textSecondary }]}
              >
                Secured with biometric authentication
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <ThemedText
            type="caption"
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </ThemedText>
        </View>
      </ScreenKeyboardAwareScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.sm,
  },
  tagline: {
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  citySelector: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityList: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    maxHeight: 200,
  },
  cityOption: {
    height: 44,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  citySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detectingIcon: {
    marginLeft: Spacing.xs,
  },
  detectionErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  detectionErrorText: {
    flex: 1,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  biometricHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  hintText: {
    textAlign: "center",
  },
  footer: {
    paddingTop: Spacing["2xl"],
  },
  footerText: {
    textAlign: "center",
  },
});
