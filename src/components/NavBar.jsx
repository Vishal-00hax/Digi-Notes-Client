import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeUser } from "../../utils/userSlice";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { disconnectSocket } from "../../utils/socket";
import { Link } from "react-router";
import { Pencil } from "lucide-react";

function NavBar() {
  const user = useSelector((store) => store.user);
  console.log("User from NavBar", user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <nav className="relative z-10 flex items-center justify-between border-b border-[#2a303b] bg-[#171b22] px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[28px] w-[28px] items-center justify-center text-[#d7a63b]">
          <Pencil size={18} />
        </div>
        <Link to={"/app"}>
          <span className="font-['Fraunces',serif] text-lg font-semibold tracking-[0.2px] text-[#e6e4dd]">
            Digital Notes
          </span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center gap-3 md:gap-4">
          <span className="hidden text-sm text-[#9297a1] sm:inline">
            Hi, <span className="text-[#e6e4dd]">{user.full_name}</span>
          </span>

          {/* ✅ Only render the Profile link if user._id exists */}
          {user._id ? (
            <Link
              to={`/app/profile/${user._id}`}
              className="group inline-flex items-center gap-2 rounded-lg border border-[#2a303b] bg-[#1e232c] px-3.5 py-2 text-sm font-medium text-[#e6e4dd] shadow-[0_1px_0_rgba(0,0,0,0.12)] transition-all duration-150 hover:border-[#d7a63b]/40 hover:bg-[#262c37] hover:text-[#d7a63b] active:translate-y-[1px] md:px-4 md:py-2.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7a63b] opacity-70 transition-opacity group-hover:opacity-100" />
              Profile
            </Link>
          ) : (
            // Optional fallback when user exists but _id is missing (e.g., loading state)
            <span className="text-sm text-[#9297a1]">Loading profile…</span>
          )}
        </div>
      ) : (
        <Link to="/login" className="...">
          Login
        </Link>
      )}
    </nav>
  );
}

export default NavBar;
