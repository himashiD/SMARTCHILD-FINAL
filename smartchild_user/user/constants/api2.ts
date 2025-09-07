


import { Platform } from "react-native";

// Set up API base URL based on platform
const HOST = Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
export const API_BASE2 = `${HOST}/api2`;
