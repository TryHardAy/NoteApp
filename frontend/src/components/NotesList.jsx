import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { MoreVertical } from "lucide-react";
import TagForm from "./ShareForm";
import { useUser } from "../auth/AuthProvider";
import { ApiCall } from "../auth/ApiHandler";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // tylko z has_user === true
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupNoteId, setPopupNoteId] = useState(null);
  // const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  // Ustal użytkownika
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) return;

  //   const decodedToken = jwtDecode(token);
  //   const uid = decodedToken.sub;
  //   // setUserId(uid);
  // }, []);

  // Pobierz przypisane użytkownikowi kategorie (has_user === true)
  useEffect(() => {
    const fetchUserCategories = async () => {
      if (!user) return;

      try {
        const data = await ApiCall({
          method: "GET",
          url: `/categories/user/${user.id}`,
        })
        // const response = await fetch(`http://localhost:5000/categories/user/${userId}`);
        // const data = await response.json();
        const assigned = data.filter((cat) => cat.has_user);
        setAllCategories(assigned);
        console.log("Przypisane kategorie:", assigned);
      } catch (error) {
        console.error("Błąd przy pobieraniu kategorii użytkownika:", error);
      }
    };

    fetchUserCategories();
  }, [user]);

  // Pobierz notatki użytkownika i przypisz im przypisane kategorie
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesData = await ApiCall({
          method: "GET",
          url: `/notes/${selectedCategory}`,
        })
        // const response = await fetch(`http://localhost:5000/notes/${selectedCategory}`);
        // const notesData = await response.json();
        // console.log(selectedCategory);
        // console.log(`notki = ${notes}`)

        // Wszystkim notatkom przypisz te same przypisane kategorie
        // const notesWithCategories = notesData.map((note) => ({
        //   ...note,
        //   categories: allCategories.map((cat) => cat.name),
        // }));
        console.log("NOTKI: ", notesData);
        setNotes(notesData);
      } catch (error) {
        console.error("Błąd podczas pobierania notatek:", error);
      }
    };

    fetchNotes();
  }, [user, allCategories, selectedCategory, popupNoteId]);

  const handleDelete = async (id) => {
    try {
      const data = await ApiCall({
        method: "DELETE",
        url: `/note/${id}`,
      })
      // const response = await fetch(`http://localhost:5000/note/${id}`, {
      //   method: "DELETE",
      // });

      // const data = await response.json();

      // if (response.ok) {
        setNotes(notes.filter((note) => note.id !== id));
      // } else {
      //   console.error("Błąd podczas usuwania notatki:", data);
      // }
    } catch (error) {
      console.error("Błąd podczas usuwania notatki:", error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const note = await ApiCall({
        method: "GET",
        url: `/note/${id}`,
      })
      // const response = await fetch(`http://localhost:5000/note/${id}`);
      // const note = await response.json();

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

  // 🔍 Filtrowanie notatek
  // const filteredNotes = notes.filter((note) => {
  //   const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === null ||
  //     note.categories?.includes(
  //       allCategories.find((cat) => cat.id === selectedCategory)?.name
  //     );
  //   return matchesSearch && matchesCategory;
  // });

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value === "" ? 0 : Number(e.target.value);
    setSelectedCategory(selectedId);
  };

  return (
    <div className="notes-list">
      {/* Dropdown do filtrowania po przypisanych kategoriach */}
      <select onChange={handleCategoryChange} value={selectedCategory ?? ""}>
        <option value="">Wszystkie kategorie</option>
        {allCategories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {notes.length != 0 && notes.map((note) => (
        <div key={note.id} className="note-card">
          <p>{note.id}</p>
          <h3
            className="note-title"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/editor/${note.id}`)}
          >
            <span className="note-owner">
              {`${note.owner_first_name} ${note.owner_last_name}`}
            </span>{" "}
            {note.title}
            <span className="note-category">
              {note.categories 
                ? note.categories
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

      {popupNoteId && (
        <div className="popup-overlay">
          <div className="popup">
            <TagForm noteId={popupNoteId} onSave={() => setPopupNoteId(null)} userId={user.id} />
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
