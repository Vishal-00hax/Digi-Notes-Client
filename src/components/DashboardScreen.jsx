import React from "react";
import api from "../../utils/axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import dayjs from "dayjs";
import EditNotesForm from "./EditNotesForm";

function DashboardScreen() {
  const [notes, setNotes] = useState(null);
  const [isEditingNoteId, setIsEditingNoteId] = useState(false);

  const navigate = useNavigate();

  const getUserNotes = async () => {
    try {
      const response = await api.get("/notes/user");
      setNotes(response.data.notes);
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong";
      toast.error(errText);
    }
  };

  useEffect(() => {
    getUserNotes();
  }, []);

  const handleCreateNotes = async () => {
    try {
      const response = await api.post("/notes/create");
      await getUserNotes();
      toast.success("New Note Created");
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong";
      toast.error(errText);
    }
  };

  const handleDelete = async (notesId) => {
    try {
      const response = await api.delete(`/notes/delete/${notesId}`);
      await getUserNotes();
      toast.success("Note Deleted");
    } catch (err) {
      const errText =
        err.response.message || err.response || "Something went wrong";
      toast.error(errText);
    }
  };

  console.log("Notes", notes);

  const displayFont = { fontFamily: "'Instrument Serif', serif" };
  return (
    <div className="min-h-screen w-full bg-background px-6 py-12 sm:px-10">
      <div className="mx-auto max-w-6xl mb-10 flex items-center justify-between">
        <button
          onClick={() => handleCreateNotes()}
          className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground transition-transform duration-300 hover:scale-[1.03]"
        >
          Create New Note
        </button>
      </div>
      {notes ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((not) => {
            return (
              <Link key={not._id} to={``}>
                <div className="liquid-glass group relative rounded-2xl px-6 py-6 transition-transform duration-300 hover:scale-[1.02]">
                  <p className="text-lg text-foreground" style={displayFont}>
                    {not.title}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Last Update:{" "}
                    {dayjs(not.updatedAt).format("DD MMM YYYY , hh:mm A")}
                  </p>

                  <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingNoteId(not._id)}
                      className="liquid-glass rounded-full px-3 py-1.5 text-xs text-foreground transition-transform duration-300 hover:scale-[1.05]"
                    >
                      Edit
                    </button>
                    {isEditingNoteId === not._id && (
                      <EditNotesForm
                        notesId={not._id}
                        title={not.title}
                        onClose={() => setIsEditingNoteId(null)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(not._id)}
                      className="liquid-glass rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-300 hover:scale-[1.05] hover:text-foreground"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl liquid-glass rounded-2xl px-8 py-20 text-center">
            <p className="text-sm text-muted-foreground">Notes not found</p>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardScreen;
