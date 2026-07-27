import React, { useRef, useState, useLayoutEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import {
  Printer,
  Save,
  Calendar,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Paperclip,
} from "lucide-react";

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

  // Resize whenever the note's text actually changes — covers initial
  // load, switching between notes, and real-time sync updates, not just
  // local typing (which the onChange handler already covers).
  useLayoutEffect(() => {
    resizeTextarea();
  }, [data?.text, data?._id]);

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
            body { font-family: 'Inter', 'Segoe UI', sans-serif; padding: 40px; background: white; color: black; margin: 0; }
            .print-container { max-width: 800px; margin: 0 auto; }
            .print-title { font-family: 'Fraunces', serif; font-size: 32px; font-weight: bold; border-bottom: 2px solid #ccc; padding-bottom: 16px; margin-bottom: 24px; text-align: ${alignClass}; }
            .print-body { font-size: 16px; line-height: 1.6; white-space: pre-wrap; text-align: ${alignClass}; font-weight: ${fontWeight}; }
            @media print { body { margin: 0; padding: 20px; } }
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
    <div className="animate-[riseIn_0.35s_ease] py-3">
      {/* Paper card — vintage aged parchment, torn top & bottom, slight tilt */}
      <div className="relative mx-auto max-w-[720px] rotate-[-0.4deg]">
        {/* Paperclip pinned at the corner */}
        <div className="absolute -left-3 -top-3 z-10 rotate-[-28deg] text-[#9a9a9a] drop-shadow-[0_2px_2px_rgba(0,0,0,0.35)]">
          <Paperclip className="h-9 w-9" strokeWidth={1.6} />
        </div>

        {/* Torn top edge */}
        <svg
          className="block w-full"
          viewBox="0 0 720 14"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: 14, marginBottom: -1 }}
        >
          <polygon
            points="0,5 15,1 30,6 45,2 60,5 75,0 90,6 105,2 120,5 135,1 150,6 165,2 180,5 195,0 210,6 225,2 240,5 255,1 270,6 285,2 300,5 315,0 330,6 345,2 360,5 375,1 390,6 405,2 420,5 435,0 450,6 465,2 480,5 495,1 510,6 525,2 540,5 555,0 570,6 585,2 600,5 615,1 630,6 645,2 660,5 675,0 690,6 705,2 720,5 720,14 0,14"
            fill="#e8dcc0"
          />
        </svg>

        {/* Body */}
        <div
          className="relative overflow-hidden shadow-[0_24px_55px_-22px_rgba(0,0,0,0.6),0_2px_0_#c9b48c]"
          style={{
            background:
              "radial-gradient(ellipse 500px 300px at 15% 10%, rgba(180,150,100,0.18), transparent), radial-gradient(ellipse 400px 260px at 90% 95%, rgba(150,115,70,0.16), transparent), #e8dcc0",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
            }}
          />

          <div
            className="pointer-events-none absolute bottom-0 right-0 h-7 w-7"
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, #d8c69f 50%, #c2ac82 100%)",
              boxShadow: "-2px -2px 6px rgba(0,0,0,0.12)",
            }}
          />

          <div className="relative px-[52px] pb-[52px] pt-[30px]">
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-[20px] bg-[rgba(58,44,31,0.08)] px-[9px] py-1 font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.5px] text-[#7a6448]">
                <span className="h-[6px] w-[6px] rounded-full bg-[#4fa88f]" />
                Note : Save the document before leaving the application.
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[#7a6448] transition-colors hover:bg-[rgba(58,44,31,0.1)] hover:text-[#3a2c1f]"
                  title="Print / Download PDF"
                >
                  <Printer className="h-4 w-4" strokeWidth={1.6} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSaveNotes(data?._id, data?.title, data?.text)
                  }
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-[#7a6448] transition-colors hover:bg-[rgba(58,44,31,0.1)] hover:text-[#3a2c1f]"
                  title="Save note"
                >
                  <Save className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={data?.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Untitled note"
              className={`w-full bg-transparent font-['Fraunces',serif] text-[32px] font-semibold leading-[1.25] tracking-[-0.2px] text-[#3a2c1f] outline-none placeholder:text-[#7a6448]/60 ${alignClass}`}
            />

            <svg
              className="my-2.5 block"
              viewBox="0 0 160 10"
              width="160"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 6c8-6 14 4 22-2s14 4 22-2 14 4 22-2 14 4 22-2 14 4 22-2 14 4 22-2"
                stroke="#c98a2e"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>

            <div className="mb-6 flex flex-wrap gap-[18px] font-['IBM_Plex_Mono',monospace] text-[11px] text-[#7a6448]">
              <span className="flex items-center gap-[5px]">
                <Calendar className="h-3 w-3 opacity-70" strokeWidth={1.6} />
                {data?.updatedAt
                  ? new Date(data.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <span className="flex items-center gap-[5px]">
                <Type className="h-3 w-3 opacity-70" strokeWidth={1.6} />
                {(() => {
                  const words = (data?.text || "")
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length;
                  return words + (words === 1 ? " word" : " words");
                })()}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-[#c9b48c]/60 pb-3">
              <div className="flex items-center gap-1 rounded-md bg-[rgba(58,44,31,0.08)] p-1">
                <button
                  type="button"
                  onClick={() => setAlign("left")}
                  className={`flex items-center justify-center rounded p-1.5 transition-all ${
                    align === "left"
                      ? "bg-[#3a2c1f] text-[#e8dcc0]"
                      : "text-[#7a6448] hover:text-[#3a2c1f]"
                  }`}
                >
                  <AlignLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setAlign("center")}
                  className={`flex items-center justify-center rounded p-1.5 transition-all ${
                    align === "center"
                      ? "bg-[#3a2c1f] text-[#e8dcc0]"
                      : "text-[#7a6448] hover:text-[#3a2c1f]"
                  }`}
                >
                  <AlignCenter className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setAlign("right")}
                  className={`flex items-center justify-center rounded p-1.5 transition-all ${
                    align === "right"
                      ? "bg-[#3a2c1f] text-[#e8dcc0]"
                      : "text-[#7a6448] hover:text-[#3a2c1f]"
                  }`}
                >
                  <AlignRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsBold(!isBold)}
                className={`flex items-center justify-center rounded p-1.5 transition-all ${
                  isBold
                    ? "bg-[#3a2c1f] text-[#e8dcc0]"
                    : "bg-[rgba(58,44,31,0.08)] text-[#7a6448] hover:text-[#3a2c1f]"
                }`}
              >
                <Bold className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={data?.text || ""}
              onChange={(e) => {
                onChange({ text: e.target.value });
                resizeTextarea();
              }}
              placeholder="Start writing…"
              rows={1}
              className={`w-full resize-none overflow-hidden bg-transparent font-['Inter',sans-serif] text-[15.5px] leading-[1.75] text-[#3a2c1f] outline-none placeholder:text-[#7a6448]/60 ${alignClass} ${isBold ? "font-bold" : "font-normal"}`}
              style={{ minHeight: 120 }}
            />
          </div>
        </div>

        <svg
          className="block w-full"
          viewBox="0 0 720 14"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: 14, marginTop: -1, transform: "scaleY(-1)" }}
        >
          <polygon
            points="0,5 15,1 30,6 45,2 60,5 75,0 90,6 105,2 120,5 135,1 150,6 165,2 180,5 195,0 210,6 225,2 240,5 255,1 270,6 285,2 300,5 315,0 330,6 345,2 360,5 375,1 390,6 405,2 420,5 435,0 450,6 465,2 480,5 495,1 510,6 525,2 540,5 555,0 570,6 585,2 600,5 615,1 630,6 645,2 660,5 675,0 690,6 705,2 720,5 720,14 0,14"
            fill="#e8dcc0"
          />
        </svg>
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
