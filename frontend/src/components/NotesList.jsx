import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate(); // 🔹 Dodano inicjalizację navigate

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

  if (notes.length === 0) return null; // Nie renderuj nic, jeśli brak notatek

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <div key={note.id} className="note-card">
          <p>{note.id}</p>
          <h3
            className="note-title"
            style={{ cursor: "pointer" }} // 🔹 Dodany styl dla wskaźnika
            onClick={() => navigate(`/editor/${note.id}`)}
          >
            {note.title}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
