import { createSlice } from "@reduxjs/toolkit";

const notesSlice = createSlice({
  name: "notes",
  initialState: {
    items: [],
    selectedNoteId: null, // कौन सा note खुला है
    selectedNote: null, // खुले हुए note का पूरा data
    loadingNote: false,
  },
  reducers: {
    // ===== REST API actions =====
    setNotes: (state, action) => {
      state.items = action.payload;
    },
    setSelectedNote: (state, action) => {
      state.selectedNote = action.payload;
    },
    setSelectedNoteId: (state, action) => {
      state.selectedNoteId = action.payload;
      // note switch hote hi purana data turant clear kar do,
      // taaki purane note ka content flash na ho
      if (action.payload === null) {
        state.selectedNote = null;
      }
    },
    setLoadingNote: (state, action) => {
      state.loadingNote = action.payload;
    },
    patchSelectedNote: (state, action) => {
      // NotesContentForm ka local edit (title/text typing)
      if (state.selectedNote) {
        state.selectedNote = { ...state.selectedNote, ...action.payload };
      }
    },

    // ===== Socket real-time events =====
    noteCreated: (state, action) => {
      // duplicate na aaye isliye check
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists) state.items.unshift(action.payload);
    },
    noteUpdated: (state, action) => {
      const updated = action.payload;
      state.items = state.items.map((n) =>
        n._id === updated._id ? updated : n,
      );
      // agar yahi note abhi khula hai, use bhi refresh karo
      if (state.selectedNoteId === updated._id) {
        state.selectedNote = updated;
      }
    },
    noteDeleted: (state, action) => {
      const deletedId = action.payload;
      state.items = state.items.filter((n) => n._id !== deletedId);
      if (state.selectedNoteId === deletedId) {
        state.selectedNoteId = null;
        state.selectedNote = null;
      }
    },
  },
});

export const {
  setNotes,
  setSelectedNote,
  setSelectedNoteId,
  setLoadingNote,
  patchSelectedNote,
  noteCreated,
  noteUpdated,
  noteDeleted,
} = notesSlice.actions;

export default notesSlice.reducer;
