import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/notes");
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
      await fetch(`http://localhost:5000/notes/${id}`, {
        method: "DELETE",
      });
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
  };

  if (notes.length === 0) return null;

  // TO DO: funkcja do wyswietlania formularza z nadawaniem kategorii i dostepu
  // Dummy funkcja
  const handleShare = (noteId) => {
    console.log(`Udostępnianie notatki o ID: ${noteId}`);
  };
  

  return (
    <div className="notes-list">
      {notes.map((note) => (
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
                <button onClick={() => navigate(`/editor/${note.id}`)}>
                  ✏️ Edytuj
                </button>
                <button onClick={() => handleShare(note.id)}>🔗 Udostępnij</button>
                <button onClick={() => handleDelete(note.id)}>🗑️ Usuń</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
