import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../utils/userSlice";
import notesReducer from "../utils/notesSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    notes: notesReducer,
  },
});

export default store;
