import "./App.css";
import { Routes, Route, useNavigate } from "react-router";
import HomeScreen from "./HomeScreen";
import Body from "./Body";
import DashboardScreen from "../src/components/DashboardScreen";
import LoginScreen from "./components/LoginScreen";
import EditNotesForm from "../src/components/EditNotesForm";
import { Toaster } from "react-hot-toast";
import api from "../utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";

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
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<HomeScreen />} />

        <Route path="app" element={<Body />}>
          <Route index element={<DashboardScreen />} />
          <Route path="create-note/:notesId" element={<EditNotesForm />} />
        </Route>
        <Route path="login" element={<LoginScreen />} />
      </Routes>
    </>
  );
}

export default App;
