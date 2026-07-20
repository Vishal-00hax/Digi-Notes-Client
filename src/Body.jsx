import React from "react";
import NavBar from "./components/NavBar";
import { Outlet } from "react-router";

function Body() {
  return (
    <div>
      <NavBar />
      <Outlet />
    </div>
  );
}

export default Body;
