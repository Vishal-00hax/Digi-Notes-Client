import React from "react";
import { Link } from "react-router";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV_LINKS = [
  { label: "Home", href: "#", active: true },
  { label: "Dashboard", href: "app" },
  { label: "About", href: "#about" },
  { label: "Journal", href: "#journal" },
  { label: "Reach Us", href: "#contact" },
];

const displayFont = { fontFamily: "'Instrument Serif', serif" };

function HomeScreen() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Fullscreen looping background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Glassmorphic Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a
          href="#"
          className="text-3xl tracking-tight text-foreground"
          style={displayFont}
        >
          Digital Notes<sup className="text-xs">®</sup>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm transition-colors ${
                link.active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link to="/login">
          <button className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]">
            Begin Journey
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center px-6 py-90px pb-40 pt-32 text-center">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl"
          style={displayFont}
        >
          Your Notes.{" "}
          <em className="not-italic text-muted-foreground">Your AI.</em> Your
          Second Brain.
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Turn your notes into an intelligent knowledge base. Ask questions
          naturally and get accurate answers from everything you've written
        </p>
        <Link to="/login">
          <button className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]">
            Begin Journey
          </button>
        </Link>
      </section>
    </div>
  );
}

export default HomeScreen;
