import React from "react";
import NavBar from "./components/NavBar";
import { Outlet } from "react-router";

function Body() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Body;
