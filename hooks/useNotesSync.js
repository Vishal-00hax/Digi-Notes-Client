import { connectSocket } from "../utils/socket";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { noteCreated, noteUpdated, noteDeleted } from "../utils/notesSlice";

export const useNotesSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    const handleCreated = (newNote) => dispatch(noteCreated(newNote));
    const handleUpdated = (updatedNote) => dispatch(noteUpdated(updatedNote));
    const handleDeleted = (notesId) => dispatch(noteDeleted(notesId));

    socket.on("note:created", handleCreated);
    socket.on("note:updated", handleUpdated);
    socket.on("note:deleted", handleDeleted);

    return () => {
      socket.off("note:created", handleCreated);
      socket.off("note:updated", handleUpdated);
      socket.off("note:deleted", handleDeleted);
    };
  }, [dispatch]);
};
