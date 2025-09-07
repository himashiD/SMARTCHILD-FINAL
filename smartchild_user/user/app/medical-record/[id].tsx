// user/app/medical-record/[id].tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/constants/api";

type MedicalRecord = {
  record_id: number;
  date: string;
  doctor: string;
  hospital?: string | null;
  diagnosis: string;
  diagnosis_code?: string | null;
  treatment?: string | null;
  prescription?: string | null;
  notes?: string | null;
  status?: "Open" | "Closed" | "Follow-up";
};

export default function MedicalRecordDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Try to fetch the single record
        const res = await fetch(`${API_BASE}/medical-records/${id}`);
        if (res.ok) {
          const r = await res.json();
          setRecord({
            record_id: r.record_id ?? Number(id),
            date: r.date ?? r.visit_date ?? new Date().toISOString().slice(0, 10),
            doctor: r.doctor ?? r.doctor_name ?? "Doctor",
            hospital: r.hospital ?? null,
            diagnosis: r.diagnosis ?? "—",
            diagnosis_code: r.diagnosis_code ?? null,
            treatment: r.treatment ?? r.plan ?? null,
            prescription: r.prescription ?? null,
            notes: r.notes ?? null,
            status: r.status ?? "Open",
          });
          return;
        }
      } catch {}
      // Fallback: read list (if saved by list screen in memory) or minimal stub
      const fallback = await AsyncStorage.getItem("__last_records__");
      if (fallback) {
        try {
          const arr = JSON.parse(fallback) as MedicalRecord[];
          const found = arr.find((x) => String(x.record_id) === String(id));
          if (found) setRecord(found);
        } catch {}
      }
      if (!record)
        setRecord({
          record_id: Number(id),
          date: new Date().toISOString().slice(0, 10),
          doctor: "Doctor",
          diagnosis: "—",
          status: "Open",
        });
    })();
  }, [id]);

  const onBack = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/medical-records");
  };

  const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );

  if (!record) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backFab}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record #{record.record_id}</Text>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.metaText}>{record.date}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="person-outline" size={14} color="#fff" />
            <Text style={styles.metaText}>{record.doctor}</Text>
          </View>
          {!!record.status && (
            <View style={styles.metaChip}>
              <Ionicons name="pulse-outline" size={14} color="#fff" />
              <Text style={styles.metaText}>{record.status}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Section title="Diagnosis">
          <Text style={styles.valueText}>{record.diagnosis}</Text>
          {!!record.diagnosis_code && (
            <Text style={[styles.valueText, { color: "#64748b", marginTop: 4 }]}>
              Code: {record.diagnosis_code}
            </Text>
          )}
          {!!record.hospital && (
            <Text style={[styles.valueText, { color: "#64748b", marginTop: 4 }]}>
              Facility: {record.hospital}
            </Text>
          )}
        </Section>

        {!!record.treatment && (
          <Section title="Treatment">
            <Text style={styles.valueText}>{record.treatment}</Text>
          </Section>
        )}

        {!!record.prescription && (
          <Section title="Prescription">
            <Text style={styles.valueText}>{record.prescription}</Text>
          </Section>
        )}

        {!!record.notes && (
          <Section title="Notes">
            <Text style={styles.valueText}>{record.notes}</Text>
          </Section>
        )}
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

  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  metaChip: {
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
  metaText: { color: "#fff", fontWeight: "700", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#2c3e50", marginBottom: 8 },
  valueText: { color: "#0f172a", fontSize: 14, lineHeight: 20 },
});
