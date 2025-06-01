import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
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
  const [permission, setPermission] = useState(-1);
  const user = useUser();

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        // nowa notatka, permission -1
        setPermission(-1);
        return;
      }
      try {
        const data = await ApiCall({
          method: "GET",
          url: `/note/${id}`,
        });
        if (data.content) {
          setContent(data.content);
          setTitle(data.title || "");
          setIsEditing(true);
          setPermission(data.permission ?? 0);
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
    setShowPopup(true); // pokaż popup tytułu
  };

  const saveNote = async () => {
    const payload = { title, content };

    try {
      if (isEditing) {
        await ApiCall({
          method: "PUT",
          url: `/note/${id}`,
          data: payload,
        });
      } else {
        await ApiCall({
          method: "POST",
          url: `/note/create`,
          data: payload,
        });
      }

      localStorage.removeItem("draftDocument");
      navigate("/");
    } catch (error) {
      console.error("Błąd podczas zapisu na serwer:", error);
    }
  };

  const canEdit = permission === 2 || permission === 3;
  const canSave = permission === -1;

  return (
    <div>
      <ReactQuill
        value={content}
        onChange={setContent}
        style={{ minHeight: "300px", padding: "10px" }}
        readOnly={permission === 0 || permission === 1}
      />

      {(canEdit || canSave) && (
        <button onClick={handleSaveClick} disabled={isOffline}>
          {canEdit ? "Zaktualizuj plik" : "Zapisz plik"}
        </button>
      )}

      {(permission === 1) && (
        <button onClick={() => navigate("/")}>Zamknij</button>
      )}

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
