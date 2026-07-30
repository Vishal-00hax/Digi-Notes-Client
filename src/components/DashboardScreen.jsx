import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../../utils/axios";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import EditNotesForm from "./EditNotesForm";
import NotesContentForm from "./NotesContentForm";
import { useNotesSync } from "../../hooks/useNotesSync";
import ChatAslAI from "./ChatAslAI";
import {
  Plus,
  BotMessageSquare,
  Search,
  SquarePen,
  Trash2,
  Mic,
} from "lucide-react";
import {
  setNotes,
  setSelectedNoteId,
  setSelectedNote,
  setLoadingNote,
  patchSelectedNote,
} from "../../utils/notesSlice";
import { useVoiceInput } from "../../hooks/useVoiceInput";

function DashboardScreen() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.items);
  const selectedNoteId = useSelector((state) => state.notes.selectedNoteId);
  const selectedNote = useSelector((state) => state.notes.selectedNote);
  const loadingNote = useSelector((state) => state.notes.loadingNote);

  const [isEditingNoteId, setIsEditingNoteId] = useState(null);
  const [searchText, setSearchText] = useState("");

  const { isListening, isSupported, startListening } = useVoiceInput(
    (transcript) => {
      setSearchText(transcript);
    },
  );

  const getUserNotes = async () => {
    try {
      const response = await api.get("/notes/user");
      dispatch(setNotes(response.data.notes));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getUserNotes();
  }, []);

  // ab sirf ek hi sync hook — poora Redux store real-time rehta hai
  useNotesSync();

  useEffect(() => {
    if (!selectedNoteId) {
      dispatch(setSelectedNote(null));
      return;
    }
    const getNoteDetails = async () => {
      dispatch(setLoadingNote(true));
      try {
        const response = await api.get(`/notes/get/${selectedNoteId}`);
        dispatch(setSelectedNote(response.data.note));
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        dispatch(setLoadingNote(false));
      }
    };
    getNoteDetails();
  }, [selectedNoteId, dispatch]);

  const handleCreateNotes = async () => {
    try {
      const response = await api.post("/notes/create");
      toast.success("New Note Created");
      if (response.data?.note?._id) {
        dispatch(setSelectedNoteId(response.data.note._id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (notesId) => {
    try {
      await api.delete(`/notes/delete/${notesId}`);
      toast.success("Note Deleted");
      if (selectedNoteId === notesId) dispatch(setSelectedNoteId(null));
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleNoteChange = (changes) => {
    dispatch(patchSelectedNote(changes));
  };

  const handleIsAskAi = () => {
    dispatch(setSelectedNoteId(null));
  };

  const filteredNotes = notes
    .filter(
      (not) =>
        (not.title || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (not.text || "").toLowerCase().includes(searchText.toLowerCase()),
    )
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const formatDate = (date) => dayjs(date).format("MMM D, YYYY");
  const snippet = (text) => (text ? text.replace(/\n/g, " ").slice(0, 64) : "");

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-[#12151a] text-[#e6e4dd]">
      {/* ===== SIDEBAR ===== */}
      <aside className="flex w-[340px] min-w-[340px] min-h-0 flex-col border-r border-[#2a303b] bg-[#171b22]">
        <div className="mt-5 px-5 pb-4">
          <button
            type="button"
            onClick={handleCreateNotes}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7a63b] px-4 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-[#e2b452] active:translate-y-[1px]"
          >
            <Plus size={16} />
            Create note
          </button>
          <button
            type="button"
            onClick={handleIsAskAi}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d7a63b] px-4 py-2.5 text-sm font-semibold text-[#1a1305] shadow-[0_1px_0_rgba(0,0,0,0.15)] transition-all duration-150 hover:bg-[#e2b452] active:translate-y-[1px] mt-4"
          >
            <BotMessageSquare size={16} />
            Ask Ai
          </button>
        </div>

        <div className="px-5 pb-3.5">
          <div className="flex items-center gap-2 rounded-lg border border-[#2a303b] bg-[#1e232c] px-2.5 py-2">
            <Search />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search your notes…"
              className="w-full bg-transparent text-[13.5px] text-[#e6e4dd] outline-none placeholder:text-[#565c66]"
            />
            {isSupported && (
              <button
                type="button"
                onClick={startListening}
                className={`shrink-0 rounded-full p-1.5 transition-colors ${
                  isListening
                    ? "text-[#d7a63b] animate-pulse"
                    : "text-[#565c66] hover:text-[#e6e4dd]"
                }`}
                title="Search by voice"
              >
                <Mic size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-baseline justify-between px-[22px] pb-2 pt-1.5 font-['IBM_Plex_Mono',monospace] text-[10.5px] uppercase tracking-[0.6px] text-[#565c66]">
          <span>
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "note" : "notes"}
          </span>
          <span>Recent first</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 pb-4">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((not) => (
              <div
                key={not._id}
                onClick={() => dispatch(setSelectedNoteId(not._id))}
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

                <div className="absolute right-2 bottom-2 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingNoteId(not._id);
                    }}
                    className="rounded px-2 py-1 text-[11px] text-[#ffe100] transition-colors hover:text-[#e6e4dd]"
                  >
                    <SquarePen size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(not._id);
                    }}
                    className="rounded px-2 py-1 text-[11px] text-[#9297a1] transition-colors hover:text-[#a1493a]"
                  >
                    <Trash2 size={14} />
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

      {/* ===== MAIN ===== */}
      <main
        className="relative flex flex-1 min-h-0 flex-col overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 900px 600px at 75% -10%, rgba(215,166,59,0.05), transparent), #12151a",
        }}
      >
        {selectedNote ? (
          <div className="h-full w-full min-h-0 overflow-y-auto">
            <div className="mx-auto w-full max-w-[720px] px-10 py-12">
              <NotesContentForm
                data={selectedNote}
                onChange={handleNoteChange}
              />
            </div>
          </div>
        ) : (
          <ChatAslAI
            setSelectedNoteId={(id) => dispatch(setSelectedNoteId(id))}
          />
        )}
      </main>
    </div>
  );
}

export default DashboardScreen;
