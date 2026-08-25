import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { removeUser } from "../utils/userSlice";
import api from "../utils/axios";
import toast from "react-hot-toast";
import { disconnectSocket } from "../utils/socket";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await api.post(
        "/auth/logout",
        {},
        { withCredentials: true },
      );
      dispatch(removeUser());
      disconnectSocket();
      navigate("/");
      toast.success(response.data.message || "Logout Successful");
    } catch (err) {
      const errText =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errText);
    }
  };

  return handleLogout;
};
