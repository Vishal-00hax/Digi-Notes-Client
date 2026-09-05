import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LoginScreen from "../src/components/LoginScreen";
import userReducer from "../utils/userSlice"; // Fixed Path

// Import external dependencies so we can mock them
import api from "../utils/axios"; // Fixed Path
import toast from "react-hot-toast";

// 1. Mock Axios & Toast with factory functions so Jest NEVER reads the real files
jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// 2. Mock useNavigate to intercept redirects
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = () => {
  const store = configureStore({
    reducer: { user: userReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginScreen />
      </MemoryRouter>
    </Provider>,
  );
};

describe("LoginScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Login form by default", () => {
    renderWithProviders();
    expect(
      screen.getByRole("heading", { name: /Welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Name/i)).not.toBeInTheDocument();
  });

  it("toggles to Sign Up mode and reveals the Name input", () => {
    renderWithProviders();
    const signUpToggle = screen.getByRole("button", { name: "Sign Up" });
    fireEvent.click(signUpToggle);

    expect(
      screen.getByRole("heading", { name: /Create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("toggles password visibility when the 'Show/Hide' button is clicked", () => {
    renderWithProviders();
    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleBtn = screen.getByRole("button", { name: "Show" });

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide" })).toBeInTheDocument();
  });

  it("submits the Login form successfully", async () => {
    api.post.mockResolvedValueOnce({
      data: { user: { _id: "123", full_name: "Test User" } },
    });
    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
      expect(toast.success).toHaveBeenCalledWith("Login Successfull");
      expect(mockNavigate).toHaveBeenCalledWith("/app");
    });
  });

  it("shows an error toast when Login fails", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });
    renderWithProviders();

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
