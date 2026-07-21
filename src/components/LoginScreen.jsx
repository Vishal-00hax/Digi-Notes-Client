import React, { useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

const inputClasses =
  "w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-300 focus:border-foreground/40";

function LoginScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  console.log("FormData:", formData);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((perv) => ({
      ...perv,
      [name]: value,
    }));
  };

  const handleSignUp = async () => {
    try {
      const response = await api.post("/auth/signup", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });
      toast.success("Signup Successfull");
      navigate("/app");
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong !";
      toast.error(errText);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      navigate("/app");
      toast.success("Login Successfull");
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong !";
      toast.error(errText);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSignup) {
      await handleSignUp();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 z-0 bg-background/60" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-12">
        <div className="liquid-glass animate-fade-rise w-full max-w-md rounded-3xl px-8 py-10 sm:px-10">
          <div className="mb-8 text-center">
            <a
              href="#"
              className="text-3xl tracking-tight text-foreground"
              style={displayFont}
            >
              Digital Notes<sup className="text-xs">®</sup>
            </a>

            <h1
              key={isSignup ? "signup-title" : "login-title"}
              className="animate-fade-rise mt-6 text-3xl text-foreground sm:text-4xl"
              style={displayFont}
            >
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p
              key={isSignup ? "signup-sub" : "login-sub"}
              className="animate-fade-rise-delay mt-2 text-sm text-muted-foreground"
            >
              {isSignup
                ? "Join Digital Notes and start building in silence."
                : "Sign in to continue where you left off."}
            </p>
          </div>

          {/* Mode Switch */}
          <div className="liquid-glass relative mb-8 flex rounded-full p-1">
            <div
              className="absolute inset-y-1 w-1/2 rounded-full bg-foreground/10 transition-transform duration-300 ease-out"
              style={{
                transform: isSignup ? "translateX(100%)" : "translateX(0%)",
              }}
            />
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`relative z-10 flex-1 rounded-full py-2 text-sm transition-colors duration-300 ${
                !isSignup ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`relative z-10 flex-1 rounded-full py-2 text-sm transition-colors duration-300 ${
                isSignup ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            key={isSignup ? "signup-form" : "login-form"}
            className="flex flex-col gap-4"
            onSubmit={handleFormSubmit}
          >
            {isSignup && (
              <div
                className="animate-fade-rise flex flex-col gap-1.5"
                style={{ animationDelay: "0.05s" }}
              >
                <label htmlFor="name" className="text-xs text-muted-foreground">
                  Name
                </label>
                <input
                  id="name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className={inputClasses}
                  autoComplete="name"
                />
              </div>
            )}

            <div
              className="animate-fade-rise flex flex-col gap-1.5"
              style={{ animationDelay: isSignup ? "0.1s" : "0.05s" }}
            >
              <label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClasses}
                autoComplete="email"
              />
            </div>

            <div
              className="animate-fade-rise flex flex-col gap-1.5"
              style={{ animationDelay: isSignup ? "0.15s" : "0.1s" }}
            >
              <label
                htmlFor="password"
                className="text-xs text-muted-foreground"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`${inputClasses} pr-16`}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="liquid-glass mt-2 rounded-full px-6 py-3 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              {isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to Velorah?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignup((prev) => !prev)}
              className="text-foreground underline-offset-4 hover:underline"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
