import "./App.css";
import { Routes, Route, useNavigate } from "react-router";
import HomeScreen from "./HomeScreen";
import Body from "./Body";
import DashboardScreen from "../src/components/DashboardScreen";
import LoginScreen from "./components/LoginScreen";
import EditNotesForm from "../src/components/EditNotesForm";
import UploadFileNotes from "../src/components/UploadFileNotes";
import ProfileScreen from "./components/ProfileScreen";
import { Toaster } from "react-hot-toast";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import { removeUser } from "../utils/userSlice";
import { connectSocket, getSocket, disconnectSocket } from "../utils/socket";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((store) => store.user);

  const getUser = async () => {
    try {
      if (user) return;
      const response = await api.get("/auth/profile");
      dispatch(addUser(response.data.user));
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();

    const handleForceLogout = async () => {
      try {
        await api.post("/auth/logout", {}, { withCredentials: true });
      } catch (err) {
        // API fail ho sakti hai (jaise cookies already clear ho chuki ho),
        // fir bhi local cleanup zaroor hona chahiye
      } finally {
        dispatch(removeUser());
        disconnectSocket();
        navigate("/login");
      }
    };

    socket.on("force-logout", handleForceLogout);

    return () => {
      socket.off("force-logout", handleForceLogout);
    };
  }, [user]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeScreen />} />

        <Route path="app" element={<Body />}>
          <Route index element={<DashboardScreen />} />
          <Route path="upload" element={<UploadFileNotes />} />
          <Route path="profile/:userId" element={<ProfileScreen />} />
        </Route>
        <Route path="login" element={<LoginScreen />} />
      </Routes>
    </>
  );
}

export default App;
