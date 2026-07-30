// utils/socket.js
import { io } from "socket.io-client";
import api from "./axios"; // ✅ aapka existing axios instance (jisme refresh interceptor hai)

let socket = null;
let isRefreshingForSocket = false;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("connect_error", async (err) => {
    console.error("Socket connection error:", err.message);

    // ✅ Sirf auth-related error par refresh try karo, aur ek time par ek hi refresh chale
    if (err.message === "Invalid or expired token" && !isRefreshingForSocket) {
      isRefreshingForSocket = true;
      try {
        await api.post("/auth/refresh"); // ✅ naya accessToken cookie me mil jayega
        socket.connect(); // ✅ naye cookie ke saath dobara connect try karo
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
    socket = null;
  }
};
