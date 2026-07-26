import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../../utils/userSlice";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { disconnectSocket } from "../../utils/socket";
import { Link } from "react-router";

function NavBar() {
  const user = useSelector((store) => store.user);
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

  return (
    <nav className="relative z-10 flex items-center justify-between border-b border-[#2a303b] bg-[#171b22] px-6 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[28px] w-[28px] items-center justify-center text-[#d7a63b]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
          >
            <path
              d="M4 20L14.5 9.5M14.5 9.5L18 6a1.5 1.5 0 0 0-3-3L11.5 6.5M14.5 9.5 11.5 6.5M4 20l1.2-4.2L11.5 9.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 20l3.8-1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <Link to={"/"}>
          <span className="font-['Fraunces',serif] text-lg font-semibold tracking-[0.2px] text-[#e6e4dd]">
            Digital Notes
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-[#9297a1] sm:inline">
          Hi, <span className="text-[#e6e4dd]">{user?.full_name}</span>
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-[#2a303b] bg-[#1e232c] px-4 py-2 text-sm text-[#e6e4dd] transition-all hover:bg-[#262c37] active:translate-y-[1px]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
