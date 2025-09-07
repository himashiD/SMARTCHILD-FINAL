// user/app/home-dashboard.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE2 } from "@/constants/api2";

const { width } = Dimensions.get("window");

type Card = { label: string; icon: string; color: string };

type Notice = {
  notice_id: number;
  notice_image: string | null;
  notice_title: string;
  notice_description: string | null;
  notice_date: string;
  notice_start_time: string | null;
  notice_end_time: string | null;
  notice_venue: string | null;
};

const CARD_DATA: Card[] = [
  { label: "Vaccination", icon: "medkit-outline", color: "#4CAF50" },
  { label: "Nutrition", icon: "nutrition-outline", color: "#FF9800" },
  { label: "Records", icon: "document-text-outline", color: "#3F51B5" },
  { label: "Growth", icon: "body-outline", color: "#9C27B0" },
  { label: "Notice", icon: "chatbubbles-outline", color: "#009688" },
  { label: "Emergency", icon: "medical-outline", color: "#f44336" },
  // ✅ Optional: show a Chatbot quick card too
  // { label: "Chatbot", icon: "chatbubble-ellipses-outline", color: "#4CAF50" },
];

export default function HomeScreen() {
  const router = useRouter();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchNotices();
    getUserDetails();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_BASE2}/notices`);
      const data = await response.json();
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching notices:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async () => {
    try {
      const raw = await AsyncStorage.getItem("sc_user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(`${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim() || "User");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleCardPress = (label: string) => {
    if (label === "Notice") router.push("/notice-board");
    else if (label === "Growth") router.push("/growth-monitoring");
    else if (label === "Nutrition") router.push("/nutrition-guide");
    else if (label === "Emergency") router.push("/emergency-contacts");
    else if (label === "Chatbot") router.push("/chatbot");
    else if (label === "Records") router.push("/medical-records");

  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading notices…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.leftProfile}>
            <Image source={{ uri: "https://i.pravatar.cc/150?img=4" }} style={styles.profileImage} />
            <View>
              <Text style={styles.helloText}>Hello,</Text>
              <Text style={styles.userName}>{userName || "User"}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            placeholder="Search doctor or feature"
            placeholderTextColor="#aaa"
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cards Section */}
        <Animated.View style={[styles.cardsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cardsGrid}>
            {CARD_DATA.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.card, { borderTopColor: item.color }]}
                activeOpacity={0.85}
                onPress={() => handleCardPress(item.label)}
              >
                <View style={styles.cardIconContainer}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.cardLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Upcoming Vaccination (sample) */}
        <Animated.View style={[styles.appointmentSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={22} color="#2c3e50" />
            <Text style={styles.sectionTitle}>Upcoming Vaccination</Text>
          </View>

          <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.appointmentCard}>
            <View style={styles.appointmentInfo}>
              <Image
                source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }}
                style={styles.doctorImage}
              />
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>Dr. Jennifer Smith</Text>
                <Text style={styles.speciality}>Polio Vaccination</Text>
                <View style={styles.appointmentTime}>
                  <Ionicons name="time-outline" size={14} color="#f0f0f0" />
                  <Text style={styles.dateTime}>Wed, 7 Sep • 10:30–11:30 AM</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.appointmentButton}>
              <Text style={styles.appointmentButtonText}>View Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBarContainer}>
        <View className="bottomBar" style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.replace("/home-dashboard")}
          >
            <Ionicons name="home" size={24} color="#4CAF50" />
            <Text style={[styles.tabText, styles.activeTab]}>Home</Text>
          </TouchableOpacity>

          {/* ✅ Chatbot tab routes to /chatbot */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => router.push("/chatbot")}
          >
            <Ionicons name="chatbubbles-outline" size={24} color="#A0A0A0" />
            <Text style={styles.tabText}>Chatbot</Text>
          </TouchableOpacity>

          {/* Center Floating Action Button */}
          <View style={styles.logoWrapper}>
            <TouchableOpacity style={styles.logoButton} activeOpacity={0.85}>
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={24} color="#A0A0A0" />
            <Text style={styles.tabText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
  style={styles.tabItem}
  activeOpacity={0.7}
  onPress={() => router.push("/profile")}   // ⬅️ add this
>
  <Ionicons name="person-outline" size={24} color="#A0A0A0" />
  <Text style={styles.tabText}>Profile</Text>
</TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  leftProfile: { flexDirection: "row", alignItems: "center" },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  helloText: { color: "rgba(255, 255, 255, 0.9)", fontSize: 14, fontWeight: "400" },
  userName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },

  notificationIcon: {
    position: "relative",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ff4757",
    borderRadius: 9,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  notificationBadgeText: { fontSize: 10, color: "#fff", fontWeight: "bold" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#333" },

  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  cardsSection: { padding: 20 },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    width: (width - 60) / 3,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderTopWidth: 4,
    borderTopColor: "#4CAF50",
    minHeight: 90,
  },
  cardIconContainer: { marginBottom: 8, alignItems: "center", justifyContent: "center" },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    lineHeight: 14,
    flexShrink: 1,
  },

  appointmentSection: { paddingHorizontal: 20, marginTop: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#2c3e50", marginLeft: 10 },

  appointmentCard: {
    borderRadius: 20,
    padding: 25,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  appointmentInfo: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  doctorImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginRight: 18,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  doctorDetails: { flex: 1 },
  doctorName: { fontSize: 18, fontWeight: "600", color: "white", marginBottom: 4 },
  speciality: { fontSize: 14, color: "rgba(255, 255, 255, 0.9)", marginBottom: 6 },
  appointmentTime: { flexDirection: "row", alignItems: "center" },
  dateTime: { fontSize: 13, color: "#f0f0f0", marginLeft: 6 },

  appointmentButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  appointmentButtonText: { color: "#4CAF50", fontWeight: "600", fontSize: 14, marginRight: 8 },

  bottomSpacing: { height: 20 },

  bottomBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: 75,
    paddingHorizontal: 10,
    width: "100%",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1, paddingVertical: 8 },
  tabText: { fontSize: 11, color: "#777", marginTop: 4, fontWeight: "500" },
  activeTab: { color: "#4CAF50", fontWeight: "600" },

  logoWrapper: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    backgroundColor: "transparent",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  logoButton: {
    width: 60,
    height: 60,
    backgroundColor: "#4CAF50",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },

  // (kept for future notices table, if needed)
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  headerRow: {
    backgroundColor: "#e8f5e9",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 2,
    borderColor: "#4CAF50",
  },
  colTitle: { flex: 2, fontWeight: "bold", color: "#388e3c", fontSize: 15, paddingLeft: 8 },
  headerText: { fontWeight: "bold", color: "#388e3c", fontSize: 15 },
  col: { flex: 1, color: "#333", fontSize: 14, textAlign: "center" },
  titleCell: { flex: 2, flexDirection: "row", alignItems: "center" },
  thumb: { width: 36, height: 36, borderRadius: 8, marginRight: 8, backgroundColor: "#c8e6c9" },
  thumbPlaceholder: { backgroundColor: "#e0e0e0", borderWidth: 1, borderColor: "#bdbdbd" },
  titleText: { flex: 1, fontWeight: "600", fontSize: 14, color: "#222" },

  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
