import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UploadFileNotes from "../src/components/UploadFileNotes";

// 1. Mock External Dependencies
import api from "../utils/axios";
import toast from "react-hot-toast";

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// 2. Mock Document Parsers
jest.mock("pdfjs-dist", () => ({
  __esModule: true,
  GlobalWorkerOptions: {},
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: jest.fn(() =>
        Promise.resolve({
          getTextContent: jest.fn(() =>
            Promise.resolve({
              items: [{ str: "Mocked" }, { str: "PDF" }, { str: "Text" }],
            }),
          ),
        }),
      ),
    }),
  })),
}));

jest.mock("mammoth", () => ({
  __esModule: true,
  default: {
    extractRawText: jest.fn(() =>
      Promise.resolve({ value: "Mocked DOCX Text" }),
    ),
  },
  extractRawText: jest.fn(() => Promise.resolve({ value: "Mocked DOCX Text" })),
}));

// 3. Mock Lucide Icons
jest.mock("lucide-react", () => ({
  FileUp: () => <div data-testid="icon-fileup" />,
  X: () => <div data-testid="icon-x" />,
  Loader2: () => <div data-testid="icon-loader" />,
}));

describe("UploadFileNotes Component", () => {
  // Helper to create fake files with polyfilled arrayBuffer for JSDOM
  const createMockFile = (name, type, content = "Mock content") => {
    const file = new File([content], name, { type });
    file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(0));
    return file;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {}); // Silence the expected error logs
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <UploadFileNotes />
      </MemoryRouter>,
    );
  };

  it("renders the initial upload UI correctly", () => {
    renderComponent();

    expect(screen.getByText("Upload File as Note")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Note title")).toBeInTheDocument();
    expect(
      screen.getByText("Click to upload, or drag and drop"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save as Note" })).toBeDisabled();
  });

  it("shows an error if an unsupported file type is uploaded", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const invalidFile = createMockFile("image.png", "image/png");

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
      );
    });
  });

  it("extracts text from a TXT file and sets the title automatically", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const txtFile = createMockFile(
      "my-notes.txt",
      "text/plain",
      "Hello from TXT",
    );

    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Note title")).toHaveValue("my-notes");
      expect(screen.getByDisplayValue("Hello from TXT")).toBeInTheDocument();
      expect(toast.success).toHaveBeenCalledWith("Text extracted successfully");
    });
  });

  it("extracts text from a PDF file using the pdfjs-dist mock", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const pdfFile = createMockFile("document.pdf", "application/pdf");

    fireEvent.change(fileInput, { target: { files: [pdfFile] } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Note title")).toHaveValue("document");
      expect(screen.getByDisplayValue("Mocked PDF Text")).toBeInTheDocument();
    });
  });

  it("extracts text from a DOCX file using the mammoth mock", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const docxFile = createMockFile(
      "report.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

    fireEvent.change(fileInput, { target: { files: [docxFile] } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Note title")).toHaveValue("report");
      expect(screen.getByDisplayValue("Mocked DOCX Text")).toBeInTheDocument();
    });
  });

  it("clears the file and resets the form when the X button is clicked", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const txtFile = createMockFile("temp.txt", "text/plain", "Temp content");
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() => {
      expect(screen.getByText("temp.txt")).toBeInTheDocument();
    });

    const clearBtn = screen.getByTestId("icon-x").closest("button");
    fireEvent.click(clearBtn);

    expect(screen.queryByText("temp.txt")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Temp content")).not.toBeInTheDocument();
    expect(
      screen.getByText("Click to upload, or drag and drop"),
    ).toBeInTheDocument();
  });

  it("saves the extracted note and navigates to the app dashboard", async () => {
    api.post.mockResolvedValueOnce({ data: { message: "Created" } });
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const txtFile = createMockFile("final.txt", "text/plain", "Final content");
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() =>
      expect(screen.getByDisplayValue("Final content")).toBeInTheDocument(),
    );

    const saveBtn = screen.getByRole("button", { name: "Save as Note" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes/create", {
        title: "final",
        text: "Final content",
      });
      expect(toast.success).toHaveBeenCalledWith("Note created from file");
      expect(mockNavigate).toHaveBeenCalledWith("/app");
    });
  });

  it("shows an error if the user tries to save without a title", async () => {
    const { container } = renderComponent();

    const fileInput = container.querySelector('input[type="file"]');
    const txtFile = createMockFile("test.txt", "text/plain", "Test content");
    fireEvent.change(fileInput, { target: { files: [txtFile] } });

    await waitFor(() =>
      expect(screen.getByDisplayValue("Test content")).toBeInTheDocument(),
    );

    const titleInput = screen.getByPlaceholderText("Note title");
    fireEvent.change(titleInput, { target: { value: "   " } });

    const saveBtn = screen.getByRole("button", { name: "Save as Note" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter a title");
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
