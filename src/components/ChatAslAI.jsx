// ChatAskAI.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import {
  Sparkles,
  Mic,
  FileText,
  Loader2,
  ThumbsUp,
  Wrench,
  Trash2,
} from "lucide-react";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllChats,
  addOlderChats,
  addOrUpdateChat,
  removeTempChat,
  removeChats,
} from "../../utils/chatSlice";
import { useChatsSync } from "../../hooks/useChatsSync";

function ChatAskAI({ setSelectedNoteId }) {
  useChatsSync();

  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chats || []);

  console.log(chats);

  const [question, setQuestion] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const chatContainerRef = useRef(null);
  const scrollStateRef = useRef({ height: 0, top: 0, isAdjusting: false });
  const isAutoScrollingRef = useRef(false);

  const { isListening, isSupported, startListening } = useVoiceInput(
    (transcript) => {
      setQuestion(transcript);
    },
  );

  const fetchChats = async (pageNumber, isLoadMore = false) => {
    try {
      if (isLoadMore) setIsFetchingMore(true);

      const response = await api.get(
        `/notes/ai/chats?page=${pageNumber}&limit=10`,
      );

      const { chat, totalPages } = response.data;
      const formattedChats = chat.reverse();

      if (isLoadMore) {
        if (chatContainerRef.current) {
          scrollStateRef.current = {
            height: chatContainerRef.current.scrollHeight,
            top: chatContainerRef.current.scrollTop,
            isAdjusting: true,
          };
        }

        dispatch(addOlderChats(formattedChats));
        setIsFetchingMore(false);
      } else {
        dispatch(setAllChats(formattedChats));
        setTimeout(scrollToBottom, 50);
      }

      setHasMore(pageNumber < totalPages);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to load chats!",
      );
      if (isLoadMore) setIsFetchingMore(false);
    } finally {
      setIsFetchingInitial(false);
    }
  };

  useEffect(() => {
    fetchChats(1, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (scrollStateRef.current.isAdjusting && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const heightDifference =
        container.scrollHeight - scrollStateRef.current.height;
      container.scrollTop = scrollStateRef.current.top + heightDifference;
      scrollStateRef.current.isAdjusting = false;
    }
  }, [chats]);

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !isFetchingMore && !isFetchingInitial) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchChats(nextPage, true);
    }
  };

  const scrollToBottom = () => {
    isAutoScrollingRef.current = true;
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 300);
    });
  };

  const handleAskAI = async () => {
    if (!question.trim() || isAiTyping) return;

    const userQuery = question.trim();
    setQuestion("");

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const optimisticChat = {
      _id: tempId,
      userQuery: userQuery,
      aiResponse: null,
      source: [],
      createdAt: new Date().toISOString(),
    };

    dispatch(addOrUpdateChat(optimisticChat));
    setIsAiTyping(true);
    scrollToBottom();

    try {
      const response = await api.post("/notes/ask-ai", {
        question: userQuery,
        chats: chats,
      });

      const data = response.data;

      const resolvedChat = {
        _id: data._id || tempId,
        userQuery: data.question || userQuery,
        aiResponse: data.answer || "No response received",
        source: data.source || [],
        actionTriggered: data.actionTriggered || false,
        actionTool: data.actionTool || null,
        actionDetails: data.actionDetails || null,
        createdAt: new Date().toISOString(),
      };

      dispatch(removeTempChat(tempId));
      dispatch(addOrUpdateChat(resolvedChat));

      scrollToBottom();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to get AI response",
      );
      dispatch(removeTempChat(tempId));
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const loadingToast = toast.loading("Deleting chat...");
    try {
      const response = await api.delete(`/notes/chat/delete/${chatId}`);

      toast.success(response.data.message || "Chat deleted successfully", {
        id: loadingToast,
      });

      dispatch(removeChats(chatId));
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete chat",
        { id: loadingToast },
      );
    }
  };

  const confirmDeleteChat = (chatId) => {
    toast(
      (t) => (
        <div className="flex min-w-[200px] flex-col gap-3">
          <span className="text-sm font-medium text-[#e6e4dd]">
            Delete this chat?
          </span>
          <p className="text-xs text-[#9297a1]">
            This action cannot be undone.
          </p>
          <div className="mt-1 flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-md bg-[#1e232c] px-3 py-1.5 text-xs font-medium text-[#9297a1] transition-colors hover:bg-[#2a303b] hover:text-[#e6e4dd]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleDeleteChat(chatId);
              }}
              className="rounded-md bg-[#ef4444] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#dc2626] active:scale-95"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        style: {
          background: "#12151a",
          border: "1px solid #2a303b",
          padding: "16px",
        },
      },
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#0d1117]">
      {/* ===== HEADER ===== */}
      <div className="z-10 flex flex-shrink-0 items-center justify-between border-b border-[#2a303b] bg-[#12151a] px-4 py-3 md:px-6 md:py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(215,166,59,0.14)] text-[#d7a63b]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-['Fraunces',serif] text-sm font-medium text-[#e6e4dd]">
              Ask AI
            </h2>
            <p className="font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.4px] text-[#565c66]">
              Powered by your notes
            </p>
          </div>
        </div>
      </div>

      {/* ===== MESSAGES AREA ===== */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 [overflow-anchor:none] md:p-6"
      >
        {isFetchingInitial ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#d7a63b]" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 md:px-6">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(215,166,59,0.1)] text-[#d7a63b]">
              <Sparkles size={28} />
            </div>
            <h2 className="mb-2 text-center font-['Fraunces',serif] text-xl font-medium text-[#e6e4dd] md:text-2xl">
              Ask anything about your notes
            </h2>
            <p className="max-w-md text-center text-sm leading-relaxed text-[#9297a1]">
              The AI searches through all your notes and gives you answers with
              direct references to the source material.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col space-y-8">
            {isFetchingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-[#565c66]" />
              </div>
            )}

            {chats.map((chat) => (
              <div key={chat._id} className="flex flex-col gap-6">
                {/* ===== User Message ===== */}
                <div className="group relative flex items-center justify-end gap-2">
                  <button
                    onClick={() => confirmDeleteChat(chat._id)}
                    title="Delete this chat"
                    className="pointer-events-none flex h-8 w-8 shrink-0 translate-x-2 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)] text-[#ef4444] opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 hover:bg-[#ef4444] hover:text-white active:scale-90"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-[#2a303b] bg-[#1e232c] px-4 py-3 shadow-sm transition-colors group-hover:border-[#3a414e] md:max-w-[80%] md:px-5 md:py-3.5">
                    <p className="text-[14px] leading-relaxed text-[#e6e4dd] md:text-[15px]">
                      {chat.userQuery}
                    </p>
                  </div>
                </div>

                {/* ===== AI Response ===== */}
                <div className="flex gap-2 md:gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#d7a63b]">
                    <Sparkles size={18} className="md:size-20" />
                  </div>
                  <div className="min-w-0 flex-1 max-w-[90%] md:max-w-[85%]">
                    {!chat.aiResponse ? (
                      <div className="flex w-fit items-center gap-1.5 rounded-[3px_14px_14px_14px] bg-[#ede7d8] px-4 py-3 md:px-5 md:py-4">
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#75695a]"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#75695a]"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#75695a]"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="rounded-[3px_14px_14px_14px] bg-[#ede7d8] px-4 py-3 shadow-[0_10px_26px_-14px_rgba(0,0,0,0.5)] md:px-5 md:py-4">
                          <p className="whitespace-pre-wrap font-['Inter',sans-serif] text-[14px] leading-[1.75] text-[#28241f] md:text-[15px]">
                            {chat.aiResponse}
                          </p>

                          {chat.aiResponse.includes("(Yes/No)") &&
                            !chat.actionTriggered && (
                              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[rgba(0,0,0,0.1)] pt-3">
                                <button
                                  onClick={() => {
                                    setQuestion("Yes, please do it.");
                                    setTimeout(handleAskAI, 100);
                                  }}
                                  className="rounded-lg bg-[#0c6b07] px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition-transform active:scale-95"
                                >
                                  Yes, Confirm
                                </button>
                                <button
                                  onClick={() => {
                                    setQuestion("No, cancel it.");
                                    setTimeout(handleAskAI, 100);
                                  }}
                                  className="rounded-lg bg-[#ef4444] px-4 py-1.5 text-[13px] font-medium text-white shadow-sm transition-transform active:scale-95"
                                >
                                  No, Cancel
                                </button>
                              </div>
                            )}
                        </div>

                        {(chat.actionTriggered ||
                          (chat.actionTool && chat.actionTool.length > 0)) && (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {chat.actionTriggered && (
                              <div className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.15)] px-2.5 py-1 text-[11.5px] font-semibold tracking-wide text-[#34d399]">
                                <ThumbsUp size={13} />
                                Action Executed
                              </div>
                            )}

                            {chat.actionTool &&
                              chat.actionTool.map((tool, index) => (
                                <div
                                  key={index}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-[rgba(215,166,59,0.2)] bg-[rgba(215,166,59,0.1)] px-2.5 py-1 text-[11px] font-medium text-[#d7a63b]"
                                >
                                  <Wrench size={13} />
                                  <span className="capitalize">
                                    {tool.replace(/_/g, " ")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}

                        {chat.source && chat.source.length > 0 && (
                          <div className="mt-4">
                            <details className="group overflow-hidden rounded-xl border border-[#2a303b] bg-[#171b22] transition-all">
                              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[10.5px] font-medium uppercase tracking-[0.5px] text-[#9297a1] transition-colors hover:bg-[#1e232c] hover:text-[#e6e4dd]">
                                <span className="flex items-center gap-2">
                                  <FileText size={16} />
                                  Sources ({chat.source.length})
                                </span>
                                <span className="transition-transform duration-200 group-open:rotate-180">
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                  >
                                    <path
                                      d="M6 9l6 6 6-6"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              </summary>
                              <div className="space-y-3 border-t border-[#2a303b] bg-[#12151a] p-3 md:p-4">
                                {chat.source.map((item) => (
                                  <div
                                    key={item._id}
                                    className="rounded-lg border border-[#2a303b] bg-[#1e232c] p-3 transition-colors hover:border-[#565c66] md:p-3.5"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <h4 className="max-w-[70%] truncate font-['Fraunces',serif] text-sm font-medium text-[#e6e4dd]">
                                        {item.title}
                                      </h4>
                                      <span className="shrink-0 rounded-full bg-[rgba(215,166,59,0.14)] px-2.5 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#d7a63b]">
                                        {(item.score * 100).toFixed(1)}% Match
                                      </span>
                                    </div>
                                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#9297a1]">
                                      {item.text}
                                    </p>
                                    <button
                                      className="mt-3 w-fit rounded-md border border-[#d7a63b] bg-transparent px-4 py-1.5 text-[11px] font-semibold text-[#d7a63b] transition-all hover:bg-[rgba(215,166,59,0.1)] active:scale-95"
                                      onClick={() =>
                                        setSelectedNoteId(item._id)
                                      }
                                    >
                                      Read Full Note
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== INPUT AREA ===== */}
      <div className="z-10 flex-shrink-0 border-t border-[#2a303b] bg-[#12151a] px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-[#2a303b] bg-[#1e232c] p-2 transition-all focus-within:border-[#7a818e] focus-within:ring-1 focus-within:ring-[#7a818e]">
          <textarea
            value={question}
            placeholder="Ask AI a question or command an action..."
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskAI();
              }
            }}
            rows={1}
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-[#e6e4dd] outline-none placeholder:text-[#565c66]"
            style={{ fieldSizing: "content" }}
          />

          {isSupported && (
            <button
              type="button"
              onClick={startListening}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                isListening
                  ? "animate-pulse bg-[rgba(215,166,59,0.2)] text-[#d7a63b]"
                  : "text-[#565c66] hover:text-[#e6e4dd]"
              }`}
              title="Ask by voice"
            >
              <Mic size={18} />
            </button>
          )}

          <button
            onClick={handleAskAI}
            disabled={isAiTyping || !question.trim()}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d7a63b] text-[#1a1305] shadow-[0_2px_10px_rgba(215,166,59,0.2)] transition-all hover:bg-[#e2b452] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-0.5 h-4 w-4"
            >
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.3px] text-[#565c66] md:text-[10.5px]">
          AI can read your notes and perform actions. Press Enter to send, Shift
          + Enter for new line.
        </p>
      </div>
    </div>
  );
}

export default ChatAskAI;
