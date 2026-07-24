// utils/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  console.log("connectSocket called, URL:", import.meta.env.VITE_SOCKET_URL); // ✅ add karein

  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id); // ✅ add karein
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
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
