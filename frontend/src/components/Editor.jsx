import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";

const Editor = () => {
  const { id } = useParams();
  const [content, setContent] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Pobieranie notatki z API po załadowaniu komponentu
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`http://localhost:5000/notes/${id}`);
        const data = await response.json();
        setContent(data.content || ""); // Ustawienie treści notatki
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

  // Wysyłanie treści do serwera
  const syncContentToServer = async () => {
    try {
      await fetch("http://localhost:5000/newNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      localStorage.removeItem("draftDocument"); // Czyść lokalny zapis po synchronizacji
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
      <button onClick={syncContentToServer} disabled={isOffline}>
        Send Content
      </button>
      {isOffline && <p>You are offline. Changes are saved locally.</p>}
    </div>
  );
};

export default Editor;
