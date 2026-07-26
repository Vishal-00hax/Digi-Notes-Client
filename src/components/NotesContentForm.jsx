import React, { useRef, useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";

function NotesContentForm({ data, onChange }) {
  const textareaRef = useRef(null);
  const [align, setAlign] = useState("left");
  const [isBold, setIsBold] = useState(false);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSaveNotes = async (notesId, title, text) => {
    try {
      await api.patch("/notes/update", { notesId, title, text });
      toast.success("Note Saved");
    } catch (err) {
      const errText =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errText);
    }
  };

  // ------------------------------------------------------------
  // 🛡️ BULLETPROOF PRINT: open a new window with ONLY the note
  // ------------------------------------------------------------
  const handlePrint = () => {
    const title = data?.title || "Untitled Document";
    const text = data?.text || "";
    const alignClass =
      align === "center" ? "center" : align === "right" ? "right" : "left";
    const fontWeight = isBold ? "bold" : "normal";

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Print Note</title>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', sans-serif;
              padding: 40px;
              background: white;
              color: black;
              margin: 0;
            }
            .print-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .print-title {
              font-family: 'Fraunces', serif;
              font-size: 32px;
              font-weight: bold;
              border-bottom: 2px solid #ccc;
              padding-bottom: 16px;
              margin-bottom: 24px;
              text-align: ${alignClass};
            }
            .print-body {
              font-size: 16px;
              line-height: 1.6;
              white-space: pre-wrap;
              text-align: ${alignClass};
              font-weight: ${fontWeight};
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1 class="print-title">${title}</h1>
            <div class="print-body">${text}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
        ? "text-right"
        : "text-left";

  return (
    <div className="animate-[riseIn_0.35s_ease]">
      {/* Torn edge SVG */}
      <svg
        className="block w-full"
        viewBox="0 0 720 14"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: 14, marginBottom: -14 }}
      >
        <polygon
          points="0,5 15,1 30,6 45,2 60,5 75,0 90,6 105,2 120,5 135,1 150,6 165,2 180,5 195,0 210,6 225,2 240,5 255,1 270,6 285,2 300,5 315,0 330,6 345,2 360,5 375,1 390,6 405,2 420,5 435,0 450,6 465,2 480,5 495,1 510,6 525,2 540,5 555,0 570,6 585,2 600,5 615,1 630,6 645,2 660,5 675,0 690,6 705,2 720,5 720,14 0,14"
          fill="#ede7d8"
        />
      </svg>

      {/* Paper Card */}
      <div className="rounded-b-[10px] bg-[#ede7d8] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.55),0_2px_0_#ddd4bc]">
        <div className="px-[52px] pb-[52px] pt-[34px]">
          {/* Topline */}
          <div className="mb-5 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-[20px] bg-[rgba(40,36,31,0.06)] px-[9px] py-1 font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.5px] text-[#75695a]">
              <span className="h-[6px] w-[6px] rounded-full bg-[#4fa88f]" />
              Note : Save the document befor leaving the application.
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[#75695a] transition-colors hover:bg-[rgba(40,36,31,0.08)] hover:text-[#28241f]"
                title="Print / Download PDF"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="6"
                    y="14"
                    width="12"
                    height="8"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSaveNotes(data?._id, data?.title, data?.text)
                }
                className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[#75695a] transition-colors hover:bg-[rgba(40,36,31,0.08)] hover:text-[#28241f]"
                title="Save note"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="17 21 17 13 7 13 7 21"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="7 3 7 8 15 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={data?.title || ""}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Untitled note"
            className={`w-full bg-transparent font-['Fraunces',serif] text-[32px] font-semibold leading-[1.25] tracking-[-0.2px] text-[#28241f] outline-none placeholder:text-[#75695a]/60 ${alignClass}`}
          />

          {/* Squiggle */}
          <svg
            className="my-2.5 block"
            viewBox="0 0 160 10"
            width="160"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 6c8-6 14 4 22-2s14 4 22-2 14 4 22-2 14 4 22-2 14 4 22-2 14 4 22-2"
              stroke="#d7a63b"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Meta */}
          <div className="mb-6 flex flex-wrap gap-[18px] font-['IBM_Plex_Mono',monospace] text-[11px] text-[#75695a]">
            <span className="flex items-center gap-[5px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 opacity-70"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M3 10h18M8 3v4M16 3v4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {data?.updatedAt
                ? new Date(data.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <span className="flex items-center gap-[5px]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 opacity-70"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {(() => {
                const words = (data?.text || "")
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;
                return words + (words === 1 ? " word" : " words");
              })()}
            </span>
          </div>

          {/* Formatting Toolbar */}
          <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[#ddd4bc]/60 pb-3">
            <div className="flex items-center gap-1 rounded-md bg-[rgba(40,36,31,0.06)] p-1">
              {["left", "center", "right"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAlign(option)}
                  className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                    align === option
                      ? "bg-[#28241f] text-[#ede7d8]"
                      : "text-[#75695a] hover:text-[#28241f]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsBold(!isBold)}
              className={`rounded px-3 py-1 text-[11px] font-bold transition-all ${
                isBold
                  ? "bg-[#28241f] text-[#ede7d8]"
                  : "bg-[rgba(40,36,31,0.06)] text-[#75695a] hover:text-[#28241f]"
              }`}
            >
              B
            </button>
          </div>

          {/* Body */}
          <textarea
            ref={textareaRef}
            value={data?.text || ""}
            onChange={(e) => {
              onChange({ text: e.target.value });
              resizeTextarea();
            }}
            placeholder="Start writing…"
            rows={1}
            className={`w-full resize-none overflow-hidden bg-transparent font-['Inter',sans-serif] text-[15.5px] leading-[1.75] text-[#28241f] outline-none placeholder:text-[#75695a]/60 ${alignClass} ${isBold ? "font-bold" : "font-normal"}`}
            style={{ minHeight: 120 }}
          />
        </div>
      </div>

      <style>{`
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default NotesContentForm;
