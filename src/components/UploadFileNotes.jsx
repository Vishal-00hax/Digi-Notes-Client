import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FileUp, X, Loader2 } from "lucide-react";

// ✅ PDF.js ko browser me kaam karne ke liye worker chahiye
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const SUPPORTED_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

// ✅ PDF/DOCX extraction se aane wale invalid/control characters hataata hai
const sanitizeText = (text) => {
  return text
    .replace(/[\uD800-\uDFFF]/g, "") // lone surrogate pairs (PDF.js ka common issue)
    .replace(/\u0000/g, "") // null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // control characters
    .replace(/[ \t]+/g, " ") // multiple spaces/tabs ko single space
    .replace(/\n{3,}/g, "\n\n") // 3+ consecutive newlines ko 2 tak limit karo
    .trim();
};

function UploadFileNotes() {
  const [title, setTitle] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // ===== PDF se text extrect =====
  const extractFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }
    return fullText.trim();
  };

  // ===== Word (.docx) se text extrect =====
  const extractFromDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  };

  // ===== Plain .txt se text extrect =====
  const extractFromTxt = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = SUPPORTED_TYPES[file.type];

    if (!fileType) {
      toast.error(
        "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
      );
      e.target.value = ""; // input reset
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);

    try {
      let text = "";
      if (fileType === "pdf") {
        text = await extractFromPdf(file);
      } else if (fileType === "docx") {
        text = await extractFromDocx(file);
      } else if (fileType === "txt") {
        text = await extractFromTxt(file);
      }

      const cleanedText = sanitizeText(text); // ✅ extraction ke turant baad hi clean kar do

      if (!cleanedText) {
        toast.error("Could not extract any readable text from this file.");
      } else {
        setExtractedText(cleanedText);
        // ✅ Agar title khaali hai, file naam se auto-fill kar do (extension hataakar)
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
        toast.success("Text extracted successfully");
      }
    } catch (err) {
      console.error("Extraction error:", err);
      toast.error("Failed to extract text from this file.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClearFile = () => {
    setFileName("");
    setExtractedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveNote = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const cleanedText = sanitizeText(extractedText); // ✅ safety net — dobara clean karke bhejo

    if (!cleanedText) {
      toast.error("No content to save. Please upload a file first.");
      return;
    }

    setIsSaving(true);
    try {
      // ✅ Sirf ek hi API call — create hi title/text le lega
      await api.post("/notes/create", {
        title: title.trim(),
        text: cleanedText,
      });

      toast.success("Note created from file");
      navigate("/app");
    } catch (err) {
      const errText =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errText);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12151a] px-6 py-12 text-[#e6e4dd] sm:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-['Fraunces',serif] text-2xl font-medium text-[#e6e4dd]">
          Upload File as Note
        </h1>
        <p className="mb-8 text-sm text-[#9297a1]">
          Upload a PDF, Word, or text file & we'll extract the content and
          create a note automatically.
        </p>

        {/* ===== Title Input ===== */}
        <div className="mb-6 flex flex-col gap-1.5">
          <label className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.5px] text-[#565c66]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="rounded-lg border border-[#2a303b] bg-[#1e232c] px-4 py-3 text-sm text-[#e6e4dd] outline-none transition-colors focus:border-[#565c66]"
          />
        </div>

        {/* ===== File Upload Area ===== */}
        <div className="mb-6">
          <label className="mb-1.5 block font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.5px] text-[#565c66]">
            File
          </label>

          {!fileName ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a303b] bg-[#171b22] px-6 py-12 text-center transition-colors hover:border-[#565c66]">
              <FileUp className="h-8 w-8 text-[#d7a63b]" />
              <div>
                <p className="text-sm text-[#e6e4dd]">
                  Click to upload, or drag and drop
                </p>
                <p className="mt-1 text-xs text-[#565c66]">
                  PDF, DOCX, or TXT files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-[#2a303b] bg-[#171b22] px-4 py-3">
              <div className="flex items-center gap-3">
                <FileUp className="h-4 w-4 shrink-0 text-[#d7a63b]" />
                <span className="truncate text-sm text-[#e6e4dd]">
                  {fileName}
                </span>
                {isExtracting && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#565c66]" />
                )}
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="shrink-0 rounded p-1 text-[#565c66] transition-colors hover:text-[#e6e4dd]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ===== Extracted Text Preview (editable) ===== */}
        {extractedText && !isExtracting && (
          <div className="mb-8 flex flex-col gap-1.5">
            <label className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.5px] text-[#565c66]">
              Extracted Content (you can edit before saving)
            </label>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows={12}
              className="resize-none rounded-lg border border-[#2a303b] bg-[#1e232c] px-4 py-3 text-sm leading-relaxed text-[#e6e4dd] outline-none transition-colors focus:border-[#565c66]"
            />
          </div>
        )}

        {/* ===== Save Button ===== */}
        <button
          type="button"
          onClick={handleSaveNote}
          disabled={isSaving || isExtracting || !extractedText}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#d7a63b] px-6 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-[#e2b452] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save as Note"
          )}
        </button>
      </div>
    </div>
  );
}

export default UploadFileNotes;
