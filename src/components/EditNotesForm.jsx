import React from "react";
import { useState } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

function EditNotesForm({ notesId, title, onClose }) {
  console.log("Note ID & Title", notesId, title);

  const [newTitle, setNewTitle] = useState(title);

  const handleTitleUpdate = async () => {
    try {
      const response = await api.patch("/notes/update", {
        notesId: notesId,
        title: newTitle,
      });
      toast.success("Title Update");
      onClose?.();
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong";
      toast.error(errText);
    }
  };

  const displayFont = { fontFamily: "'Instrument Serif', serif" };

  const inputClasses =
    "w-full rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-300 focus:border-foreground/40";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="liquid-glass animate-fade-rise w-full max-w-sm rounded-3xl px-8 py-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl text-foreground" style={displayFont}>
            Update Title
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors duration-300 hover:text-foreground"
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="note-title" className="text-xs text-muted-foreground">
            Title
          </label>
          <input
            id="note-title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className={inputClasses}
            autoFocus
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTitleUpdate}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
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
