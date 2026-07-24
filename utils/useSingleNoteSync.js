import { useEffect } from "react";
import { connectSocket } from "../utils/socket";

export const useSingleNoteSync = (notesId, setSelectedNote) => {
  useEffect(() => {
    if (!notesId) return;

    const socket = connectSocket();

    const handleUpdate = (updatedNote) => {
      //Sirf usi note ka update lein jo abhi khula hai
      if (updatedNote._id === notesId) {
        setSelectedNote(updatedNote);
      }
    };

    const handleDelete = (deletedNoteId) => {
      // Agar yahi khula hua note kisi doosre device se delete ho gaya
      if (deletedNoteId === notesId) {
        setSelectedNote(null); // panel khali kar do, "select a note" wapas dikhega
      }
    };

    socket.on("note:updated", handleUpdate);
    socket.on("note:updated", handleDelete);

    return () => {
      socket.off("note:updated", handleUpdate);
      socket.off("note:updated", handleDelete);
    };
  }, [notesId, setSelectedNote]);
};
