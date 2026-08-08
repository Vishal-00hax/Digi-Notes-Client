import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../utils/userSlice";
import notesReducer from "../utils/notesSlice";
import chatSlice from "../utils/chatSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    notes: notesReducer,
    chats: chatSlice,
  },
});

export default store;
