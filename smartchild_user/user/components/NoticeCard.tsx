// smartchild-user/components/NoticeCard.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type NoticeCardProps = {
  title: string;
  date: string;
  extraInfo?: string;
  onPress?: () => void;
};

export default function NoticeCard({ title, date, extraInfo, onPress }: NoticeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      {extraInfo && <Text style={styles.extra}>{extraInfo}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 14, color: "#888" },
  extra: { fontSize: 13, color: "#555", marginTop: 4 },
});
