import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      try {
        const response = await fetch(`http://localhost:5000/note/${id}`);
        const data = await response.json();
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
  }, [id]);

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
    if (!title) {
      setShowPopup(true);
    } else {
      saveNote();
    }
  };

  const saveNote = async () => {
    const payload = { title, content };
    try {
      if (isEditing) {
        await fetch(`http://localhost:5000/note/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("http://localhost:5000/note/create/1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
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
        {isEditing ? "Update file" : "Save file"}
      </button>
      {isOffline && <p>You are offline. Changes are saved locally.</p>}
      
      {showPopup && (
        <div className="title-popup">
          <div className="title-popup-content">
            <h3>Enter note title</h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <button onClick={() => {
              if (title) {
                setShowPopup(false);
                saveNote();
              }
            }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;