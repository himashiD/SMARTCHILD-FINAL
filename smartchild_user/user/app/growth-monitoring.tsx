// user/app/growth-monitoring.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE3 } from "@/constants/api3";

const { width } = Dimensions.get("window");

type GrowthRow = {
  id: number | string;
  child_id: number | string;
  username: string;
  height: number | string;
  weight: number | string;
  bmi: number | string;
  insert_date: string;
};

export default function GrowthMonitoring() {
  const router = useRouter();

  const [childId, setChildId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [rows, setRows] = useState<GrowthRow[]>([]);

  // Load logged-in user
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("sc_user");
        if (raw) {
          const u = JSON.parse(raw);
          const cid = Number(u?.child_id ?? u?.childId ?? 0);
          const uname: string =
            ((u?.username as string) ??
              `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim()) || "Smart Kid";

          if (cid > 0) setChildId(cid);
          setUsername(uname);
        }
      } catch (e) {
        console.warn("Failed reading sc_user", e);
      }
    })();
  }, []);

  // Fetch history
  const loadRows = async (cid: number) => {
    try {
      const res = await fetch(`${API_BASE3}/growth/${cid}`);
      const data = await res.json();
      if (Array.isArray(data)) setRows(data);
      else setRows([]);
    } catch (e) {
      console.warn("fetch growth history error", e);
    }
  };

  useEffect(() => {
    if (childId) loadRows(childId);
  }, [childId]);

  // Live BMI calculation
  const bmi = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return "";
    const m = h / 100;
    const value = w / (m * m);
    if (!isFinite(value)) return "";
    return value.toFixed(1);
  }, [height, weight]);

  // BMI category and color
  const getBMIStatus = (bmiValue: string) => {
    const bmiNum = Number(bmiValue);
    if (!bmiNum) return { status: "", color: "#4CAF50" };

    if (bmiNum < 18.5) return { status: "Underweight", color: "#2196F3" };
    if (bmiNum < 25) return { status: "Healthy", color: "#4CAF50" };
    if (bmiNum < 30) return { status: "Overweight", color: "#FF9800" };
    return { status: "Obese", color: "#f44336" };
  };

  const onSave = async () => {
    if (!childId) return Alert.alert("Missing child", "No child_id found.");
    const h = Number(height);
    const w = Number(weight);

    if (!h || !w) return Alert.alert("📊 Enter values", "Height & Weight are required.");
    if (h < 20 || h > 220) return Alert.alert("📏 Height check", "Use centimeters (e.g., 98).");
    if (w < 1 || w > 200) return Alert.alert("⚖️ Weight check", "Use kilograms (e.g., 12.5).");

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE3}/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: childId,
          username,
          height: h,
          weight: w,
          bmi: Number(bmi || 0),
        }),
      });

      const json: any = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        const msg = json?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setHeight("");
      setWeight("");
      await loadRows(childId);
      Alert.alert("🎉 Success!", "Growth data saved successfully!");
    } catch (e: any) {
      Alert.alert("❌ Error", e?.message || "Network/Server error");
    } finally {
      setSaving(false);
    }
  };

  // Back button with fallback
  const onBackPress = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/home-dashboard");
  };

  const Row = ({ item }: { item: GrowthRow }) => {
    const h = Number(item.height);
    const w = Number(item.weight);
    const b = Number(item.bmi);
    const when = new Date(item.insert_date);
    const whenStr = isNaN(when.getTime()) ? String(item.insert_date) : when.toLocaleDateString();
    const bmiStatus = getBMIStatus(String(b));

    return (
      <View style={styles.row}>
        <Text style={[styles.col, styles.dateCol]}>{whenStr}</Text>
        <Text style={styles.col}>{isFinite(h) ? `${h.toFixed(1)} cm` : String(item.height)}</Text>
        <Text style={styles.col}>{isFinite(w) ? `${w.toFixed(1)} kg` : String(item.weight)}</Text>
        <View style={[styles.col, styles.bmiCol]}>
          <Text style={[styles.bmiValue, { color: bmiStatus.color }]}>
            {isFinite(b) ? b.toFixed(1) : String(item.bmi)}
          </Text>
          {bmiStatus.status && (
            <Text style={[styles.bmiStatusSmall, { color: bmiStatus.color }]}>{bmiStatus.status}</Text>
          )}
        </View>
      </View>
    );
  };

  const bmiStatus = getBMIStatus(bmi);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backFab}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.9}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📊 Growth Monitoring</Text>
          <Text style={styles.headerSubtitle}>Track {username}'s healthy development</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 New Measurements</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="120"
                  placeholderTextColor="#c8e6c9"
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                />
                <Text style={styles.inputIcon}>📏</Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="25.5"
                  placeholderTextColor="#c8e6c9"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
                <Text style={styles.inputIcon}>⚖️</Text>
              </View>
            </View>
          </View>

          {/* BMI Display */}
          {!!bmi && (
            <View style={[styles.bmiDisplay, { borderColor: bmiStatus.color }]}>
              <View style={styles.bmiHeader}>
                <Text style={styles.bmiTitle}>🧮 Calculated BMI</Text>
                <Text style={[styles.bmiValueLarge, { color: bmiStatus.color }]}>{bmi}</Text>
              </View>
              {bmiStatus.status && (
                <View style={[styles.bmiStatusBadge, { backgroundColor: bmiStatus.color + "20" }]}>
                  <Text style={[styles.bmiStatusText, { color: bmiStatus.color }]}>{bmiStatus.status}</Text>
                </View>
              )}
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            onPress={onSave}
            disabled={saving || !height || !weight}
            style={[styles.saveButton, (!height || !weight) && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "💾 Saving..." : "✨ Save Growth Data"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* History Card */}
        <View style={styles.historyCard}>
          <View className="sectionHeader">
            <Text style={styles.sectionTitle}>📈 Growth History</Text>
          </View>

          {rows.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyTitle}>No growth data yet</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking {username}'s growth by adding measurements above!
              </Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              {/* Header Row */}
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.col, styles.headerText, styles.dateCol]}>Date</Text>
                <Text style={[styles.col, styles.headerText]}>Height</Text>
                <Text style={[styles.col, styles.headerText]}>Weight</Text>
                <Text style={[styles.col, styles.headerText]}>BMI</Text>
              </View>

              {/* Data Rows */}
              <FlatList
                data={rows}
                keyExtractor={(x) => String(x.id)}
                renderItem={({ item }) => <Row item={item} />}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    backgroundColor: "#4CAF50",
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

  // circular back button like the screenshot
  backFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 14,
    // subtle glow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  headerContent: { alignItems: "center" },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: 16, color: "rgba(255, 255, 255, 0.9)", textAlign: "center" },

  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    margin: 20,
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderTopWidth: 4,
    borderTopColor: "#4CAF50",
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    margin: 20,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderTopWidth: 4,
    borderTopColor: "#4CAF50",
  },

  sectionHeader: { marginBottom: 18 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#2c3e50" },

  inputRow: { flexDirection: "row", gap: 15, marginBottom: 20 },
  inputContainer: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#388e3c", marginBottom: 8 },
  inputWrapper: { position: "relative" },
  input: {
    backgroundColor: "#f1f8e9",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 45,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  inputIcon: { position: "absolute", right: 15, top: 12, fontSize: 16 },

  bmiDisplay: {
    backgroundColor: "#e8f5e9",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bmiHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  bmiTitle: { fontSize: 16, fontWeight: "600", color: "#388e3c" },
  bmiValueLarge: { fontSize: 24, fontWeight: "800" },
  bmiStatusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  bmiStatusText: { fontSize: 12, fontWeight: "600" },

  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  saveButtonDisabled: { backgroundColor: "#bdbdbd", opacity: 0.6 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  tableContainer: { marginTop: 10 },
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
  headerText: { fontWeight: "bold", color: "#388e3c", fontSize: 15 },
  col: { flex: 1, color: "#333", fontSize: 14, textAlign: "center" },
  dateCol: { flex: 1.2, textAlign: "left", paddingLeft: 8 },
  bmiCol: { alignItems: "center" },
  bmiValue: { fontWeight: "700", fontSize: 14 },
  bmiStatusSmall: { fontSize: 10, fontWeight: "500", marginTop: 2 },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#2c3e50", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#777", textAlign: "center", lineHeight: 20 },
});
