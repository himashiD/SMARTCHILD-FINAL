import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, RefreshControl, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE4, API_HOST } from "../constants/api4";

const { width } = Dimensions.get('window');

type Guide = {
  guide_id: number;
  category: string;
  type: string;
  title: string;
  summary: string | null;
  image_path: string | null;
  image_url?: string | null;
  external_link: string | null;
  document_path: string | null;
  published_date: string | null;
  status: "Draft" | "Published";
};

const humanDate = (ds: string) => {
  const today = new Date(); const d = new Date(ds);
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t1 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((t1 - t0) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff < 0 && diff >= -6) return `${Math.abs(diff)} day${Math.abs(diff)===1?"":"s"} ago`;
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined
  });
};

const toUrl = (p?: string | null) => !p ? null : (/^https?:\/\//.test(p) ? p : `${API_HOST}/${p.replace(/^\/+/, "")}`);

export default function NutritionGuideList() {
  const [data, setData] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    const res = await fetch(`${API_BASE4}/guides?status=Published&limit=100`);
    const json = await res.json();
    setData(json);
  };

  useEffect(() => { (async () => { await load(); setLoading(false); })(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onBackPress = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/home-dashboard");
  };

  const renderItem = ({ item }: { item: Guide }) => {
    const img = item.image_url || toUrl(item.image_path);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/nutrition/${item.guide_id}`)}
      >
        <View style={styles.row}>
          {img ? (
            <Image
              source={{ uri: img }}
              style={styles.thumb}
              onError={() => console.warn("Image failed:", img)}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbPh]}>
              <Ionicons name="restaurant-outline" size={20} color="#94a3b8" />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
            <View style={styles.meta}>
              <Text style={styles.badge}>{item.category}</Text>
              <Text style={styles.badgeMuted}>{item.type}</Text>
              {item.published_date ? <Text style={styles.date}>{humanDate(item.published_date)}</Text> : null}
            </View>

            {item.summary ? (
              <Text numberOfLines={2} style={styles.summary}>{item.summary}</Text>
            ) : null}
          </View>

          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          {/* round earlier-style back button */}
          <TouchableOpacity onPress={onBackPress} style={styles.roundBack} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
            <View style={styles.backRing} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>🥗 Nutrition Guides</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading nutrition guides...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* round earlier-style back button */}
        <TouchableOpacity onPress={onBackPress} style={styles.roundBack} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
          <View style={styles.backRing} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🥗 Nutrition Guides</Text>
          <Text style={styles.headerSubtitle}>Expert advice for healthy eating</Text>
        </View>
      </View>

      {/* Guide Count */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="library-outline" size={20} color="#4CAF50" />
          <Text style={styles.statNumber}>{data.length}</Text>
          <Text style={styles.statLabel}>Guides Available</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(g) => String(g.guide_id)}
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
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="leaf-outline" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.emptyTitle}>No nutrition guides yet</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for expert nutrition advice and healthy eating guides
            </Text>
          </View>
        }
      />
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

  /* 🔙 earlier-style circular back button */
  roundBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignSelf: "flex-start",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  backRing: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  headerContent: { alignItems: 'center' },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: "#fff",
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: 'center',
  },

  statsContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statNumber: { fontSize: 20, fontWeight: '800', color: "#2c3e50", marginLeft: 12 },
  statLabel: { fontSize: 14, color: "#64748b", marginLeft: 8, flex: 1 },

  listContent: { padding: 16, paddingTop: 0, gap: 12, paddingBottom: 100 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: "#f1f5f9" },
  thumbPh: { justifyContent: "center", alignItems: "center" },

  title: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
  badge: {
    fontSize: 11, fontWeight: "700", color: "#064e3b",
    backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10
  },
  badgeMuted: {
    fontSize: 11, fontWeight: "600", color: "#475569",
    backgroundColor: "#e2e8f0", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10
  },
  date: { fontSize: 11, color: "#64748b" },
  summary: { fontSize: 13, color: "#475569", marginTop: 6 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { fontSize: 16, color: "#64748b", marginTop: 16, textAlign: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyIconContainer: {
    backgroundColor: "#e8f5e9", width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: "#2c3e50", marginBottom: 12, textAlign: 'center' },
  emptySubtitle: { fontSize: 16, color: "#64748b", textAlign: 'center', lineHeight: 24 },
});
