// user/app/growth-history.tsx
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, FlatList } from "react-native";
import axios from "axios";

const GrowthHistory = ({ childId }: { childId: number }) => {
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await axios.get(`http://your-backend-url/api/growth/${childId}`);
        setGrowthData(response.data);
      } catch (error) {
        console.error("Error fetching growth data", error);
      }
    };

    fetchGrowthData();
  }, [childId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Growth History</Text>
      <FlatList
        data={growthData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.text}>Height: {item.height} cm</Text>
            <Text style={styles.text}>Weight: {item.weight} kg</Text>
            <Text style={styles.text}>BMI: {item.bmi}</Text>
            <Text style={styles.text}>Date: {item.insert_date}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  item: { padding: 10, marginVertical: 5, backgroundColor: "#f0f0f0", borderRadius: 5 },
  text: { fontSize: 16 },
});

export default GrowthHistory;
