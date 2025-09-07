import { Platform } from "react-native";

// You can set EXPO_PUBLIC_API_HOST in your app config or .env for a phone on LAN.
// e.g., EXPO_PUBLIC_API_HOST=http://192.168.8.145:5000
const ENV = process.env.EXPO_PUBLIC_API_HOST?.replace(/\/$/, "");

// For web, use the current hostname so localhost works (http://<host>:5000)
const webDefault = (() => {
  if (typeof window === "undefined") return "http://localhost:5000";
  const proto = window.location.protocol;               // http:
  const host  = window.location.hostname;               // localhost or 192.168.x.x
  return `${proto}//${host}:5000`;
})();

let HOST = ENV || webDefault; // default
if (Platform.OS === "android" && !ENV) HOST = "http://10.0.2.2:5000";
if (Platform.OS === "ios" && !ENV && typeof window === "undefined") HOST = "http://localhost:5000";

export const API_HOST = HOST;
export const API_BASE4 = `${HOST}/api4`;
