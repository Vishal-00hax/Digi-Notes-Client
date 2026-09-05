import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ProfileScreen from "../src/components/ProfileScreen";
import userReducer from "../utils/userSlice"; // Fixed Path

// 1. Mock External Dependencies
import api from "../utils/axios"; // Fixed Path
import toast from "react-hot-toast";
import { useLogout } from "../hooks/useLogout"; // Fixed Path

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock the useLogout hook
const mockHandleLogout = jest.fn();
jest.mock("../hooks/useLogout", () => ({
  useLogout: () => mockHandleLogout,
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

// 2. Mock Lucide Icons to prevent SVG rendering issues
jest.mock("lucide-react", () => ({
  User: () => <div data-testid="icon-user" />,
  Mail: () => <div data-testid="icon-mail" />,
  Monitor: () => <div data-testid="icon-monitor" />,
  LogOut: () => <div data-testid="icon-logout" />,
}));

// 3. Setup Helper Function
const renderWithProviders = () => {
  const store = configureStore({
    reducer: { user: userReducer },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProfileScreen />
      </MemoryRouter>
    </Provider>,
  );
};

describe("ProfileScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Silence the console.log(user) in the component to keep test output clean
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("fetches and displays user profile data on mount", async () => {
    // Mock the API response
    api.get.mockResolvedValueOnce({
      data: {
        user: { full_name: "Vishal Panghal", email: "vishal@example.com" },
        total_sessions: 1,
      },
    });

    renderWithProviders();

    // Verify API call was made
    expect(api.get).toHaveBeenCalledWith("/auth/profile");

    // Wait for the UI to update with the fetched data
    await waitFor(() => {
      expect(screen.getByText("Vishal Panghal")).toBeInTheDocument();
      expect(screen.getByText("vishal@example.com")).toBeInTheDocument();
      expect(screen.getByText("1 active")).toBeInTheDocument();
    });

    // Verify "Logout From All Devices" is NOT shown when sessions <= 1
    expect(
      screen.queryByRole("button", { name: /Logout From All Devices/i }),
    ).not.toBeInTheDocument();
  });

  it("displays fallback text when user details are missing", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        user: { full_name: null, email: null },
        total_sessions: 1,
      },
    });

    renderWithProviders();

    await waitFor(() => {
      const fallbacks = screen.getAllByText("Not available");
      expect(fallbacks).toHaveLength(2); // One for name, one for email
    });
  });

  it("shows 'Logout From All Devices' button when active sessions are greater than 1", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        user: { full_name: "Test User", email: "test@example.com" },
        total_sessions: 3, // Multiple sessions trigger the button
      },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("3 active")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Logout From All Devices/i }),
      ).toBeInTheDocument();
    });
  });

  it("handles standard Logout button click correctly", async () => {
    api.get.mockResolvedValueOnce({
      data: { user: {}, total_sessions: 1 },
    });

    renderWithProviders();

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText("1 active")).toBeInTheDocument();
    });

    // Click the standard Logout button (the one inside Account Session)
    const logoutBtn = screen.getByRole("button", { name: /^Logout$/i });
    fireEvent.click(logoutBtn);

    // Ensure our mocked custom hook function was triggered
    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });

  it("handles 'Logout From All Devices' successfully", async () => {
    api.get.mockResolvedValueOnce({
      data: { user: {}, total_sessions: 2 },
    });
    api.post.mockResolvedValueOnce({
      data: { message: "Logged out of all sessions successfully" },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("2 active")).toBeInTheDocument();
    });

    const logoutAllBtn = screen.getByRole("button", {
      name: /Logout From All Devices/i,
    });
    fireEvent.click(logoutAllBtn);

    await waitFor(() => {
      // Verify API was called
      expect(api.post).toHaveBeenCalledWith("/auth/all-session-logout");

      // Verify success UI/effects
      expect(toast.success).toHaveBeenCalledWith(
        "Logged out of all sessions successfully",
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");

      // Note: We don't explicitly test the dispatch(removeUser()) because
      // the Provider handles it internally, but the navigate + toast confirm the try block succeeded.
    });
  });

  it("shows an error toast if 'Logout From All Devices' fails", async () => {
    api.get.mockResolvedValueOnce({
      data: { user: {}, total_sessions: 2 },
    });
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("2 active")).toBeInTheDocument();
    });

    const logoutAllBtn = screen.getByRole("button", {
      name: /Logout From All Devices/i,
    });
    fireEvent.click(logoutAllBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Network Error");

      // Ensure the user wasn't redirected on failure
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
