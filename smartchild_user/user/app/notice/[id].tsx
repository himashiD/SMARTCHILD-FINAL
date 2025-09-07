import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE2 } from "../../constants/api2";

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

export default function NoticeDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch(`${API_BASE2}/notices/${id}`);
        if (res.ok) {
          const noticeData = await res.json();
          setNotice(noticeData);
        }
      } catch (error) {
        console.error("Failed to load notice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const options = {
      weekday: "long" as const,
      year: "numeric" as const,
      month: "long" as const,
      day: "numeric" as const
    };
    
    const formattedDate = date.toLocaleDateString("en-US", options);

    if (diffDays === 1) return { main: "Today", sub: formattedDate, urgent: true };
    if (diffDays === 2) return { main: "Tomorrow", sub: formattedDate, urgent: true };
    if (diffDays <= 7) return { main: `In ${diffDays - 1} days`, sub: formattedDate, urgent: false };
    
    return { main: formattedDate, sub: null, urgent: false };
  };

  const formatTime = (startTime: string | null, endTime: string | null) => {
    if (!startTime && !endTime) return "Time not specified";
    if (startTime && endTime) {
      return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
    }
    return startTime ? startTime.slice(0, 5) : "Time not specified";
  };

  const handleShare = async () => {
    if (!notice) return;
    
    try {
      await Share.share({
        message: `📢 ${notice.notice_title}\n\n${notice.notice_description || "Check out this important notice"}\n\n📅 Date: ${notice.notice_date}\n📍 Venue: ${notice.notice_venue || "TBA"}\n\nShared via Notice App`,
        title: notice.notice_title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <LinearGradient 
          colors={["#4CAF50", "#388E3C", "#2E7D32"]} 
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Loading Notice</Text>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading notice details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!notice) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
        <LinearGradient 
          colors={["#4CAF50", "#388E3C", "#2E7D32"]} 
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notice Not Found</Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>

        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Ionicons name="document-outline" size={64} color="#FF5722" />
            <Text style={styles.errorTitle}>Notice Not Found</Text>
            <Text style={styles.errorMessage}>
              The notice you're looking for might have been removed or doesn't exist.
            </Text>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const dateInfo = formatDate(notice.notice_date);
  const timeInfo = formatTime(notice.notice_start_time, notice.notice_end_time);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Perfect Header */}
      <LinearGradient 
        colors={["#4CAF50", "#388E3C", "#2E7D32"]} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notice Details</Text>
          <Text style={styles.headerSubtitle}>Complete Information</Text>
        </View>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
        >
          <Ionicons name="share-social" size={22} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Image Section */}
        {notice.notice_image && !imageError ? (
          <View style={styles.imageSection}>
            <Image 
              source={{ uri: notice.notice_image }} 
              style={styles.heroImage}
              onError={() => setImageError(true)}
            />
            <LinearGradient 
              colors={["transparent", "rgba(0,0,0,0.6)"]} 
              style={styles.imageOverlay}
            />
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <LinearGradient 
              colors={["#E8F5E8", "#F1F8F1"]} 
              style={styles.imagePlaceholder}
            >
              <Ionicons name="document-text-outline" size={48} color="#4CAF50" />
              <Text style={styles.placeholderText}>No Image Available</Text>
            </LinearGradient>
          </View>
        )}

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Priority Badge & Title */}
          <View style={styles.titleSection}>
            <View style={[
              styles.priorityBadge, 
              { backgroundColor: dateInfo.urgent ? "#FFE5E5" : "#E8F5E8" }
            ]}>
              <Ionicons 
                name={dateInfo.urgent ? "alert-circle" : "checkmark-circle"} 
                size={14} 
                color={dateInfo.urgent ? "#FF5722" : "#4CAF50"} 
              />
              <Text style={[
                styles.priorityText,
                { color: dateInfo.urgent ? "#FF5722" : "#4CAF50" }
              ]}>
                {dateInfo.urgent ? "Urgent" : "Important"}
              </Text>
            </View>
            <Text style={styles.noticeTitle}>{notice.notice_title}</Text>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoSection}>
            <View style={styles.quickInfoRow}>
              {/* Date Card */}
              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoIcon}>
                  <LinearGradient colors={["#3B82F6", "#1D4ED8"]} style={styles.iconGradient}>
                    <Ionicons name="calendar" size={20} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>Date</Text>
                  <Text style={styles.quickInfoValue}>{dateInfo.main}</Text>
                  {dateInfo.sub && (
                    <Text style={styles.quickInfoSub}>{dateInfo.sub}</Text>
                  )}
                </View>
              </View>

              {/* Time Card */}
              <View style={styles.quickInfoCard}>
                <View style={styles.quickInfoIcon}>
                  <LinearGradient colors={["#10B981", "#047857"]} style={styles.iconGradient}>
                    <Ionicons name="time" size={20} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.quickInfoContent}>
                  <Text style={styles.quickInfoLabel}>Time</Text>
                  <Text style={styles.quickInfoValue}>{timeInfo}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Detailed Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Event Information</Text>
            
            {/* Venue Card */}
            {notice.notice_venue && (
              <View style={styles.detailCard}>
                <View style={styles.detailIcon}>
                  <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.iconGradient}>
                    <Ionicons name="location" size={18} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Venue</Text>
                  <Text style={styles.detailValue}>{notice.notice_venue}</Text>
                </View>
              </View>
            )}

            {/* Notice ID Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailIcon}>
                <LinearGradient colors={["#8B5CF6", "#7C3AED"]} style={styles.iconGradient}>
                  <Ionicons name="bookmark" size={18} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Notice ID</Text>
                <Text style={styles.detailValue}>#{String(notice.notice_id).padStart(4, '0')}</Text>
              </View>
            </View>

            {/* Full Date Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailIcon}>
                <LinearGradient colors={["#06B6D4", "#0891B2"]} style={styles.iconGradient}>
                  <Ionicons name="calendar-outline" size={18} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Full Date</Text>
                <Text style={styles.detailValue}>{notice.notice_date}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <View style={styles.descriptionHeader}>
              <Ionicons name="document-text" size={22} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                {notice.notice_description || "No additional description available for this notice. Please contact the relevant department for more information about this event or announcement."}
              </Text>
            </View>
          </View>

          {/* Share Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.shareActionButton} 
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <LinearGradient 
                colors={["#4CAF50", "#45A049", "#388E3C"]} 
                style={styles.shareButtonGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
              >
                <Ionicons name="share-social" size={22} color="#fff" />
                <Text style={styles.shareButtonText}>Share Notice</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerSpacer: {
    width: 44,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 16,
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  errorButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Image Section
  imageSection: {
    position: "relative",
    height: 220,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  placeholderSection: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 160,
    borderRadius: 20,
    overflow: "hidden",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 12,
  },

  // Content Card
  contentCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },

  // Title Section
  titleSection: {
    marginBottom: 24,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  noticeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    lineHeight: 34,
  },

  // Quick Info Section
  quickInfoSection: {
    marginBottom: 32,
  },
  quickInfoRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  quickInfoIcon: {
    marginBottom: 12,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  quickInfoSub: {
    fontSize: 11,
    color: "#64748B",
  },

  // Details Section
  detailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFBFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  detailIcon: {
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },

  // Description Section
  descriptionSection: {
    marginBottom: 32,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  descriptionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  descriptionText: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 28,
    fontWeight: "400",
  },

  // Action Section
  actionSection: {
    paddingTop: 8,
  },
  shareActionButton: {
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  shareButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
});