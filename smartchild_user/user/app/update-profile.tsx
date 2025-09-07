// user/app/update-profile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Form = {
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

  blood_group?: string;
  birth_weight?: string | number;
  guardian_name?: string;
  guardian_nic?: string;

  created_at?: string;
  updated_at?: string;
};

const sriLankaDefaults: Form = {
  // From your sample row
  first_name: "Kavindu",
  last_name: "Perera",
  username: "kavindu2020",
  dob: "2020-05-12",
  gender: "Male",
  birth_weight: "3.2",
  blood_group: "A+",
  guardian_name: "Nimal Perera",
  guardian_nic: "991234567V",
  phone: "0771234567",
  email: "nimal@example.com",
  address: "Colombo, Sri Lanka",
};

export default function UpdateProfile() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(sriLankaDefaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("sc_user");
        if (raw) {
          const current = JSON.parse(raw) || {};
          // Merge: existing user fields override defaults, keep defaults where missing
          setForm({
            ...sriLankaDefaults,
            ...current,
          });
        }
      } catch {
        // ignore; keep defaults
      }
    })();
  }, []);

  const setField = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const onBack = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/profile");
  };

  const validate = () => {
    if (!form.first_name?.trim() || !form.last_name?.trim()) {
      Alert.alert("Missing name", "Please enter first and last name.");
      return false;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return false;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      // Simple check for 10 digits (e.g., 077xxxxxxx in Sri Lanka)
      Alert.alert("Invalid phone", "Enter a 10-digit phone number (e.g., 0771234567).");
      return false;
    }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const nowIso = new Date().toISOString();
      const existingRaw = await AsyncStorage.getItem("sc_user");
      const existing = existingRaw ? JSON.parse(existingRaw) : {};

      const payload: Form = {
        ...existing,
        ...form,
        created_at: existing?.created_at ?? nowIso,
        updated_at: nowIso,
      };

      await AsyncStorage.setItem("sc_user", JSON.stringify(payload));
      Alert.alert("Saved", "Your profile has been updated.", [
        { text: "OK", onPress: () => router.replace("/profile") },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onChangePhoto = () => {
    Alert.alert(
      "Change photo",
      "Photo picking is optional. To enable gallery/camera, install expo-image-picker:\n\nnpx expo install expo-image-picker\n\nThen wire it up here."
    );
  };

  const GenderPill = ({ g }: { g: "Male" | "Female" | "Other" }) => {
    const active = form.gender === g;
    return (
      <TouchableOpacity
        onPress={() => setField("gender", g)}
        style={[
          styles.pill,
          active && { backgroundColor: "#e8f5e9", borderColor: "#4CAF50" },
        ]}
      >
        <Text style={[styles.pillText, active && { color: "#166534", fontWeight: "800" }]}>
          {g}
        </Text>
      </TouchableOpacity>
    );
  };

  const BloodPill = ({ b }: { b: string }) => {
    const active = form.blood_group === b;
    return (
      <TouchableOpacity
        onPress={() => setField("blood_group", b)}
        style={[
          styles.pill,
          active && { backgroundColor: "#e8f5e9", borderColor: "#4CAF50" },
        ]}
      >
        <Text style={[styles.pillText, active && { color: "#166534", fontWeight: "800" }]}>
          {b}
        </Text>
      </TouchableOpacity>
    );
  };

  const Input = ({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType,
  }: {
    label: string;
    icon: any;
    value?: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: "default" | "email-address" | "numeric";
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color="#64748b" />
        <TextInput
          value={value ?? ""}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          style={styles.input}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );

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
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={onSave} style={styles.saveChip} disabled={saving}>
            <Ionicons name="save-outline" size={16} color="#166534" />
            <Text style={styles.saveChipText}>{saving ? "Saving…" : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo + action */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Photo</Text>
            <View style={styles.photoRow}>
              <View style={styles.photoCircle}>
                <Ionicons name="person" size={36} color="#94a3b8" />
              </View>
              <TouchableOpacity style={styles.photoBtn} onPress={onChangePhoto}>
                <Ionicons name="camera-outline" size={16} color="#166534" />
                <Text style={styles.photoBtnText}>Change photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Info</Text>
            <View style={styles.row2}>
              <Input
                label="First name"
                icon="person-outline"
                value={form.first_name}
                onChangeText={(t) => setField("first_name", t)}
                placeholder="First name"
              />
              <Input
                label="Last name"
                icon="person-outline"
                value={form.last_name}
                onChangeText={(t) => setField("last_name", t)}
                placeholder="Last name"
              />
            </View>
            <Input
              label="Username"
              icon="at-outline"
              value={form.username}
              onChangeText={(t) => setField("username", t)}
              placeholder="kavindu2020"
            />
            <Input
              label="Date of Birth (YYYY-MM-DD)"
              icon="calendar-outline"
              value={form.dob}
              onChangeText={(t) => setField("dob", t)}
              placeholder="2020-05-12"
            />
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.pillRow}>
              <GenderPill g="Male" />
              <GenderPill g="Female" />
              <GenderPill g="Other" />
            </View>
          </View>

          {/* Contact */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>
            <Input
              label="Email"
              icon="mail-outline"
              value={form.email}
              onChangeText={(t) => setField("email", t)}
              placeholder="name@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Phone"
              icon="call-outline"
              value={form.phone}
              onChangeText={(t) => setField("phone", t)}
              placeholder="0771234567"
              keyboardType="numeric"
            />
            <Input
              label="Address"
              icon="location-outline"
              value={form.address}
              onChangeText={(t) => setField("address", t)}
              placeholder="Colombo, Sri Lanka"
            />
          </View>

          {/* Medical */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Medical</Text>
            <Text style={styles.inputLabel}>Blood Group</Text>
            <View style={styles.pillWrap}>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <BloodPill key={b} b={b} />
              ))}
            </View>
            <Input
              label="Birth weight (kg)"
              icon="scale-outline"
              value={String(form.birth_weight ?? "")}
              onChangeText={(t) => setField("birth_weight", t)}
              placeholder="3.2"
              keyboardType="numeric"
            />
          </View>

          {/* Guardian */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guardian</Text>
            <Input
              label="Guardian name"
              icon="people-outline"
              value={form.guardian_name}
              onChangeText={(t) => setField("guardian_name", t)}
              placeholder="Nimal Perera"
            />
            <Input
              label="Guardian NIC"
              icon="finger-print-outline"
              value={form.guardian_nic}
              onChangeText={(t) => setField("guardian_nic", t)}
              placeholder="991234567V"
            />
          </View>

          {/* Save big button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={onSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Changes"}</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveChip: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#c8e6c9",
  },
  saveChipText: { color: "#166534", fontWeight: "800", fontSize: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#2c3e50", marginBottom: 10 },

  photoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  photoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBtn: {
    backgroundColor: "#e8f5e9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#c8e6c9",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  photoBtnText: { color: "#166534", fontWeight: "800" },

  inputGroup: { marginBottom: 12, flex: 1 },
  inputLabel: { fontSize: 12, fontWeight: "800", color: "#166534", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  input: { flex: 1, fontSize: 14, color: "#0f172a" },

  row2: { flexDirection: "row", gap: 10 },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  pillWrap: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pillText: { color: "#475569", fontWeight: "700", fontSize: 12 },

  saveBtn: {
    backgroundColor: "#4CAF50",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginTop: 6,
  },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
