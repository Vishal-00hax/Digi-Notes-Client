import React from "react";
import { useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

function EditNotesForm({ notesId, title, onClose }) {
  const [newTitle, setNewTitle] = useState(title);

  const handleTitleUpdate = async () => {
    try {
      const response = await api.patch("/notes/update", {
        notesId: notesId,
        title: newTitle,
      });
      toast.success("Title Updated");
      onClose?.();
    } catch (err) {
      const errText =
        err.response?.message || err.response || "Something went wrong";
      toast.error(errText);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151a]/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-[riseIn_0.35s_ease] rounded-2xl border border-[#2a303b] bg-[#1e232c] px-8 py-8 shadow-2xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-['Fraunces',serif] text-2xl text-[#e6e4dd]">
            Update Title
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#9297a1] transition-colors hover:text-[#e6e4dd]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 2L14 14M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="note-title" className="text-xs text-[#9297a1]">
            Title
          </label>
          <input
            id="note-title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full rounded-xl border border-[#2a303b] bg-[#171b22] px-4 py-3 text-sm text-[#e6e4dd] outline-none transition-colors placeholder:text-[#565c66] focus:border-[#d7a63b]/40"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm text-[#9297a1] transition-colors hover:text-[#e6e4dd]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTitleUpdate}
            className="rounded-lg bg-[#d7a63b] px-6 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all hover:bg-[#e2b452] active:translate-y-[1px]"
          >
            Update Title
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default EditNotesForm;
