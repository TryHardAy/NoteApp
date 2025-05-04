import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";

const NotesList = ({ searchTerm }) => {
  const [notes, setNotes] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null); // Store the note ID for the popup
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // If there's no token, don't proceed

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub; // Get user ID from the decoded token

        if (!userId) {
          console.error("Brak userId w tokenie");
          return;
        }

        // Fetch notes with categories for the user
        const response = await fetch(`http://localhost:5000/notes/${userId}`);
        const notesData = await response.json();

        const categoriesResponse = await fetch("http://localhost:5000/categories");
        const categoriesData = await categoriesResponse.json();

        // Process notes and map them with their categories
        const notesWithCategories = notesData.map((note) => {
          const categories = categoriesData
            .filter((category) => category.note_id === note.id)
            .map((category) => category.categories.split(","));

          return {
            ...note,
            categories: categories.flat(),
          };
        });

        setNotes(notesWithCategories); // Update the state with the notes and categories
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };

    fetchNotes();
  }, []); // Runs only once, when the component is mounted

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

  // Filter notes based on the searchTerm
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
            <span className="note-category">
              {note.categories && note.categories.length > 0
                ? note.categories.map((cat, index) => (
                    <span key={index}>
                      {cat}
                      {index < note.categories.length - 1 && ", "}
                    </span>
                  ))
                : "Prywatny"}
            </span>
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

      {/* Popup for sharing categories */}
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
