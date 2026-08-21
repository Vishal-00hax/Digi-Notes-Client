// utils/socket.js
import { io } from "socket.io-client";
import api from "./axios";
let socket = null;
let isRefreshingForSocket = false;

export const connectSocket = () => {
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

    if (err.message === "Invalid or expired token" && !isRefreshingForSocket) {
      isRefreshingForSocket = true;
      try {
        await api.post("/auth/refresh");
        socket.connect();
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
