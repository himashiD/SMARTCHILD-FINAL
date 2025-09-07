// user/app/emergency-contacts.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/** ─────────────────────────────────────────────────────────
 *  Sri Lanka emergency contacts (verified national hotlines)
 *  ───────────────────────────────────────────────────────── */
type EmergencyContact = {
  contact_id: number;
  name: string;
  category: string;
  phone_number: string;           // primary number (short code where possible)
  secondary_phone?: string;       // optional landline/alt
  description: string;
  availability: string;
  is_active: boolean;
  priority: number;               // lower = show as higher priority
  icon_name:
    | "medkit"
    | "shield"
    | "flame"
    | "alert-circle"
    | "shield-checkmark"
    | "chatbubble-ellipses"
    | "heart"
    | "airplane"
    | "call";
};

const emergencyContacts: EmergencyContact[] = [
  {
    contact_id: 1,
    name: "Ambulance – 1990 Suwa Seriya",
    category: "Medical",
    phone_number: "1990",
    description: "Free island-wide ambulance service.",
    availability: "24/7",
    is_active: true,
    priority: 1,
    icon_name: "medkit",
  },
  {
    contact_id: 2,
    name: "Police Emergency",
    category: "Safety",
    phone_number: "119",
    secondary_phone: "118",
    description: "Sri Lanka Police emergency hotline (alt: 118).",
    availability: "24/7",
    is_active: true,
    priority: 2,
    icon_name: "shield",
  },
  {
    contact_id: 3,
    name: "Fire & Rescue",
    category: "Safety",
    phone_number: "110",
    description: "Fire Brigade emergency hotline.",
    availability: "24/7",
    is_active: true,
    priority: 3,
    icon_name: "flame",
  },
  {
    contact_id: 4,
    name: "Disaster Management Centre (DMC)",
    category: "Safety",
    phone_number: "117",
    description: "National disaster & emergency coordination.",
    availability: "24/7",
    is_active: true,
    priority: 4,
    icon_name: "alert-circle",
  },
  {
    contact_id: 5,
    name: "Childline – National Child Protection Authority",
    category: "Child Protection",
    phone_number: "1929",
    description: "Report child abuse / get support for children.",
    availability: "24/7",
    is_active: true,
    priority: 5,
    icon_name: "shield-checkmark",
  },
  {
    contact_id: 6,
    name: "Women's Help Line",
    category: "Women & Child",
    phone_number: "1938",
    description: "Help line for women & children.",
    availability: "24/7",
    is_active: true,
    priority: 6,
    icon_name: "heart",
  },
  {
    contact_id: 7,
    name: "Mental Health Support (NIMH)",
    category: "Mental Health",
    phone_number: "1926",
    description: "Counselling & crisis support via NIMH.",
    availability: "24/7",
    is_active: true,
    priority: 7,
    icon_name: "chatbubble-ellipses",
  },
  {
    contact_id: 8,
    name: "Sri Lanka Tourism Hotline",
    category: "Tourism",
    phone_number: "1912",
    description: "Tourist information & assistance.",
    availability: "24/7",
    is_active: true,
    priority: 8,
    icon_name: "airplane",
  },
  {
    contact_id: 9,
    name: "National Hospital (Accident Service)",
    category: "Medical",
    phone_number: "1959",
    secondary_phone: "+94 11 269 1111",
    description: "Accident Service & general hospital contact.",
    availability: "24/7",
    is_active: true,
    priority: 9,
    icon_name: "medkit",
  },
];

/** ───────────────────────────────────────────────────────── */

const getCategoryColor = (category: string) => {
  // green-first palette (keeps app’s theme)
  const colors: Record<string, { bg: string; text: string }> = {
    "Medical": { bg: "#dcfce7", text: "#166534" },
    "Safety": { bg: "#eaf3ff", text: "#1d4ed8" },
    "Child Protection": { bg: "#f5f3ff", text: "#6d28d9" },
    "Women & Child": { bg: "#fff7ed", text: "#c2410c" },
    "Mental Health": { bg: "#ecfeff", text: "#0e7490" },
    "Tourism": { bg: "#f0fdf4", text: "#15803d" },
  };
  return colors[category] || { bg: "#f1f5f9", text: "#334155" };
};

