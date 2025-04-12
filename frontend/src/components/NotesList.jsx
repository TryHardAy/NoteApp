import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";

const NotesList = ({ searchTerm }) => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null);

  const navigate = useNavigate();

  // Pobieranie kategorii
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/categories");
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
      }
    };
    fetchCategories();
  }, []);

  // Pobieranie notatek na podstawie wybranej kategorii
  useEffect(() => {
    const fetchNotes = async () => {
      let url = "http://localhost:5000/notes/1"; // Domyślnie wszystkie notatki
      if (selectedCategory !== null) {
        url = `http://localhost:5000/notes/categories/${selectedCategory}`;
      }
      try {
        const response = await fetch(url);
        const data = await response.json();
        if (Array.isArray(data)) {
          setNotes(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };
    fetchNotes();
  }, [selectedCategory]);

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

  // Filtrowanie notatek
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notes-list">
      {/* Dropdown kategorii */}
      <select
        onChange={(e) =>
          setSelectedCategory(e.target.value === "" ? null : Number(e.target.value))
        }
        value={selectedCategory ?? ""}
      >
        <option value="">Wybierz kategorię</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

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

      {/* Popup do przypisania tagów */}
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
