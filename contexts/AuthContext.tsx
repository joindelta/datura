import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import { User } from "@/types";
import {
  getUser,
  saveUser,
  createUser,
  clearUser,
  getBiometricEnabled,
  setBiometricEnabled,
  clearAllData,
} from "@/utils/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
  login: (displayName: string, city: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    loadUser();
    checkBiometricAvailability();
  }, []);

  async function loadUser() {
    try {
      const storedUser = await getUser();
      const bioEnabled = await getBiometricEnabled();
      setUser(storedUser);
      setBiometricEnabledState(bioEnabled);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function checkBiometricAvailability() {
    try {
      if (Platform.OS === "web") {
        setBiometricAvailable(false);
        return;
      }
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(hasHardware && isEnrolled);
    } catch {
      setBiometricAvailable(false);
    }
  }

  async function login(displayName: string, city: string) {
    const newUser = await createUser(displayName, city);
    setUser(newUser);
  }

  async function logout() {
    await clearAllData();
    setUser(null);
    setBiometricEnabledState(false);
  }

  async function updateProfile(updates: Partial<User>) {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);
    setUser(updatedUser);
  }

  async function authenticateWithBiometric(): Promise<boolean> {
    if (Platform.OS === "web") {
      return true;
    }
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access Comrade",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      return result.success;
    } catch {
      return false;
    }
  }

  async function enableBiometric(): Promise<boolean> {
    const success = await authenticateWithBiometric();
    if (success) {
      await setBiometricEnabled(true);
      setBiometricEnabledState(true);
    }
    return success;
  }

  async function disableBiometric() {
    await setBiometricEnabled(false);
    setBiometricEnabledState(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        biometricEnabled,
        biometricAvailable,
        login,
        logout,
        updateProfile,
        authenticateWithBiometric,
        enableBiometric,
        disableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
