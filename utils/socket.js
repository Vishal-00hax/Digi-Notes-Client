// utils/socket.js
import { io } from "socket.io-client";
import api from "./axios"; // ✅ आपका existing axios instance

let socket = null;
let isRefreshingForSocket = false;

export const connectSocket = () => {
  // MAGIC FIX: सिर्फ यह चेक करें कि socket बन चुका है या नहीं।
  // .connected चेक मत करें, क्योंकि कनेक्ट होने में समय लगता है।
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:7777", {
    withCredentials: true,
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", async (err) => {
    console.error("Socket connection error:", err.message);

    // ✅ सिर्फ auth-related error पर refresh ट्राई करो
    if (err.message === "Invalid or expired token" && !isRefreshingForSocket) {
      isRefreshingForSocket = true;
      try {
        await api.post("/auth/refresh"); // ✅ नया accessToken cookie में आ जाएगा
        socket.connect(); // ✅ नए cookie के साथ दोबारा कनेक्ट ट्राई करो
      } catch (refreshErr) {
        console.error("Refresh failed, redirecting to login");
        window.location.href = "/login";
      } finally {
        isRefreshingForSocket = false;
      }
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // इसे वापस null करें ताकि दोबारा लॉगिन पर नया बन सके
  }
};
