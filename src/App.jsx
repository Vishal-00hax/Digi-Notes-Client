import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { Routes } from "react-router";
import { Route } from "react-router";
import HomeScreen from "./HomeScreen";
import Body from "./Body";
import DashboardScreen from "../src/components/DashboardScreen";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeScreen />} />

        <Route path="app" element={<Body />}>
          <Route index element={<DashboardScreen />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
