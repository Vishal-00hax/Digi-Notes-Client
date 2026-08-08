import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chats",
  initialState: [],
  reducers: {
    // 1. Initial Load के लिए (सब कुछ रिप्लेस कर देगा)
    setAllChats: (state, action) => {
      return Array.isArray(action.payload) ? action.payload : [];
    },

    // 2. Pagination के लिए (पुराने चैट्स ऊपर जोड़ेंगे, बिना डुप्लीकेट के)
    addOlderChats: (state, action) => {
      const incomingChats = Array.isArray(action.payload) ? action.payload : [];
      // सिर्फ वही चैट्स डालें जो State में पहले से मौजूद नहीं हैं
      const uniqueOlderChats = incomingChats.filter(
        (newChat) =>
          !state.some((existingChat) => existingChat._id === newChat._id),
      );
      return [...uniqueOlderChats, ...state];
    },

    // 3. Sockets और New API Response के लिए (अगर है तो अपडेट करो, नहीं तो जोड़ो)
    addOrUpdateChat: (state, action) => {
      const newChat = action.payload;
      if (!newChat || !newChat._id) return;

      const existingIndex = state.findIndex((c) => c._id === newChat._id);
      if (existingIndex !== -1) {
        state[existingIndex] = newChat; // Update
      } else {
        state.push(newChat); // Append at bottom
      }
    },

    // 4. API रिस्पॉन्स आने के बाद Loading (Temp) चैट को हटाने के लिए
    removeTempChat: (state, action) => {
      const tempId = action.payload;
      return state.filter((c) => c._id !== tempId);
    },

    // 5. Delete के लिए (Bulletproof Logic)
    removeChats: (state, action) => {
      const payload = action.payload;
      // अगर सॉकेट ने Object भेजा है, तो उसमें से ID निकालें, वरना सीधा इस्तेमाल करें
      const idToRemove =
        typeof payload === "object"
          ? payload._id || payload.id || payload.chatId
          : payload;

      return state.filter((c) => String(c._id) !== String(idToRemove));
    },

    clearChats: () => {
      return [];
    },
  },
});

export const {
  setAllChats,
  addOlderChats,
  addOrUpdateChat,
  removeTempChat,
  removeChats,
  clearChats,
} = chatSlice.actions;

export default chatSlice.reducer;
