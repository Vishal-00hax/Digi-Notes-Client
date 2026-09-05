import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Notice the "../src/" added to reach out of the tests folder
import HomeScreen from "../src/HomeScreen";
import userReducer from "../utils/userSlice";

// Helper function to render component with mock Redux and Router
const renderWithProviders = (initialUserState = null) => {
  // Create a fresh Redux store for each test to prevent state leakage
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: {
      user: initialUserState,
    },
  });

  return render(
    <Provider store={store}>
      {/* MemoryRouter simulates the browser URL environment */}
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    </Provider>,
  );
};

describe("HomeScreen Component", () => {
  it("renders the hero text and video background correctly", () => {
    renderWithProviders(null);

    // Better: Target the specific <h1> heading instead of raw text
    const mainHeading = screen.getByRole("heading", { name: /Your Notes/i });
    expect(mainHeading).toBeInTheDocument();

    // Check if the other part of the heading text is inside that same h1
    expect(mainHeading).toHaveTextContent(/Your Second Brain/i);

    // Check if the logo/brand text is present
    expect(screen.getByText(/Digital Notes/i)).toBeInTheDocument();
  });

  it("shows 'Begin Journey' links when the user is NOT logged in", () => {
    // Pass null for user state
    renderWithProviders(null);

    // There are two "Begin Journey" buttons (one in Nav, one in Hero)
    const loginButtons = screen.getAllByRole("button", {
      name: /Begin Journey/i,
    });

    expect(loginButtons).toHaveLength(2);

    // Verify they are wrapped in Links pointing to /login
    // We check the closest 'a' tag (Link renders as 'a' tag in HTML)
    expect(loginButtons[0].closest("a")).toHaveAttribute("href", "/login");
  });

  it("shows 'Dashboard' links when the user IS logged in", () => {
    // Pass a fake user object to simulate being logged in
    const mockUser = { _id: "user123", full_name: "John Doe" };
    renderWithProviders(mockUser);

    // Check that "Begin Journey" is gone
    expect(
      screen.queryByRole("button", { name: /Begin Journey/i }),
    ).not.toBeInTheDocument();

    // There should be two "Dashboard" buttons now
    const dashboardButtons = screen.getAllByRole("button", {
      name: /Dashboard/i,
    });
    expect(dashboardButtons).toHaveLength(2);

    // Verify they point to the /app route
    expect(dashboardButtons[0].closest("a")).toHaveAttribute("href", "/app");
  });

  it("renders the navigation links correctly", () => {
    renderWithProviders(null);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toHaveAttribute("href", "#about");
    expect(screen.getByText("Journal")).toHaveAttribute("href", "#journal");
    expect(screen.getByText("Reach Us")).toHaveAttribute("href", "#contact");
  });
});
