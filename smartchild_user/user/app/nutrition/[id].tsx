// user/app/nutrition/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Share,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE4, API_HOST } from "../../constants/api4";

type Guide = {
  guide_id: number;
  category: string;
  type: string;
  title: string;
  summary: string | null;
  content: string | null;
  image_path: string | null;
  image_url?: string | null;
  external_link: string | null;
  document_path: string | null;
  document_url?: string | null;
  published_date: string | null;
  status: "Draft" | "Published";
};

const humanDate = (ds: string) => {
  const now = new Date();
  const d = new Date(ds);
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((t1 - t0) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0 && diff >= -6) return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? "" : "s"} ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const toUrl = (p?: string | null) =>
  !p ? null : /^https?:\/\//.test(p) ? p : `${API_HOST}/${p.replace(/^\/+/, "")}`;

export default function NutritionGuideDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [g, setG] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [hideHero, setHideHero] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE4}/guides/${id}`);
        if (res.ok) {
          const json = await res.json();
          setG(json);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onBackPress = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/nutrition-guide");
  };

  const openExternal = async () => {
    if (g?.external_link) await WebBrowser.openBrowserAsync(g.external_link);
  };

  const openDoc = async () => {
    const url = g?.document_url || toUrl(g?.document_path);
    if (!url) return;
    if (Platform.OS === "web") window.open(url, "_blank");
    else await WebBrowser.openBrowserAsync(url);
  };

  const shareIt = async () => {
    if (!g) return;
    await Share.share({
      title: g.title,
      message: `🍎 ${g.title}\n\n${g.summary ?? ""}\n\n${g.external_link ?? ""}`,
    });
  };

  const img = g?.image_url || toUrl(g?.image_path);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />
      {/* Polished header with earlier-style circular back button */}
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backFab}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text numberOfLines={1} style={styles.headerTitle}>
            Nutrition Guide
          </Text>

          {/* spacer to balance flex */}
          <View style={{ width: 38 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading guide…</Text>
        </View>
      ) : !g ? (
        <View style={styles.loading}>
          <Ionicons name="alert-circle-outline" size={28} color="#94a3b8" />
          <Text style={styles.loadingText}>Guide not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
          {/* Hero card */}
          {img && !hideHero ? (
            <View style={styles.heroCard}>
              <Image
                source={{ uri: img }}
                style={styles.hero}
                resizeMode="cover"
                onError={() => setHideHero(true)}
              />
            </View>
          ) : null}

          {/* Title & meta chips */}
          <Text style={styles.title}>{g.title}</Text>
          <View style={styles.chips}>
            <Text style={styles.badge}>{g.category}</Text>
            <Text style={styles.badgeMuted}>{g.type}</Text>
            {g.published_date ? <Text style={styles.dateChip}>{humanDate(g.published_date)}</Text> : null}
          </View>

          {/* Summary & content */}
          {g.summary ? <Text style={styles.summary}>{g.summary}</Text> : null}
          {g.content ? <Text style={styles.content}>{g.content}</Text> : null}

          {/* Actions */}
          <View style={styles.actionsRow}>
            {g.external_link ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={openExternal} activeOpacity={0.9}>
                <Ionicons name="link-outline" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Open Link</Text>
              </TouchableOpacity>
            ) : null}

            {g.document_url || g.document_path ? (
              <TouchableOpacity style={styles.ghostBtn} onPress={openDoc} activeOpacity={0.9}>
                <Ionicons name="document-attach-outline" size={16} color="#16a34a" />
                <Text style={styles.ghostBtnText}>Open Document</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={styles.shareBtn} onPress={shareIt} activeOpacity={0.9}>
              <Ionicons name="share-social-outline" size={16} color="#0ea5e9" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Header */
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
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  /* Loading / empty */
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: { color: "#64748b", marginTop: 10, fontSize: 14, fontWeight: "600" },

  /* Content */
  contentWrap: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },

  heroCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eef2f7",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
  },
  hero: { width: "100%", height: 210 },

  title: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginTop: 2 },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: "#065f46",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeMuted: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dateChip: { fontSize: 12, color: "#64748b", fontWeight: "600" },

  summary: { fontSize: 14, color: "#334155", marginTop: 6, lineHeight: 20 },
  content: { fontSize: 15, color: "#1f2937", lineHeight: 22 },

  /* Buttons */
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 1,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ghostBtnText: { color: "#166534", fontWeight: "800", fontSize: 13 },

  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  shareBtnText: { color: "#0ea5e9", fontWeight: "800", fontSize: 13 },
});
