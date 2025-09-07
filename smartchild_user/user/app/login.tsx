// user/app/login.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Image
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "../constants/api";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onSubmit = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_BASE}/login`, {
        usernameOrEmail: username,
        password,
      });

      if (res.data?.success) {
        await AsyncStorage.setItem("sc_user", JSON.stringify(res.data.user));
        router.replace("/home-dashboard");
      } else {
        setError(res.data?.message || "Invalid credentials");
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Login failed, please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: "height" })}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            {/* Logo circle with your image */}
            <View style={styles.logo}>
              <Image
                source={require("../assets/images/smartchild-logo.png")} // <- your logo
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>Smart Child</Text>
            <Text style={styles.tagline}>Learn • Grow • Succeed</Text>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formSection}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue learning</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username or Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "username" && styles.inputFocused,
                  error && styles.inputError,
                ]}
                placeholder="Enter your username or email"
                placeholderTextColor="#81C784"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "password" && styles.inputFocused,
                  error && styles.inputError,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#81C784"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={onSubmit}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  headerSection: {
    backgroundColor: "#388E3C",
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#1B5E20",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#C8E6C9",
    overflow: "hidden", // ensures the image respects the circle shape
  },
  logoImg: {
    width: "88%",
    height: "88%",
    borderRadius: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: "#C8E6C9",
    fontWeight: "500",
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#388E3C",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 10,
    alignSelf: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#1B5E20",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F1F8E9",
    fontSize: 16,
    color: "#1B5E20",
    fontWeight: "500",
  },
  inputFocused: {
    borderColor: "#4CAF50",
    backgroundColor: "#FFFFFF",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  inputError: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  error: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#388E3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.8,
  },
});
