import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";

const NotesList = ({ searchTerm }) => { // searchTerm przekazywany jako prop
  const [notes, setNotes] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null); // Przechowuje ID notatki do popupu

  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/notes/1"); // Zamienić potem "1" na user_id
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setNotes(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };

    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/note/${id}`, {
        method: "DELETE",
      });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/note/${id}`);
      const note = await response.json();
  
      const blob = new Blob([note.content], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title || "notatka"}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Błąd podczas pobierania notatki:", error);
    }
  };
  
  // Filtrowanie notatek na podstawie searchTerm
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notes-list">
      {filteredNotes.map((note) => (
        <div key={note.id} className="note-card">
          <p>{note.id}</p>
          <h3
            className="note-title"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/editor/${note.id}`)}
          >
            {note.title}
          </h3>

          <div className="options-menu-container">
            <MoreVertical
              className="menu-icon"
              onClick={() => setMenuOpen(menuOpen === note.id ? null : note.id)}
            />

            {menuOpen === note.id && (
              <div className="dropdown-menu">
                <button onClick={() => navigate(`/editor/${note.id}`)}>✏️ Edytuj</button>
                <button onClick={() => setPopupNoteId(note.id)}>🔗 Udostępnij</button>
                <button onClick={() => handleDownload(note.id)}>📄 Pobierz</button>
                <button onClick={() => handleDelete(note.id)}>🗑️ Usuń</button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Popup dla przypisania kategorii */}
      {popupNoteId && (
        <div className="popup-overlay">
          <div className="popup">
            <TagForm noteId={popupNoteId} onSave={() => setPopupNoteId(null)} />
            <button className="close-btn" onClick={() => setPopupNoteId(null)}>
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesList;
