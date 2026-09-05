import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotesContentForm from "../src/components/NotesContentForm"; // Adjust path if needed

// 1. Mock External Dependencies
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

// 2. Mock Lucide Icons to prevent SVG rendering issues
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

  // Setup fake window.open for the Print functionality test
  let originalWindowOpen;
  let mockPrintWindow;

  beforeEach(() => {
    jest.clearAllMocks();

    // Silence React's useLayoutEffect warning for JSDOM
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Mock window.open
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

    // Verify Title and Text are populated
    expect(screen.getByPlaceholderText("Untitled note")).toHaveValue(
      "Test Note",
    );
    expect(screen.getByPlaceholderText("Start writing…")).toHaveValue(
      "This is a test note with seven words.",
    );

    // Verify metadata (Date and Word Count)
    expect(screen.getByText(/Sep 5, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/8 words/i)).toBeInTheDocument(); // 8 words in the string
  });

  it("renders correctly with empty data", () => {
    render(<NotesContentForm data={null} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText("Untitled note")).toHaveValue("");
    expect(screen.getByPlaceholderText("Start writing…")).toHaveValue("");
    expect(screen.getByText("—")).toBeInTheDocument(); // Empty date fallback
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

  it("saves the note successfully when the save button is clicked", async () => {
    api.patch.mockResolvedValueOnce({ data: { message: "Success" } });

    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    // Find the save button by its title attribute
    const saveButton = screen.getByTitle("Save note");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/notes/update", {
        notesId: "note_123",
        title: "Test Note",
        text: "This is a test note with seven words.",
      });
      expect(toast.success).toHaveBeenCalledWith("Note Saved");
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

    // Default is left
    expect(titleInput).toHaveClass("text-left");
    expect(textInput).toHaveClass("text-left");

    // Click Center
    const centerBtn = screen.getByTestId("icon-align-center").closest("button");
    fireEvent.click(centerBtn);
    expect(titleInput).toHaveClass("text-center");
    expect(textInput).toHaveClass("text-center");

    // Click Right
    const rightBtn = screen.getByTestId("icon-align-right").closest("button");
    fireEvent.click(rightBtn);
    expect(titleInput).toHaveClass("text-right");
    expect(textInput).toHaveClass("text-right");
  });

  it("toggles bold font class on the textarea when the bold button is clicked", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    const textInput = screen.getByPlaceholderText("Start writing…");
    const boldBtn = screen.getByTestId("icon-bold").closest("button");

    // Default is normal
    expect(textInput).toHaveClass("font-normal");
    expect(textInput).not.toHaveClass("font-bold");

    // Click Bold
    fireEvent.click(boldBtn);
    expect(textInput).toHaveClass("font-bold");
    expect(textInput).not.toHaveClass("font-normal");
  });

  it("opens a print window and writes the document HTML when the print button is clicked", () => {
    render(<NotesContentForm data={mockData} onChange={mockOnChange} />);

    // Click Print
    const printBtn = screen.getByTitle("Print / Download PDF");
    fireEvent.click(printBtn);

    // Verify window.open was called
    expect(window.open).toHaveBeenCalledWith(
      "",
      "_blank",
      "width=800,height=600",
    );

    // Verify the mock window methods were executed
    expect(mockPrintWindow.document.write).toHaveBeenCalled();
    expect(mockPrintWindow.document.close).toHaveBeenCalled();
    expect(mockPrintWindow.focus).toHaveBeenCalled();
    expect(mockPrintWindow.print).toHaveBeenCalled();

    // Verify the injected HTML contained the actual note data
    const injectedHTML = mockPrintWindow.document.write.mock.calls[0][0];
    expect(injectedHTML).toContain("Test Note");
    expect(injectedHTML).toContain("This is a test note with seven words.");
  });
});
