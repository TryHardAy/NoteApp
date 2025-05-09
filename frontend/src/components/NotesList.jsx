import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";

const NotesList = ({ searchTerm }) => {
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]); // stan dla kategorii
  const [selectedCategory, setSelectedCategory] = useState(null); // stan dla wybranej kategorii
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null);
  const navigate = useNavigate();

  // Pobranie kategorii
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

  // Pobranie notatek
  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub;

        if (!userId) {
          console.error("Brak userId w tokenie");
          return;
        }

        let url = `http://localhost:5000/notes/${userId}`;
        if (selectedCategory !== null) {
          url = `http://localhost:5000/notes/categories/${selectedCategory}`;
        }

        const response = await fetch(url);
        const notesData = await response.json();

        const categoriesResponse = await fetch("http://localhost:5000/categories");
        const categoriesData = await categoriesResponse.json();

        const notesWithCategories = notesData.map((note) => {
          const categories = categoriesData
            .filter((category) => category.note_id === note.id)
            .map((category) => category.categories.split(","));

          return {
            ...note,
            categories: categories.flat(),
          };
        });

        setNotes(notesWithCategories);
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };

    fetchNotes();
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.sub;

      if (!userId) {
        console.error("Brak userId w tokenie");
        return;
      }

      const response = await fetch(`http://localhost:5000/note/${id}?user_id=${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id));
      } else {
        console.error("Błąd podczas usuwania notatki:", data);
      }
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

  // Filtrowanie notatek po searchTerm
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notes-list">
      {/* Dropdown for category selection */}
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
                {note.permission > 1 && (
                  <button onClick={() => navigate(`/editor/${note.id}`)}>✏️ Edytuj</button>
                )}
                <button onClick={() => setPopupNoteId(note.id)}>🔗 Udostępnij</button>
                <button onClick={() => handleDownload(note.id)}>📄 Pobierz</button>
                {note.permission >= 1 && (
                  <button onClick={() => handleDelete(note.id)}>🗑️ Usuń</button>
                )}
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
