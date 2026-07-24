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

  // Handle save to backend
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

    // Build a clean HTML document for printing
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
              font-family: 'Instrument Serif', serif;
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
    // Wait for content to render then print
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
    <div className="flex flex-col gap-4">
      {/* 1. SCREEN VIEW – normal editing */}
      <div className="flex flex-col items-center">
        <div className="liquid-glass flex w-full max-w-212.5 min-h-100 flex-col justify-between rounded-3xl p-6 sm:p-10 shadow-2xl transition-all duration-300">
          {/* Formatting Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-border/20 pb-4 text-xs">
            <div className="flex items-center gap-1 rounded-full bg-foreground/5 p-1">
              <span className="px-2 text-muted-foreground">Alignment:</span>
              {["left", "center", "right"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAlign(option)}
                  className={`rounded-full px-3 py-1 capitalize transition-all ${
                    align === option
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-full bg-foreground/5 p-1">
              <button
                type="button"
                onClick={() => setIsBold(!isBold)}
                className={`rounded-full px-3 py-1 font-bold transition-all ${
                  isBold
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                B
              </button>
            </div>
          </div>

          {/* Editable fields */}
          <div className="flex flex-col gap-6">
            <input
              type="text"
              value={data?.title || ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Untitled Document"
              className={`w-full bg-transparent border-b border-border/40 pb-3 text-3xl sm:text-4xl text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-foreground/60 ${alignClass}`}
              style={{ fontFamily: "'Instrument Serif', serif" }}
            />
            <textarea
              ref={textareaRef}
              value={data?.text || ""}
              onChange={(e) => {
                onChange({ text: e.target.value });
                resizeTextarea();
              }}
              placeholder="Start typing your note here…"
              rows={4}
              className={`w-full resize-none bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground/60 leading-relaxed outline-none overflow-hidden border-none ${alignClass} ${
                isBold ? "font-bold" : "font-normal"
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/30 pt-4">
            <span className="text-xs text-muted-foreground">
              Dynamic Document View
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-full border border-border/60 bg-transparent px-6 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:scale-[1.03] hover:bg-foreground/10 hover:shadow-lg"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSaveNotes(data?._id, data?.title, data?.text)
                }
                className="liquid-glass rounded-full px-8 py-2.5 text-sm font-medium text-foreground transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesContentForm;
