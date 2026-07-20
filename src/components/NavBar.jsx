import React from "react";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

function NavBar({ userName = "Vishal", onLogout }) {
  return (
    <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
      <a
        href="#"
        className="text-3xl tracking-tight text-foreground"
        style={displayFont}
      >
        Velorah<sup className="text-xs">®</sup>
      </a>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Hi, <span className="text-foreground">{userName}</span>
        </span>

        <button
          type="button"
          onClick={onLogout}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
