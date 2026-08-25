import React from "react";
import { useState, useEffect } from "react";
import api from "../../utils/axios";
import { useLogout } from "../../hooks/useLogout";
import { User, Mail, Monitor, LogOut } from "lucide-react";

function ProfileScreen() {
  const [user, setUser] = useState([]);
  const [sessions, setSession] = useState("");

  const getUser = async () => {
    const response = await api.get("/auth/profile");
    setUser(response.data.user);
    setSession(response.data.total_sessions);
  };

  const handleLogout = useLogout();

  useEffect(() => {
    getUser();
  }, []);

  console.log(user);

  return (
    <main
      className="relative min-h-full w-full overflow-y-auto bg-[#12151a] text-[#e6e4dd]"
      style={{
        background:
          "radial-gradient(ellipse 900px 600px at 75% -10%, rgba(215,166,59,0.05), transparent), #12151a",
      }}
    >
      {" "}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-12 lg:px-12">
        {" "}
        {/* Header */}{" "}
        <div className="mb-6 sm:mb-8">
          {" "}
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.7px] text-[#565c66]">
            {" "}
            Account{" "}
          </p>{" "}
          <h1 className="mt-1 font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-[#e6e4dd] sm:text-3xl md:text-4xl">
            {" "}
            Profile{" "}
          </h1>{" "}
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#9297a1] sm:text-[15px]">
            {" "}
            Manage your account information and view your active sessions.{" "}
          </p>{" "}
        </div>{" "}
        {/* Profile card */}{" "}
        <section className="overflow-hidden rounded-xl border border-[#2a303b] bg-[#171b22] shadow-[0_12px_35px_rgba(0,0,0,0.12)]">
          {" "}
          {/* Card header */}{" "}
          <div className="border-b border-[#2a303b] px-4 py-4 sm:px-6 sm:py-5 md:px-7">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e232c] text-[#d7a63b]">
                {" "}
                <User size={19} strokeWidth={1.8} />{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                <h2 className="truncate font-['Fraunces',serif] text-base font-medium text-[#e6e4dd] sm:text-lg">
                  {" "}
                  Personal information{" "}
                </h2>{" "}
                <p className="mt-0.5 text-xs text-[#565c66]">
                  {" "}
                  Your account details{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* User information */}{" "}
          <div className="grid grid-cols-1 divide-y divide-[#2a303b] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {" "}
            {/* Name */}{" "}
            <div className="flex min-w-0 items-center gap-3 px-4 py-5 sm:px-6 md:px-7">
              {" "}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a303b] bg-[#1e232c] text-[#9297a1]">
                {" "}
                <User size={16} />{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.5px] text-[#565c66]">
                  {" "}
                  Full name{" "}
                </p>{" "}
                <p className="mt-1 truncate text-sm font-medium text-[#e6e4dd] sm:text-[15px]">
                  {" "}
                  {user?.full_name || "Not available"}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            {/* Email */}{" "}
            <div className="flex min-w-0 items-center gap-3 px-4 py-5 sm:px-6 md:px-7">
              {" "}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#2a303b] bg-[#1e232c] text-[#9297a1]">
                {" "}
                <Mail size={16} />{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                <p className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.5px] text-[#565c66]">
                  {" "}
                  Email{" "}
                </p>{" "}
                <p className="mt-1 truncate text-sm font-medium text-[#e6e4dd] sm:text-[15px]">
                  {" "}
                  {user?.email || "Not available"}{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* Sessions card */}{" "}
        <section className="mt-4 overflow-hidden rounded-xl border border-[#2a303b] bg-[#171b22] shadow-[0_12px_35px_rgba(0,0,0,0.12)] sm:mt-5">
          {" "}
          <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-7">
            {" "}
            <div className="flex min-w-0 items-center gap-3">
              {" "}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1e232c] text-[#4fa88f]">
                {" "}
                <Monitor size={19} strokeWidth={1.8} />{" "}
              </div>{" "}
              <div className="min-w-0">
                {" "}
                <h2 className="font-['Fraunces',serif] text-base font-medium text-[#e6e4dd] sm:text-lg">
                  {" "}
                  Active sessions{" "}
                </h2>{" "}
                <p className="mt-0.5 text-xs text-[#565c66]">
                  {" "}
                  Devices currently signed in to your account{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex w-fit items-center gap-2 rounded-lg border border-[#2a303b] bg-[#1e232c] px-3 py-2">
              {" "}
              <span className="h-1.5 w-1.5 rounded-full bg-[#4fa88f]" />{" "}
              <span className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.4px] text-[#9297a1]">
                {" "}
                {sessions} active{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {/* Account actions */}{" "}
        <section className="mt-4 overflow-hidden rounded-xl border border-[#2a303b] bg-[#171b22] shadow-[0_12px_35px_rgba(0,0,0,0.12)] sm:mt-5">
          {" "}
          <div className="flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-7">
            {" "}
            <div>
              {" "}
              <h2 className="font-['Fraunces',serif] text-base font-medium text-[#e6e4dd] sm:text-lg">
                {" "}
                Account session{" "}
              </h2>{" "}
              <p className="mt-1 text-xs leading-5 text-[#565c66] sm:text-[13px]">
                {" "}
                Sign out from your current session.{" "}
              </p>{" "}
            </div>{" "}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a303b] bg-[#1e232c] px-4 py-2.5 text-sm font-medium text-[#e6e4dd] transition-all duration-150 hover:border-[#a1493a] hover:bg-[#262c37] hover:text-[#e6e4dd] active:translate-y-[1px] sm:w-auto"
            >
              {" "}
              <LogOut size={16} /> Logout{" "}
            </button>{" "}
          </div>{" "}
        </section>{" "}
        {/* Bottom spacing */} <div className="h-6 sm:h-8 md:h-10" />{" "}
      </div>{" "}
    </main>
  );
}

export default ProfileScreen;
