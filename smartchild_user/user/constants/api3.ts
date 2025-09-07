import { Platform } from "react-native";

// Change LAN_IP to your computer's local IP (e.g., 192.168.1.23)
const LAN_IP = "http://192.168.1.23:5000";

const HOST =
  Platform.OS === "android" ? "http://10.0.2.2:5000" :    // Android emulator
  Platform.OS === "ios" ? LAN_IP :                         // iOS device / Safari (your screenshot)
  "http://localhost:5000";                                 // web on same machine

export const API_BASE3 = `${HOST}/api3`;
