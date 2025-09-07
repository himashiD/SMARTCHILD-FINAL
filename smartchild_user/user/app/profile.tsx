// user/app/profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type User = {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  child_id?: number;
  dob?: string;
  gender?: string;
  address?: string;

  // Optional extras (supported by this screen)
  blood_group?: string;         // e.g., "A+"
  birth_weight?: number | string; // kg
  guardian_name?: string;       // e.g., "Nimal Perera"
  guardian_nic?: string;        // e.g., "991234567V"
  created_at?: string;          // ISO or "YYYY-MM-DD HH:mm:ss"
  updated_at?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("sc_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    })();
  }, []);

  const fullName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.username ||
    "User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  const onBack = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/home-dashboard");
  };

  const onEdit = () => {
  router.push("/update-profile");
};


  const onLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("sc_user");
          } finally {
            router.replace("/login");
          }
        },
      },
    ]);
  };

  const fmtDateTime = (v?: string) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header (earlier-style circular back button) */}
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backFab}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 38 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {user?.photo_url ? (
              <Image source={{ uri: user.photo_url }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                style={[styles.avatar, styles.avatarGradient]}
              >
                <Text style={styles.initials}>{initials || "SC"}</Text>
              </LinearGradient>
            )}
          </View>

          <Text style={styles.name}>{fullName}</Text>
          {!!user?.username && (
            <Text style={styles.username}>@{user.username}</Text>
          )}

          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={18} color="#166534" />
              <Text style={styles.quickBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnLight]}
              onPress={() => Alert.alert("Settings", "Open app settings")}
            >
              <Ionicons name="settings-outline" size={18} color="#0f766e" />
              <Text style={[styles.quickBtnText, { color: "#0f766e" }]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact child info chips */}
        <View style={styles.chipsCard}>
          {!!user?.child_id && (
            <Chip icon="pricetag-outline" label={`ID: ${user.child_id}`} />
          )}
          {!!user?.dob && <Chip icon="calendar-outline" label={user.dob} />}
          {!!user?.gender && <Chip icon="male-female-outline" label={user.gender} />}
          {!!user?.blood_group && <Chip icon="water-outline" label={`Blood: ${user.blood_group}`} />}
          {(user?.birth_weight ?? "") !== "" && (
            <Chip icon="scale-outline" label={`Birth Wt: ${user?.birth_weight} kg`} />
          )}
        </View>

        {/* Info list */}
        <View style={styles.listCard}>
          <Item icon="mail-outline" label="Email" value={user?.email || "nimal@gmail.com"} />
          <Divider />
          <Item icon="call-outline" label="Phone" value={user?.phone || "0771234567"} />	
          <Divider />
          <Item icon="location-outline" label="Address" value={user?.address || "Colombo, Sri Lanka"} />
          <Divider />
          <Item icon="people-outline" label="Guardian" value={user?.guardian_name || "Nimal Perera"} />
          <Divider />
          <Item icon="finger-print-outline" label="Guardian NIC" value={user?.guardian_nic || "991234567V"} />
          <Divider />
          <Item icon="time-outline" label="Created" value={fmtDateTime(user?.created_at)|| "2025-08-24 01:08:05"} />
          <Divider />
          <Item icon="refresh-outline" label="Updated" value={fmtDateTime(user?.updated_at)|| "2025-08-28 01:08:05"} />
        </View>
	
        {/* Danger zone */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Item({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={18} color="#475569" />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Text style={styles.itemValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Chip({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color="#166534" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backFab: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginBottom: 16,
  },
  avatarWrap: { alignItems: "center", marginBottom: 10 },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: "#e2e8f0" },
  avatarGradient: { alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontSize: 30, fontWeight: "800" },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  username: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginTop: 2,
  },
  quickRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 14,
  },
  quickBtn: {
    backgroundColor: "#e8f5e9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quickBtnLight: { backgroundColor: "#ecfeff" },
  quickBtnText: { fontSize: 13, fontWeight: "800", color: "#166534" },

  chipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  chipText: { color: "#166534", fontWeight: "700", fontSize: 12 },

  listCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  itemLabel: { color: "#334155", fontWeight: "700", fontSize: 14 },
  itemValue: { color: "#475569", fontSize: 14, flex: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: "#e2e8f0", opacity: 0.8 },

  logoutBtn: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
