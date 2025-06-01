import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";

const NotesList = ({ searchTerm }) => {
  const [notes, setNotes] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decodedToken = jwtDecode(token);
    const uid = decodedToken.sub;
    setUserId(uid);
  }, []);

  useEffect(() => {
    const fetchUserCategories = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5000/categories/user/${userId}`);
        const data = await response.json();
        const assigned = data.filter((cat) => cat.has_user);
        setAllCategories(assigned);
      } catch (error) {
        console.error("Błąd przy pobieraniu kategorii użytkownika:", error);
      }
    };

    fetchUserCategories();
  }, [userId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5000/notes/${userId}/${selectedCategory}`);
        const notesData = await response.json();
        setNotes(notesData);
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };

    fetchNotes();
  }, [userId, allCategories, selectedCategory, popupNoteId]);

  const handleDelete = async (id) => {
    const note = notes.find((n) => n.id === id);
    if (!note || note.permission < 1) {
      console.warn("Brak uprawnień do usunięcia notatki.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/note/${id}/${userId}`, {
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
    const note = notes.find((n) => n.id === id);
    if (!note || note.permission < 1) {
      console.warn("Brak uprawnień do pobrania notatki.");
      return;
    }

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

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value === "" ? 0 : Number(e.target.value);
    setSelectedCategory(selectedId);
  };

  return (
    <div className="notes-list">
      <select className = "category-select" onChange={handleCategoryChange} value={selectedCategory ?? ""}>
        <option value="">Wszystkie kategorie</option>
        {allCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {notes.length !== 0 &&
        notes.map((note) => (
          <div key={note.id} className="note-card">
            <p>{note.id}</p>
            <h3
              className="note-title"
              style={{ cursor: note.permission > 1 ? "pointer" : "not-allowed" }}
              onClick={() => {
                if (note.permission > 1) {
                  navigate(`/editor/${note.id}`);
                } else {
                  alert("Brak uprawnień do edycji tej notatki.");
                }
              }}
            >
              <span className="note-owner">
                {`${note.owner_first_name} ${note.owner_last_name}`}
              </span>{" "}
              {note.title}
              <span className="note-category">
                {note.categories ? note.categories : "Prywatny"}
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
                  {note.permission > 1 && (
                    <button onClick={() => setPopupNoteId(note.id)}>🔗 Udostępnij</button>
                  )}
                  <button onClick={() => handleDownload(note.id)}>📄 Pobierz</button>
                  {note.permission >= 1 && (
                    <button onClick={() => handleDelete(note.id)}>🗑️ Usuń</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

      {popupNoteId && notes.find((n) => n.id === popupNoteId)?.permission > 1 && (
        <div className="popup-overlay">
          <div className="popup">
            <TagForm
              noteId={popupNoteId}
              onSave={() => setPopupNoteId(null)}
              userId={userId}
              permission={notes.find((n) => n.id === popupNoteId)?.permission}
            />
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
