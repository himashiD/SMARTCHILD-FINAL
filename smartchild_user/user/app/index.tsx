// user/app/index.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => router.replace("/login"), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.Image
          source={require("../assets/images/smartchild-logo.png")} // ✅ correct path
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SMART CHILD</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4CAF50", justifyContent: "center", alignItems: "center" },
  logoBox: { alignItems: "center" },
  logo: { width: 140, height: 140, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)" },
  appName: { marginTop: 20, color: "white", fontSize: 28, fontWeight: "bold", letterSpacing: 1.5 },
});
