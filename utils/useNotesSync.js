import { connectSocket } from "../utils/socket";
import { useEffect } from "react";

export const useNotesSync = (setNotes) => {
  useEffect(() => {
    const socket = connectSocket();

    socket.on("note:created", (newNote) => {
      setNotes((perv) => [newNote, ...perv]);
    });

    socket.on("note:updated", (updatedNote) => {
      setNotes((perv) =>
        perv.map((n) => (n._id === updatedNote._id ? updatedNote : n)),
      );
    });

    socket.on("note:deleted", (notesId) => {
      setNotes((perv) => perv.filter((n) => n._id !== notesId));
    });

    return () => {
      socket.off("note:created");
      socket.off("note:updated");
      socket.off("note:deleted");
    };
  }, [setNotes]);
};
