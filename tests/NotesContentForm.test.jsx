import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotesContentForm from "../src/components/NotesContentForm";

import api from "../utils/axios";
import toast from "react-hot-toast";

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { patch: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// FIX: Mock react-redux to prevent context crash and allow dispatch verification
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock("../utils/notesSlice", () => ({
  noteUpdated: jest.fn((payload) => ({ type: "notes/noteUpdated", payload })),
}));

jest.mock("lucide-react", () => ({
  Printer: () => <div data-testid="icon-printer" />,
  Save: () => <div data-testid="icon-save" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  Type: () => <div data-testid="icon-type" />,
  AlignLeft: () => <div data-testid="icon-align-left" />,
  AlignCenter: () => <div data-testid="icon-align-center" />,
  AlignRight: () => <div data-testid="icon-align-right" />,
  Bold: () => <div data-testid="icon-bold" />,
  Paperclip: () => <div data-testid="icon-paperclip" />,
}));

describe("NotesContentForm Component", () => {
  const mockOnChange = jest.fn();
  const mockData = {
    _id: "note_123",
    title: "Test Note",
    text: "This is a test note with seven words.",
    updatedAt: "2026-09-05T12:00:00.000Z",
  };

  let originalWindowOpen;
  let mockPrintWindow;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});

    originalWindowOpen = window.open;
    mockPrintWindow = {
      document: {
        write: jest.fn(),
        close: jest.fn(),
      },
      focus: jest.fn(),
      print: jest.fn(),
    };
    window.open = jest.fn().mockReturnValue(mockPrintWindow);
  });

  afterEach(() => {
    window.open = originalWindowOpen;
  });

  it("renders correctly with provided note data", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Untitled note")).toHaveValue(
      "Test Note",
    );
    expect(screen.getByPlaceholderText("Start writing…")).toHaveValue(
      "This is a test note with seven words.",
    );
    expect(screen.getByText(/Sep 5, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/8 words/i)).toBeInTheDocument();
  });

  it("renders correctly with empty data", () => {
    render(<NotesContentForm data={null} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Untitled note")).toHaveValue("");
    expect(screen.getByPlaceholderText("Start writing…")).toHaveValue("");
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText(/0 words/i)).toBeInTheDocument();
  });

  it("triggers onChange when title or text is updated", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const titleInput = screen.getByPlaceholderText("Untitled note");
    const textInput = screen.getByPlaceholderText("Start writing…");

    fireEvent.change(titleInput, { target: { value: "Updated Title" } });
    expect(mockOnChange).toHaveBeenCalledWith({ title: "Updated Title" });

    fireEvent.change(textInput, { target: { value: "Updated text content." } });
    expect(mockOnChange).toHaveBeenCalledWith({
      text: "Updated text content.",
    });
  });

  it("saves the note successfully when the save button is clicked and dispatches to Redux", async () => {
    // FIX: Provide the correct nested object shape to match `const updatedNote = response.data.data;`
    const updatedNote = { ...mockData, title: "Updated Test Note" };
    api.patch.mockResolvedValueOnce({ data: { data: updatedNote } });

    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const saveButton = screen.getByTitle("Save note");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/notes/update", {
        notesId: "note_123",
        title: "Test Note",
        text: "This is a test note with seven words.",
      });
      expect(toast.success).toHaveBeenCalledWith("Note Saved");

      // FIX: Assert that Redux dispatch was fired successfully with the updated note
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "notes/noteUpdated",
        payload: updatedNote,
      });
    });
  });

  it("shows an error toast if saving fails", async () => {
    api.patch.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);
    fireEvent.click(screen.getByTitle("Save note"));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Server error");
    });
  });

  it("toggles text alignment classes when alignment buttons are clicked", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const titleInput = screen.getByPlaceholderText("Untitled note");
    const textInput = screen.getByPlaceholderText("Start writing…");

    expect(titleInput).toHaveClass("text-left");

    const centerBtn = screen.getByTestId("icon-align-center").closest("button");
    fireEvent.click(centerBtn);
    expect(titleInput).toHaveClass("text-center");

    const rightBtn = screen.getByTestId("icon-align-right").closest("button");
    fireEvent.click(rightBtn);
    expect(titleInput).toHaveClass("text-right");
  });

  it("toggles bold font class on the textarea when the bold button is clicked", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const textInput = screen.getByPlaceholderText("Start writing…");
    const boldBtn = screen.getByTestId("icon-bold").closest("button");

    expect(textInput).toHaveClass("font-normal");

    fireEvent.click(boldBtn);
    expect(textInput).toHaveClass("font-bold");
  });

  it("opens a print window and writes the document HTML when the print button is clicked", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const printBtn = screen.getByTitle("Print / Download PDF");
    fireEvent.click(printBtn);

    expect(window.open).toHaveBeenCalledWith(
      "",
      "_blank",
      "width=800,height=600",
    );
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();
    expect(mockPrintWindow.focus).toHaveBeenCalled();
    expect(mockPrintWindow.print).toHaveBeenCalled();

    const injectedHTML = mockPrintWindow.document.write.mock.calls[0][0];
    expect(injectedHTML).toContain("Test Note");
    expect(injectedHTML).toContain("This is a test note with seven words.");
  });
});
