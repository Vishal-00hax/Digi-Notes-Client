import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import DashboardScreen from "../src/components/DashboardScreen";
import notesReducer from "../utils/notesSlice";

// 1. Mock External Dependencies
import api from "../utils/axios";
import toast from "react-hot-toast";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useNotesSync } from "../hooks/useNotesSync";

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}));

// Mock Custom Hooks
jest.mock("../hooks/useVoiceInput", () => ({
  useVoiceInput: jest.fn(),
}));
jest.mock("../hooks/useNotesSync", () => ({
  useNotesSync: jest.fn(),
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// 2. Mock Child Components to isolate Dashboard testing
jest.mock("../src/components/NotesContentForm", () => () => (
  <div data-testid="notes-content-form">NotesContentForm</div>
));
jest.mock("../src/components/ChatAskAI", () => () => (
  <div data-testid="chat-ask-ai">ChatAskAI</div>
));
jest.mock("../src/components/EditNotesForm", () => () => (
  <div data-testid="edit-notes-form">EditNotesForm</div>
));

// Mock Lucide Icons
jest.mock("lucide-react", () => ({
  Plus: () => <div data-testid="icon-plus" />,
  BotMessageSquare: () => <div data-testid="icon-bot" />,
  Search: () => <div data-testid="icon-search" />,
  SquarePen: () => <div data-testid="icon-edit" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Mic: () => <div data-testid="icon-mic" />,
  Upload: () => <div data-testid="icon-upload" />,
  Menu: () => <div data-testid="icon-menu" />,
  X: () => <div data-testid="icon-x" />,
}));

// 3. Setup Helper Function
const renderWithProviders = (preloadedState = {}) => {
  const store = configureStore({
    reducer: { notes: notesReducer },
    preloadedState: {
      notes: {
        items: [],
        selectedNoteId: null,
        selectedNote: null,
        loadingNote: false,
        ...preloadedState,
      },
    },
  });

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <DashboardScreen />
        </MemoryRouter>
      </Provider>,
    ),
    store,
  };
};

describe("DashboardScreen Component", () => {
  const mockNotes = [
    {
      _id: "note_1",
      title: "Meeting Notes",
      text: "Discussed project A",
      updatedAt: "2026-09-01T10:00:00Z",
    },
    {
      _id: "note_2",
      title: "Ideas",
      text: "App ideas",
      updatedAt: "2026-09-02T10:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Silence console logs during tests to keep terminal clean
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    useNotesSync.mockImplementation(() => {});
    useVoiceInput.mockImplementation((onResult) => ({
      isListening: false,
      isSupported: true,
      startListening: jest.fn(),
    }));
  });

  it("fetches notes on mount and renders ChatAskAI by default (no note selected)", async () => {
    api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });

    renderWithProviders();

    expect(api.get).toHaveBeenCalledWith("/notes/user");

    await waitFor(() => {
      expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      expect(screen.getByText("Ideas")).toBeInTheDocument();
    });

    expect(screen.getByTestId("chat-ask-ai")).toBeInTheDocument();
    expect(screen.queryByTestId("notes-content-form")).not.toBeInTheDocument();
  });

  it("filters notes when typing in the search bar", async () => {
    // Mock the initial fetch so we don't get act() warnings
    api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });

    renderWithProviders({ items: mockNotes });

    await waitFor(() => {
      expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
      expect(screen.getByText("Ideas")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search your notes…");
    fireEvent.change(searchInput, { target: { value: "Meeting" } });

    expect(screen.getByText("Meeting Notes")).toBeInTheDocument();
    expect(screen.queryByText("Ideas")).not.toBeInTheDocument();
  });

  it("fetches note details and shows NotesContentForm when a note is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
    api.get.mockResolvedValueOnce({
      data: {
        note: {
          _id: "note_1",
          title: "Meeting Notes",
          text: "Full content here",
        },
      },
    });

    renderWithProviders();

    await waitFor(() => {
      const noteTitle = screen.getByText("Meeting Notes");
      fireEvent.click(noteTitle);
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/notes/get/note_1");
      expect(screen.getByTestId("notes-content-form")).toBeInTheDocument();
      expect(screen.queryByTestId("chat-ask-ai")).not.toBeInTheDocument();
    });
  });

  it("creates a new note and selects it", async () => {
    api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
    api.post.mockResolvedValueOnce({ data: { note: { _id: "new_note_123" } } });

    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByText("Meeting Notes")).toBeInTheDocument(),
    );

    const createBtn = screen.getAllByRole("button", {
      name: /Create note/i,
    })[0];
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes/create", {
        title: "",
        text: "",
      });
      expect(toast.success).toHaveBeenCalledWith("New Note Created");
    });
  });

  it("deletes a note successfully", async () => {
    api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
    api.delete.mockResolvedValueOnce({ data: {} });

    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByText("Meeting Notes")).toBeInTheDocument(),
    );

    // Because note_2 is newer (Sep 2 vs Sep 1), it renders FIRST in the UI!
    // Clicking the first trash icon will delete note_2.
    const trashIcons = screen.getAllByTestId("icon-trash");
    const firstTrashBtn = trashIcons[0].closest("button");

    fireEvent.click(firstTrashBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/notes/delete/note_2"); // Changed to note_2
      expect(toast.success).toHaveBeenCalledWith("Note Deleted");
    });
  });

  it("navigates to upload page when 'Upload File' is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { notes: [] } });

    renderWithProviders();

    const uploadBtn = screen.getAllByRole("button", {
      name: /Upload File/i,
    })[0];
    fireEvent.click(uploadBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/app/upload");
  });
});
