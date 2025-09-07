// app/notice-board.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Dimensions, StatusBar, RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_BASE2 } from "../constants/api2";

const { width } = Dimensions.get("window");

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

export default function NoticeBoard() {
  const [data, setData] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadNotices = async () => {
    try {
      const res = await fetch(`${API_BASE2}/notices`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Failed to load notices", e);
    }
  };

  useEffect(() => {
    (async () => {
      await loadNotices();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (startTime: string | null, endTime: string | null) => {
    if (!startTime && !endTime) return null;
    if (startTime && endTime) return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
    return startTime ? startTime.slice(0, 5) : null;
  };

  const getPriorityColor = (index: number) => {
    const colors = ["#4CAF50"];
    return colors[index % colors.length];
  };

  // Back button with fallback
  const onBackPress = () => {
    if (router.canGoBack?.()) router.back();
    else router.replace("/home-dashboard");
  };

  // ---------- STATS (total & upcoming) ----------
  const totalNotices = data.length;
  const upcomingNotices = data.filter(n => {
    const nd = new Date(n.notice_date);
    const now = new Date();
    nd.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return nd >= now; // today or later
  }).length;
  // ---------------------------------------------

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No Notices Available</Text>
      <Text style={styles.emptySubtitle}>
        Check back later for new announcements and updates
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={16} color="#4CAF50" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }: { item: Notice; index: number }) => {
    const formattedTime = formatTime(item.notice_start_time, item.notice_end_time);
    const priorityColor = getPriorityColor(index);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.noticeCard}
        onPress={() => router.push(`/notice/${item.notice_id}`)}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]}
          style={styles.cardGradient}
        >
          <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.imageContainer}>
                {item.notice_image ? (
                  <Image source={{ uri: item.notice_image }} style={styles.noticeImage} />
                ) : (
                  <View style={[styles.noticeImage, styles.imagePlaceholder]}>
                    <Ionicons name="document-text" size={20} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.titleContainer}>
                <Text numberOfLines={2} style={styles.noticeTitle}>
                  {item.notice_title}
                </Text>
                <View style={styles.metaInfo}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                    <Text style={styles.dateText}>{formatDate(item.notice_date)}</Text>
                  </View>
                  {formattedTime && (
                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={12} color="#6B7280" />
                      <Text style={styles.timeText}>{formattedTime}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.venueContainer}>
                {item.notice_venue && (
                  <>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text numberOfLines={1} style={styles.venueText}>
                      {item.notice_venue}
                    </Text>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={[styles.readMoreButton, { borderColor: priorityColor }]}
                onPress={() => router.push(`/notice/${item.notice_id}`)}
              >
                <Text style={[styles.readMoreText, { color: priorityColor }]}>Read More</Text>
                <Ionicons name="arrow-forward" size={12} color={priorityColor} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.headerGradient}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

        {/* circular back button */}
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backFab}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.9}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="notifications" size={28} color="#fff" />
            <Text style={styles.headerTitle}>Notice Board</Text>
          </View>
          <Text style={styles.headerSubtitle}>Stay updated with latest announcements</Text>
        </View>

        {/* BIGGER STAT CARDS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="albums-outline" size={18} color="#ffffff" />
              <Text style={styles.statLabel}>Total Notices</Text>
            </View>
            <Text style={styles.statNumber}>{totalNotices}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="calendar-outline" size={18} color="#ffffff" />
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <Text style={styles.statNumber}>{upcomingNotices}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.loadingHeader}>
          <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        </LinearGradient>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading notices...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.notice_id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, backgroundColor: "#f8fafc" },
  loadingHeader: { height: 120 },
  loadingContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#6B7280", fontWeight: "500" },

  headerSection: { marginBottom: 20 },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },

  backFab: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center", alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 14,
    shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6,
  },

  headerContent: { marginBottom: 20 },
  headerTitleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginLeft: 12, textAlign: "center" },
  headerSubtitle: { fontSize: 14, color: "rgba(255, 255, 255, 0.9)", marginLeft: 40 },

  // BIGGER stat cards
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
  },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 32,
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  noticeCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  cardGradient: { borderRadius: 16, overflow: "hidden" },
  priorityBar: { height: 4, width: "100%" },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: "row", marginBottom: 12 },
  imageContainer: { marginRight: 12 },
  noticeImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: "#f3f4f6" },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  titleContainer: { flex: 1, justifyContent: "space-between" },
  noticeTitle: { fontSize: 16, fontWeight: "600", color: "#111827", lineHeight: 22, marginBottom: 8 },
  metaInfo: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  timeContainer: { flexDirection: "row", alignItems: "center" },
  dateText: { fontSize: 12, color: "#6B7280", marginLeft: 4, fontWeight: "500" },
  timeText: { fontSize: 12, color: "#6B7280", marginLeft: 4, fontWeight: "500" },
  noticeDescription: { fontSize: 14, color: "#374151", lineHeight: 20, marginBottom: 16 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  venueContainer: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  venueText: { fontSize: 13, color: "#6B7280", marginLeft: 4, fontWeight: "500" },
  readMoreButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  readMoreText: { fontSize: 12, fontWeight: "600", marginRight: 4 },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyIconContainer: {
    backgroundColor: "#f3f4f6", width: 120, height: 120, borderRadius: 60,
    justifyContent: "center", alignItems: "center", marginBottom: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#374151", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  refreshButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: "#4CAF50",
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  refreshButtonText: { fontSize: 14, fontWeight: "600", color: "#4CAF50", marginLeft: 6 },
});
