import { connectSocket } from "../utils/socket";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { addOrUpdateChat, removeChats } from "../utils/chatSlice";

export const useChatsSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    const handleCreated = (newChat) => dispatch(addOrUpdateChat(newChat));
    const handleDeleted = (chatId) => dispatch(removeChats(chatId));

    socket.on("chat:created", handleCreated);
    socket.on("chat:deleted", handleDeleted);

    return () => {
      socket.off("chat:created", handleCreated);
      socket.off("chat:deleted", handleDeleted);
    };
  }, [dispatch]);
};
