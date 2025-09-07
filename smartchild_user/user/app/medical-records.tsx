// user/app/medical-records.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/constants/api";

type User = {
  first_name?: string;
  last_name?: string;
  child_id?: number;
  dob?: string;
  guardian_name?: string;
};

type MedicalRecord = {
  record_id: number;
  date: string; // YYYY-MM-DD
  doctor: string;
  hospital?: string | null;
  diagnosis: string;
  diagnosis_code?: string | null;
  treatment?: string | null;
  prescription?: string | null;
  notes?: string | null;
  status?: "Open" | "Closed" | "Follow-up" | string;
};

const SAMPLE_RECORDS: MedicalRecord[] = [
  {
    record_id: 2,
    date: "2025-09-05",
    doctor: "K.M. Tissa Hewath",
    hospital: "KCH, Trico Health",
    diagnosis: "Skin Rash (Allergic Reaction)",
    treatment: "Apply prescribed cream and avoid known allergens",
    prescription:
      "Antihistamine syrup 5ml • Calamine lotion • Hydrocortisone cream (apply thin layer)",
    notes: "Recheck after one week or if rash does not improve",
    status: "Open",
  },
  {
    record_id: 1,
    date: "2025-03-09",
    doctor: "Dr. Kumara Senapakse",
    hospital: "DGH",
    diagnosis: "Chickenpox",
    treatment: "Isolate and apply soothing lotion",
    prescription: "Calamine lotion, antihistamine",
    notes: "Avoid contact with other children",
    status: "Closed",
  },
];

function humanDate(ds: string) {
  const today = new Date();
  const d = new Date(ds);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((t0 - t1) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

export default function MedicalRecords() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("sc_user");
        if (raw) setUser(JSON.parse(raw));
      } catch {}
      await load();
      setLoading(false);
    })();
  }, []);

  const setRecordsAndCache = async (list: MedicalRecord[]) => {
    setRecords(list);
    try {
      await AsyncStorage.setItem("__last_records__", JSON.stringify(list));
    } catch {}
  };

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem("sc_user");
      const u = raw ? (JSON.parse(raw) as User) : null;

      if (u?.child_id) {
        try {
          const res = await fetch(`${API_BASE}/medical-records?child_id=${u.child_id}`);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length) {
              const normalized: MedicalRecord[] = json
                .map((r: any, i: number) => ({
                  record_id: r.record_id ?? i + 1,
                  date: r.date ?? r.visit_date ?? r.created_at?.slice(0, 10) ?? "",
                  doctor: r.doctor ?? r.doctor_name ?? "Doctor",
                  hospital: r.hospital ?? null,
                  diagnosis: r.diagnosis ?? "—",
                  diagnosis_code: r.diagnosis_code ?? null,
                  treatment: r.treatment ?? r.plan ?? null,
                  prescription: r.prescription ?? null,
                  notes: r.notes ?? null,
                  status: r.status ?? "Open",
                }))
                .filter((x: MedicalRecord) => !!x.date)
                .sort((a, b) => (a.date < b.date ? 1 : -1));

              await setRecordsAndCache(normalized);
              return;
            }
          }
        } catch {}
      }

      // Fallback to sample
      await setRecordsAndCache(SAMPLE_RECORDS);
    } catch {
      await setRecordsAndCache(SAMPLE_RECORDS);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onBack = () => {
    // Expo Router: just call back(); it safely no-ops if it can't go back.
    router.back();
  };

  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backFab}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Records</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.summaryWrap}>
          {fullName ? (
            <View style={styles.summaryChip}>
              <Ionicons name="person-outline" size={14} color="#fff" />
              <Text style={styles.summaryText}>{fullName}</Text>
            </View>
          ) : null}
          {user?.dob ? (
            <View style={styles.summaryChip}>
              <Ionicons name="calendar-outline" size={14} color="#fff" />
              <Text style={styles.summaryText}>{user.dob}</Text>
            </View>
          ) : null}
          {user?.child_id ? (
            <View style={styles.summaryChip}>
              <Ionicons name="pricetag-outline" size={14} color="#fff" />
              <Text style={styles.summaryText}>ID {user.child_id}</Text>
            </View>
          ) : null}
          {user?.guardian_name ? (
            <View style={styles.summaryChip}>
              <Ionicons name="people-outline" size={14} color="#fff" />
              <Text style={styles.summaryText}>{user.guardian_name}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
        }
      >
        <View style={styles.listHeader}>
          <Text style={[styles.hcell, { flex: 1.2 }]}>Date</Text>
          <Text style={[styles.hcell, { flex: 1.8 }]}>Doctor</Text>
          <Text style={[styles.hcell, { flex: 2 }]}>Diagnosis</Text>
          <Text style={[styles.hcell, { width: 70, textAlign: "right" }]}>Action</Text>
        </View>

        {records.map((r, idx) => (
          <View key={r.record_id} style={[styles.row, idx === 0 && styles.rowFirst]}>
            <View style={{ flex: 1.2 }}>
              <Text style={styles.dateTop}>{humanDate(r.date)}</Text>
              <Text style={styles.dateSub}>{r.date}</Text>
            </View>

            <View style={{ flex: 1.8 }}>
              <Text style={styles.doctor}>{r.doctor}</Text>
              {!!r.hospital && <Text style={styles.hospital}>{r.hospital}</Text>}
            </View>

            <View style={{ flex: 2 }}>
              <View style={styles.diagBadge}>
                <Ionicons name="medkit-outline" size={12} color="#166534" />
                <Text numberOfLines={2} style={styles.diagText}>
                  {r.diagnosis}
                </Text>
              </View>
              {!!r.status && (
                <Text
                  style={[
                    styles.status,
                    r.status === "Open" ? styles.statusOpen : styles.statusClosed,
                  ]}
                >
                  {r.status}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => router.push(`/medical-record/${r.record_id}`)}
            >
              <Text style={styles.viewBtnTxt}>View</Text>
              <Ionicons name="arrow-forward" size={14} color="#166534" />
            </TouchableOpacity>
          </View>
        ))}

        {(!records || records.length === 0) && !loading ? (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={38} color="#94a3b8" />
            <Text style={styles.emptyT}>No medical records yet</Text>
            <Text style={styles.emptyS}>New records will appear here</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backFab: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },

  summaryWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  summaryText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  listHeader: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
    marginBottom: 8,
  },
  hcell: { fontSize: 12, color: "#166534", fontWeight: "800" },

  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  rowFirst: { elevation: 3 },

  dateTop: { color: "#0f172a", fontWeight: "800", fontSize: 13 },
  dateSub: { color: "#64748b", fontSize: 12, marginTop: 2 },

  doctor: { color: "#0f172a", fontWeight: "700" },
  hospital: { color: "#64748b", fontSize: 12 },

  diagBadge: {
    backgroundColor: "#e8f5e9",
    borderColor: "#c8e6c9",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  diagText: { color: "#166534", fontWeight: "700", fontSize: 12 },

  status: { marginTop: 6, fontSize: 12, fontWeight: "800" },
  statusOpen: { color: "#16a34a" },
  statusClosed: { color: "#64748b" },

  viewBtn: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderColor: "#c8e6c9",
    borderWidth: 1,
    backgroundColor: "#f0fdf4",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewBtnTxt: { color: "#166534", fontWeight: "800", fontSize: 12 },

  empty: { alignItems: "center", marginTop: 24, gap: 6 },
  emptyT: { fontWeight: "800", color: "#0f172a" },
  emptyS: { color: "#64748b" },
});
