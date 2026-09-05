import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import NavBar from "../src/components/NavBar";
import userReducer from "../utils/userSlice"; // Fixed Path

// Mock Axios and Socket so Jest doesn't try to parse them
jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("../utils/socket", () => ({
  disconnectSocket: jest.fn(),
  connectSocket: jest.fn(),
}));

// Mock Lucide icons to prevent SVG rendering errors in Jest
jest.mock("lucide-react", () => ({
  Pencil: () => <div data-testid="pencil-icon" />,
}));

const renderWithProviders = (initialUserState = null) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: initialUserState },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    </Provider>,
  );
};

describe("NavBar Component", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  it("renders the logo and brand name", () => {
    renderWithProviders(null);
    expect(screen.getByText(/Digital Notes/i)).toBeInTheDocument();
    expect(screen.getByTestId("pencil-icon")).toBeInTheDocument();
  });

  it("shows the Login link when the user is NOT logged in", () => {
    renderWithProviders(null);
    const loginLink = screen.getByRole("link", { name: /Login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("shows the greeting and 'Loading Profile' text when the user data is incomplete", () => {
    renderWithProviders({ full_name: "Alice" });

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText(/Loading profile…/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Profile/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the greeting and Profile link when the user is fully logged in", () => {
    renderWithProviders({ _id: "user123", full_name: "Bob" });

    expect(screen.getByText("Bob")).toBeInTheDocument();

    const profileLink = screen.getByRole("link", { name: /Profile/i });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute("href", "/app/profile/user123");
  });
});
