import React, { useState, useEffect } from "react";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import EditNotesForm from "./EditNotesForm";
import NotesContentForm from "./NotesContentForm";
import { useNotesSync } from "../../utils/useNotesSync";
import { useSingleNoteSync } from "../../utils/useSingleNoteSync";

const displayFont = { fontFamily: "'Instrument Serif', serif" };

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
  const filterdNotes = notes.filter((not) =>
    (not.title || "").toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="min-h-screen w-full bg-background px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-start">
        {/* LEFT — Notes List */}
        <aside className="flex w-full flex-col gap-4 md:max-w-xs">
          <button
            type="button"
            onClick={handleCreateNotes}
            className="liquid-glass w-full rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.02]"
          >
            + Create New Note
          </button>

          <div className="liquid-glass flex w-full items-center rounded-full px-6 py-1 transition-all duration-300 hover:scale-[1.02] focus-within:ring-1 focus-within:ring-foreground/30">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search Note..."
              className="w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none border-none"
            />
          </div>

          {filterdNotes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {filterdNotes
                .slice() //.slice() creates a shallow copy, ensuring you sort a fresh array
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((not) => (
                  <div
                    key={not._id}
                    onClick={() => setSelectedNoteId(not._id)}
                    className={`liquid-glass group relative cursor-pointer rounded-2xl px-4 py-3 transition-transform duration-300 hover:scale-[1.01] ${
                      selectedNoteId === not._id
                        ? "ring-1 ring-foreground/30"
                        : ""
                    }`}
                  >
                    <p
                      className="truncate pr-14 text-base text-foreground"
                      style={displayFont}
                    >
                      {not.title || "Untitled Note"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dayjs(not.updatedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>

                    <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingNoteId(not._id);
                        }}
                        className="rounded-full px-2 py-1 text-[11px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(not._id);
                        }}
                        className="rounded-full px-2 py-1 text-[11px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
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
                ))}
            </div>
          ) : (
            <div className="liquid-glass rounded-2xl px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground">
                {searchText ? "No matching notes found" : "No notes yet"}
              </p>
            </div>
          )}
        </aside>

        {/* RIGHT — Selected Note Content */}
        <section className="liquid-glass w-full flex-1 rounded-3xl px-6 py-8 sm:px-8">
          {selectedNote ? (
            <NotesContentForm data={selectedNote} onChange={handleNoteChange} />
          ) : (
            <div className="flex h-full min-h-300px flex-col items-center justify-center text-center">
              <p className="text-lg text-foreground" style={displayFont}>
                {loadingNote
                  ? "Loading note…"
                  : "Select a note to view it here"}
              </p>
              {!loadingNote && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Or create a new one to get started.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default DashboardScreen;
