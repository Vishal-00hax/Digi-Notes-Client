import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ChatAskAI from "../src/components/ChatAskAI";
import chatReducer from "../utils/chatSlice";

// 1. Mock External Dependencies
import api from "../utils/axios";
import toast from "react-hot-toast";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useChatsSync } from "../hooks/useChatsSync";

jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

// Simplify the toast mock. We will manually render the toast UI in the test.
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn().mockReturnValue("loading-toast"),
    dismiss: jest.fn(),
  }),
}));

// Mock Custom Hooks
jest.mock("../hooks/useVoiceInput", () => ({
  useVoiceInput: jest.fn(),
}));

jest.mock("../hooks/useChatsSync", () => ({
  useChatsSync: jest.fn(),
}));

// Mock Lucide Icons
jest.mock("lucide-react", () => ({
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Mic: () => <div data-testid="icon-mic" />,
  FileText: () => <div data-testid="icon-filetext" />,
  Loader2: () => <div data-testid="icon-loader" />,
  ThumbsUp: () => <div data-testid="icon-thumbsup" />,
  Wrench: () => <div data-testid="icon-wrench" />,
  Trash2: () => <div data-testid="icon-trash" />,
}));

// 2. Setup Helper Function
const renderWithProviders = (initialChats = []) => {
  const store = configureStore({
    reducer: { chats: chatReducer },
    preloadedState: { chats: initialChats },
  });

  const setSelectedNoteId = jest.fn();

  return {
    ...render(
      <Provider store={store}>
        <ChatAskAI setSelectedNoteId={setSelectedNoteId} />
      </Provider>,
    ),
    store,
    setSelectedNoteId,
  };
};

describe("ChatAskAI Component", () => {
  beforeAll(() => {
    // Mock DOM features not available in JSDOM
    window.HTMLElement.prototype.scrollTo = jest.fn();
    window.requestAnimationFrame = jest.fn((cb) => cb());
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Silence console logs during tests to keep terminal clean
    jest.spyOn(console, "log").mockImplementation(() => {});

    // Default hook implementations
    useChatsSync.mockImplementation(() => {});
    useVoiceInput.mockImplementation((onResult) => ({
      isListening: false,
      isSupported: true,
      startListening: jest.fn(),
    }));
  });

  it("fetches chats on mount and displays empty state if no chats exist", async () => {
    api.get.mockResolvedValueOnce({
      data: { chat: [], totalPages: 1 },
    });

    renderWithProviders();

    expect(api.get).toHaveBeenCalledWith("/notes/ai/chats?page=1&limit=10");

    await waitFor(() => {
      expect(
        screen.getByText("Ask anything about your notes"),
      ).toBeInTheDocument();
    });
  });

  it("fetches and displays existing chats", async () => {
    const mockChats = [
      {
        _id: "chat_1",
        userQuery: "What is React?",
        aiResponse: "React is a JavaScript library.",
      },
    ];

    api.get.mockResolvedValueOnce({
      data: { chat: mockChats, totalPages: 1 },
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText("What is React?")).toBeInTheDocument();
      expect(
        screen.getByText("React is a JavaScript library."),
      ).toBeInTheDocument();
    });
  });

  it("allows the user to type a question and submit it to the AI", async () => {
    api.get.mockResolvedValueOnce({ data: { chat: [], totalPages: 1 } });
    api.post.mockResolvedValueOnce({
      data: {
        _id: "new_chat_1",
        question: "How do I test React?",
        answer: "You can use Jest and React Testing Library.",
        source: [],
      },
    });

    renderWithProviders();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText(/Ask AI a question/i),
      ).toBeInTheDocument(),
    );

    const input = screen.getByPlaceholderText(/Ask AI a question/i);
    fireEvent.change(input, { target: { value: "How do I test React?" } });

    // Get all buttons and click the last one (which is the Send button)
    const buttons = screen.getAllByRole("button");
    const sendBtn = buttons[buttons.length - 1];
    fireEvent.click(sendBtn);

    expect(input.value).toBe("");
    expect(screen.getByText("How do I test React?")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/notes/ask-ai", {
        question: "How do I test React?",
        chats: [],
      });
      expect(
        screen.getByText("You can use Jest and React Testing Library."),
      ).toBeInTheDocument();
    });
  });

  it("triggers voice input when the microphone button is clicked", async () => {
    api.get.mockResolvedValueOnce({ data: { chat: [], totalPages: 1 } });
    const mockStartListening = jest.fn();

    useVoiceInput.mockImplementation(() => ({
      isListening: false,
      isSupported: true,
      startListening: mockStartListening,
    }));

    renderWithProviders();
    await waitFor(() =>
      expect(screen.getByTitle("Ask by voice")).toBeInTheDocument(),
    );

    const micBtn = screen.getByTitle("Ask by voice");
    fireEvent.click(micBtn);

    expect(mockStartListening).toHaveBeenCalled();
  });

  it("deletes a chat successfully", async () => {
    const mockChats = [
      { _id: "chat_1", userQuery: "Delete me", aiResponse: "Sure." },
    ];

    api.get.mockResolvedValueOnce({ data: { chat: mockChats, totalPages: 1 } });
    api.delete.mockResolvedValueOnce({ data: { message: "Chat deleted" } });

    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByText("Delete me")).toBeInTheDocument(),
    );

    // Click the hidden trash icon
    const trashBtn = screen.getByTitle("Delete this chat");
    fireEvent.click(trashBtn);

    // Grab the JSX that was passed to toast() and force it to render into our test DOM
    const toastJSX = toast.mock.calls[0][0];
    render(toastJSX({ id: "mock-toast" }));

    // Now Testing Library can see the "Delete" button inside the toast
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/notes/chat/delete/chat_1");
      expect(toast.success).toHaveBeenCalledWith("Chat deleted", {
        id: "loading-toast",
      });
      expect(screen.queryByText("Delete me")).not.toBeInTheDocument();
    });
  });

  it("handles API failure gracefully during AI request", async () => {
    api.get.mockResolvedValueOnce({ data: { chat: [], totalPages: 1 } });
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    renderWithProviders();
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText(/Ask AI a question/i),
      ).toBeInTheDocument(),
    );

    const input = screen.getByPlaceholderText(/Ask AI a question/i);
    fireEvent.change(input, { target: { value: "Hello?" } });

    // Click the send button instead of pressing Enter
    const buttons = screen.getAllByRole("button");
    const sendBtn = buttons[buttons.length - 1];
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network Error");
      expect(screen.queryByText("Hello?")).not.toBeInTheDocument();
    });
  });
});