export default function EmergencyContacts() {
  const router = useRouter();
  const [data, setData] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    // If you later fetch from backend, replace below
    await new Promise((r) => setTimeout(r, 250));
    setData(emergencyContacts.filter((c) => c.is_active).sort((a, b) => a.priority - b.priority));
  };

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onBackPress = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/home-dashboard");
  };

  const makePhoneCall = (phoneNumber: string, contactName: string) => {
    Alert.alert(`Call ${contactName}`, `Do you want to call ${phoneNumber}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: async () => {
          const url = `tel:${phoneNumber}`;
          const ok = await Linking.canOpenURL(url);
          if (ok) Linking.openURL(url);
          else Alert.alert("Not supported", "Phone calls are not supported on this device");
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: EmergencyContact }) => {
    const c = getCategoryColor(item.category);
    return (
      <TouchableOpacity
        style={[styles.card, item.priority <= 3 && styles.priorityCard]}
        activeOpacity={0.85}
        onPress={() => makePhoneCall(item.phone_number, item.name)}
      >
        <View style={styles.row}>
          <View style={[styles.iconBadge, { backgroundColor: c.bg }]}>
            <Ionicons name={item.icon_name} size={22} color={c.text} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={styles.title}>{item.name}</Text>
              {item.priority <= 3 && (
                <View style={styles.urgentPill}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.badge, { backgroundColor: c.bg, color: c.text }]}>
                {item.category}
              </Text>
              <Text style={styles.availability}>{item.availability}</Text>
            </View>

            <Text style={styles.phone}>{item.phone_number}</Text>
            {item.secondary_phone ? (
              <Text style={styles.secondary}>Alt: {item.secondary_phone}</Text>
            ) : null}

            <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
          </View>

          <View style={styles.callAction}>
            <Ionicons name="call" size={18} color="#166534" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={20} color="#fff" />
      </TouchableOpacity>

      <View style={styles.headerTextWrap}>
        <Text style={styles.headerTitle}>🚨 Emergency Contacts</Text>
        <Text style={styles.headerSub}>Quick access to national hotlines</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading emergency contacts…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.statWrap}>
        <View style={styles.statCard}>
          <Ionicons name="call-outline" size={18} color="#166534" />
          <Text style={styles.statNum}>{data.length}</Text>
          <Text style={styles.statLabel}>Hotlines Available</Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(c) => String(c.contact_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="call-outline" size={56} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No emergency contacts</Text>
            <Text style={styles.emptySub}>They’ll appear here when available.</Text>
          </View>
        }
      />
    </View>
  );
}

/* ─────────────────────────  styles  ───────────────────────── */
import { ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    backgroundColor: "#4CAF50",
    paddingTop: 50,
    paddingBottom: 22,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTextWrap: { alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  statWrap: { paddingHorizontal: 18, paddingVertical: 16 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  statNum: { fontSize: 18, fontWeight: "800", color: "#1f2937", marginLeft: 10 },
  statLabel: { fontSize: 13, color: "#64748b", marginLeft: 8, flex: 1 },

  listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  priorityCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    elevation: 3,
  },

  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },

  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700", color: "#0f172a", flex: 1 },

  urgentPill: { backgroundColor: "#166534", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 10 },
  urgentText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 6, flexWrap: "wrap" },
  badge: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  availability: { fontSize: 11, color: "#64748b", fontWeight: "600" },

  phone: { fontSize: 15, fontWeight: "800", color: "#166534", marginBottom: 2 },
  secondary: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  desc: { fontSize: 13, color: "#475569", lineHeight: 18 },

  callAction: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#ecfdf5",
    justifyContent: "center", alignItems: "center", marginTop: 4,
  },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  loadingText: { marginTop: 12, color: "#64748b" },

  emptyWrap: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#334155", marginTop: 12 },
  emptySub: { fontSize: 14, color: "#64748b", textAlign: "center" },
});
