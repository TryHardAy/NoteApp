import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook do nawigacji
  const [content, setContent] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isEditing, setIsEditing] = useState(false);

  // Pobieranie notatki, jeśli użytkownik edytuje
  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      try {
        const response = await fetch(`http://localhost:5000/notes/${id}`);
        const data = await response.json();
        if (data.content) {
          setContent(data.content);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania notatki:", error);
      }
    };

    fetchNote();
  }, [id]);

  // Obsługa offline/online
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Zapisywanie treści w localStorage, jeśli użytkownik jest offline
  useEffect(() => {
    if (isOffline) {
      localStorage.setItem("draftDocument", content);
    }
  }, [content, isOffline]);

  // Zapisywanie/aktualizowanie notatki
  const saveNote = async () => {
    const payload = { content };

    try {
      if (isEditing) {
        // 🔄 UPDATE istniejącej notatki (PUT)
        await fetch(`http://localhost:5000/notes/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // 🆕 Tworzenie nowej notatki (POST)
        await fetch("http://localhost:5000/newNote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      localStorage.removeItem("draftDocument"); // Czyścimy localStorage po zapisaniu
      navigate("/"); // 🔹 Przekierowanie użytkownika na stronę główną
    } catch (error) {
      console.error("Błąd podczas zapisu na serwer:", error);
    }
  };

  return (
    <div>
      <ReactQuill
        value={content}
        onChange={setContent}
        style={{ minHeight: "300px", padding: "10px" }}
      />
      <button onClick={saveNote} disabled={isOffline}>
        {isEditing ? "Update file" : "Save file"}
      </button>
      {isOffline && <p>You are offline. Changes are saved locally.</p>}
    </div>
  );
};

export default Editor;
