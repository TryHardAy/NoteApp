import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ApiCall } from "../auth/ApiHandler";
import { useUser } from "../auth/AuthProvider";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  // const [userId, setUserId] = useState(null);
  const user = useUser();

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   try {
  //     const decoded = jwtDecode(token);
  //     setUserId(decoded.sub);
  //   } catch (err) {
  //     console.error("Błąd dekodowania tokenu:", err);
  //   }
  // }, []);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      try {
        const data = await ApiCall({
          method: "GET",
          url: `/note/${id}`,
        })
        // const response = await fetch(`/note/${id}`);
        // const data = await response.json();
        if (data.content) {
          setContent(data.content);
          setTitle(data.title || "");
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania notatki:", error);
      }
    };

    fetchNote();
  }, [id, user]);

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

  useEffect(() => {
    if (isOffline) {
      localStorage.setItem("draftDocument", content);
    }
  }, [content, isOffline]);

const handleSaveClick = () => {
  setShowPopup(true); // zawsze pokazuj popup
};

  const saveNote = async () => {
    // if (!user) {
    //   console.error("Brak user — użytkownik niezalogowany?", user);
    //   return;
    // }

    const payload = { title, content };

    try {
      if (isEditing) {
        await ApiCall({
          method: "PUT",
          url: `/note/${id}`,
          data: payload,
        })
        // Aktualizacja istniejącej notatki
        // await fetch(`/note/${id}`, {
        //   method: "PUT",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });
      } else {
        // Tworzenie nowej notatki
        await ApiCall({
          method: "POST",
          url: `/note/create/`,
          data: payload,
        })
        // await fetch(`http://localhost:5000/note/create/${userId}`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload),
        // });
      }

      localStorage.removeItem("draftDocument");
      navigate("/");
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
      <button onClick={handleSaveClick} disabled={isOffline}>
        {isEditing ? "Zaktualizuj plik" : "Zapisz plik"}
      </button>
      {isOffline && <p>You are offline. Changes are saved locally.</p>}

      {showPopup && (
        <div className="title-popup">
          <div className="title-popup-content">
            <h3>Zmień tytuł</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tytuł"
            />
            <button
              onClick={() => {
                if (title) {
                  setShowPopup(false);
                  saveNote();
                }
              }}
            >
              Zapisz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
