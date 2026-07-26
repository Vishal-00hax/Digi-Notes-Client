import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import EditNotesForm from "./EditNotesForm";
import NotesContentForm from "./NotesContentForm";
import { useNotesSync } from "../../utils/useNotesSync";
import { useSingleNoteSync } from "../../utils/useSingleNoteSync";
import ChatAslAI from "./ChatAslAI";

function DashboardScreen() {
  const [notes, setNotes] = useState([]);
  const [isEditingNoteId, setIsEditingNoteId] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loadingNote, setLoadingNote] = useState(false);
  const [searchText, setSearchText] = useState("");

  const getUserNotes = async () => {
    try {
      const response = await api.get("/notes/user");
      setNotes(response.data.notes);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getUserNotes();
  }, []);

  // Real-time data syncing
  useNotesSync(setNotes);
  useSingleNoteSync(selectedNoteId, setSelectedNote);

  // Fetch full note whenever selection changes
  useEffect(() => {
    if (!selectedNoteId) {
      setSelectedNote(null);
      return;
    }
    const getNoteDetails = async () => {
      setLoadingNote(true);
      try {
        const response = await api.get(`/notes/get/${selectedNoteId}`);
        setSelectedNote(response.data.note);
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoadingNote(false);
      }
    };
    getNoteDetails();
  }, [selectedNoteId]);

  const handleCreateNotes = async () => {
    try {
      const response = await api.post("/notes/create");
      toast.success("New Note Created");
      if (response.data?.note?._id) {
        setSelectedNoteId(response.data.note._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (notesId) => {
    try {
      await api.delete(`/notes/delete/${notesId}`);
      toast.success("Note Deleted");
      if (selectedNoteId === notesId) setSelectedNoteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleNoteChange = (changes) => {
    setSelectedNote((prev) => ({ ...prev, ...changes }));
  };

  // Case-insensitive & partial search matching
  const filteredNotes = notes
    .filter(
      (not) =>
        (not.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (not.text || "").toLowerCase().includes(searchText.toLowerCase()),
    )
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const formatDate = (date) => dayjs(date).format("MMM D, YYYY");

  const snippet = (text) => {
    if (!text) return "";
    return text.replace(/\n/g, " ").slice(0, 64);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#12151a] text-[#e6e4dd]">
      {/* ===== SIDEBAR ===== */}
      <aside className="flex w-[340px] min-w-[340px] flex-col border-r border-[#2a303b] bg-[#171b22]">
        {/* Create Button */}
        <div className="px-5 pb-4 mt-5">
          <button
            type="button"
            onClick={handleCreateNotes}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7a63b] px-4 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-[#e2b452] active:translate-y-[1px]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
            >
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            Create note
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3.5">
          <div className="flex items-center gap-2 rounded-lg border border-[#2a303b] bg-[#1e232c] px-2.5 py-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-[15px] w-[15px] shrink-0 text-[#565c66]"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search your notes…"
              className="w-full bg-transparent text-[13.5px] text-[#e6e4dd] outline-none placeholder:text-[#565c66]"
            />
          </div>
        </div>

        {/* List Meta */}
        <div className="flex items-baseline justify-between px-[22px] pb-2 pt-1.5 font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.6px] text-[#565c66]">
          <span>
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "note" : "notes"}
          </span>
          <span>Recent first</span>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2.5 pb-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((not) => (
              <div
                key={not._id}
                onClick={() => setSelectedNoteId(not._id)}
                className={`group relative flex cursor-pointer gap-3 rounded-lg px-4 py-3 transition-colors duration-150 ${
                  selectedNoteId === not._id
                    ? "bg-[#1e232c]"
                    : "hover:bg-[#262c37]"
                }`}
              >
                {selectedNoteId === not._id && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#d7a63b]" />
                )}
                <div className="mt-0.5 h-full w-[4px] shrink-0 rounded bg-[#4fa88f]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-['Fraunces',serif] text-[14.5px] font-medium text-[#e6e4dd]">
                      {not.title || "Untitled note"}
                    </p>
                    <span className="shrink-0 font-['IBM_Plex_Mono',monospace] text-[10px] text-[#565c66]">
                      {formatDate(not.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-[3px] truncate text-[12.5px] text-[#9297a1]">
                    {not.text ? snippet(not.text) : "No preview"}
                  </p>
                </div>

                {/* Hover Actions */}
                <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingNoteId(not._id);
                    }}
                    className="rounded px-2 py-1 text-[11px] text-[#9297a1] transition-colors hover:text-[#e6e4dd]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(not._id);
                    }}
                    className="rounded px-2 py-1 text-[11px] text-[#9297a1] transition-colors hover:text-[#a1493a]"
                  >
                    Delete
                  </button>
                </div>

                {isEditingNoteId === not._id && (
                  <EditNotesForm
                    notesId={not._id}
                    title={not.title}
                    onClose={() => setIsEditingNoteId(null)}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-[13px] text-[#565c66]">
              {searchText ? `No notes match "${searchText}".` : "No notes yet"}
            </div>
          )}
        </div>
      </aside>

      {/* ===== MAIN / READING PANE ===== */}
      <main
        className="relative flex flex-1 flex-col items-center overflow-y-auto"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 75% -10%, rgba(215,166,59,0.05), transparent), #12151a",
        }}
      >
        <div className="w-full max-w-[720px] px-10 py-12">
          {selectedNote ? (
            <NotesContentForm data={selectedNote} onChange={handleNoteChange} />
          ) : (
            <div className="mx-auto my-auto flex max-w-[340px] flex-col items-center text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-[52px] w-[52px] text-[#d7a63b] opacity-85"
              >
                <path
                  d="M4 20L14.5 9.5M14.5 9.5L18 6a1.5 1.5 0 0 0-3-3L11.5 6.5M14.5 9.5 11.5 6.5M4 20l1.2-4.2L11.5 9.6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h2 className="mb-2 font-['Fraunces',serif] text-[21px] font-medium text-[#e6e4dd]">
                Nothing selected yet
              </h2>
              <ChatAslAI setSelectedNoteId={setSelectedNoteId} />
              <p className="text-[13.5px] leading-relaxed text-[#9297a1] mt-5">
                Pick a note from the list on the left, or start a fresh page.
              </p>
              <button
                type="button"
                onClick={handleCreateNotes}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#d7a63b] px-5 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-[#e2b452] active:translate-y-[1px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
                Create note
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default DashboardScreen;
