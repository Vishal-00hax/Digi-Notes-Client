import React from "react";
import { useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

function ChatAslAI({ setSelectedNoteId }) {
  const [qustion, setQustion] = useState("");
  const [aiResponse, setAIResponse] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    try {
      if (qustion === "") return;
      setLoading(true);
      const response = await api.post("/notes/ask-ai", { question: qustion });
      console.log("Response", response.data);
      setAIResponse(response.data);
      toast.success("AI Response");
    } catch (err) {
      const errText =
        err.response?.data?.message || err.message || "Something went wrong!";
      toast.error(errText);
    } finally {
      setLoading(false);
    }
  };

  const source = aiResponse.source;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-[#12151a]">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between border-b border-[#2a303b] bg-[#171b22] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(215,166,59,0.14)] text-[#d7a63b]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                fill="currentColor"
                opacity="0.2"
              />
              <path
                d="M12 6v6l4 2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
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
      <div className="flex-1 overflow-y-auto">
        {!aiResponse.answer ? (
          /* Empty State */
          <div className="flex h-full flex-col items-center justify-center px-6">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(215,166,59,0.1)] text-[#d7a63b]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
              >
                <path
                  d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                  fill="currentColor"
                  opacity="0.2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="mb-2 font-['Fraunces',serif] text-2xl font-medium text-[#e6e4dd]">
              Ask anything about your notes
            </h2>
            <p className="max-w-md text-center text-sm leading-relaxed text-[#9297a1]">
              The AI searches through all your notes and gives you answers with
              direct references to the source material.
            </p>
          </div>
        ) : (
          /* Chat Response */
          <div className="mx-auto max-w-3xl px-6 py-8">
            {/* User Message */}
            <div className="mb-6 flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e232c] px-5 py-3.5">
                <p className="text-[15px] leading-relaxed text-[#e6e4dd]">
                  {aiResponse.question}
                </p>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-3">
              <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(215,166,59,0.14)] text-[#d7a63b]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5"
                >
                  <path
                    d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap font-['Inter',sans-serif] text-[15px] leading-[1.75] text-[#9297a1]">
                  {aiResponse.answer}
                </p>

                {/* Sources */}
                {aiResponse?.source?.length > 0 && (
                  <div className="mt-5">
                    <details className="group rounded-xl border border-[#2a303b] bg-[#171b22]">
                      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[10.5px] font-medium uppercase tracking-[0.5px] text-[#9297a1] transition-colors hover:text-[#e6e4dd]">
                        <span className="flex items-center gap-2">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                          >
                            <path
                              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <polyline
                              points="14 2 14 8 20 8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Sources ({aiResponse.source.length})
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

                      <div className="space-y-3 border-t border-[#2a303b] p-4">
                        {source.map((item) => (
                          <div
                            key={item._id}
                            className="rounded-lg border border-[#2a303b] bg-[#12151a] p-3.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="truncate font-['Fraunces',serif] text-sm font-medium text-[#e6e4dd]">
                                {item.title}
                              </h4>
                              <span className="shrink-0 rounded-full bg-[rgba(215,166,59,0.14)] px-2.5 py-0.5 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#d7a63b]">
                                {(item.score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#565c66]">
                              {item.text}
                            </p>
                            <button
                              className="mt-2.5 rounded-md bg-[#d7a63b] px-4 py-1.5 text-[11px] font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#e2b452] active:translate-y-[1px]"
                              onClick={() => setSelectedNoteId(item._id)}
                            >
                              Visit Note
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="mt-6 flex gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(215,166,59,0.14)] text-[#d7a63b]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    <path
                      d="M12 6v6l4 2"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d7a63b]"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d7a63b]"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-[#d7a63b]"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== INPUT AREA ===== */}
      <div className="border-t border-[#2a303b] bg-[#171b22] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-[#2a303b] bg-[#1e232c] p-2 transition-all focus-within:border-[#565c66]">
          <input
            type="text"
            value={qustion}
            placeholder="Ask a question..."
            onChange={(e) => setQustion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAskAI();
              }
            }}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[#e6e4dd] outline-none placeholder:text-[#565c66]"
          />
          <button
            onClick={handleAskAI}
            disabled={loading || !qustion.trim()}
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d7a63b] text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#e2b452] active:translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="31.42 31.42"
                  strokeDashoffset="10"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="mt-2 text-center font-['IBM_Plex_Mono',monospace] text-[10px] tracking-[0.3px] text-[#565c66]">
          AI responses are based on your notes. Press Enter to send.
        </p>
      </div>
    </div>
  );
}

export default ChatAslAI;
