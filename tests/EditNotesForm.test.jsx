import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditNotesForm from "../src/components/EditNotesForm"; // Adjust path if needed

// Mock External Dependencies
import api from "../utils/axios"; // Adjust path to point to your utils folder
import toast from "react-hot-toast";

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { patch: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

describe("EditNotesForm Component", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    notesId: "note_123",
    title: "Original Title",
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the portal correctly with the initial title", () => {
    render(<EditNotesForm {...defaultProps} />);

    // Verify modal header
    expect(
      screen.getByRole("heading", { name: "Update Title" }),
    ).toBeInTheDocument();

    // Verify input is populated with the initial title prop
    expect(screen.getByLabelText("Title")).toHaveValue("Original Title");

    // Verify action buttons exist
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Update Title" }),
    ).toBeInTheDocument();
  });

  it("updates the input value when the user types", () => {
    render(<EditNotesForm {...defaultProps} />);

    const input = screen.getByLabelText("Title");

    fireEvent.change(input, { target: { value: "Updated Notes Title" } });

    expect(input).toHaveValue("Updated Notes Title");
  });

  it("calls the API, shows success toast, and closes modal on successful update", async () => {
    api.patch.mockResolvedValueOnce({ data: { message: "Success" } });

    render(<EditNotesForm {...defaultProps} />);

    // Change the title
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Title" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Update Title" }));

    await waitFor(() => {
      // Verify API was called with the correct payload
      expect(api.patch).toHaveBeenCalledWith("/notes/update", {
        notesId: "note_123",
        title: "New Title",
      });

      // Verify success UI/effects
      expect(toast.success).toHaveBeenCalledWith("Title Updated");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shows an error toast and keeps the modal open if the API fails", async () => {
    api.patch.mockRejectedValueOnce({
      response: { message: "Invalid title format" },
    });

    render(<EditNotesForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Update Title" }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Invalid title format");

      // Ensure the modal does NOT close on failure
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("closes the modal when the Cancel button is clicked", () => {
    render(<EditNotesForm {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("closes the modal when the backdrop is clicked, but NOT when the modal body is clicked", () => {
    render(<EditNotesForm {...defaultProps} />);

    const heading = screen.getByRole("heading", { name: "Update Title" });
    const modalBody = heading.parentElement.parentElement; // The inner div
    const backdrop = modalBody.parentElement; // The outer overlay div

    // Clicking inside the modal should NOT trigger onClose (due to e.stopPropagation)
    fireEvent.click(modalBody);
    expect(mockOnClose).not.toHaveBeenCalled();

    // Clicking the outer backdrop SHOULD trigger onClose
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
