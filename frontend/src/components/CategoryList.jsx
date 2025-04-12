import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react"; // Ikona opcji
import TagForm from "./ShareForm"; // Zakładając, że masz ten komponent do przypisywania notatek

const CategoriesList = ({ searchTerm }) => { // searchTerm przekazywany jako prop
  const [categories, setCategories] = useState([]); // Stan przechowujący kategorie
  const [menuOpen, setMenuOpen] = useState(null); // Zarządzanie otwartym menu
  const [popupCategoryId, setPopupCategoryId] = useState(null); // Przechowuje ID kategorii do popupu
  const [categoryName, setCategoryName] = useState(""); // Stan przechowujący nazwę kategorii do edycji

  // Pobieranie kategorii
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/categories"); // Endpoint do pobierania kategorii
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
      }
    };

    fetchCategories();
  }, []); // Ładowanie danych tylko raz przy montowaniu komponentu

  // Filtrowanie kategorii na podstawie searchTerm
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funkcja edytowania nazwy kategorii
  const handleEditCategoryName = (id, name) => {
    setCategoryName(name); // Ustawienie aktualnej nazwy kategorii w stanie
    setPopupCategoryId(id); // Otworzenie popupu
  };

  // Funkcja zapisywania nowej nazwy kategorii
  const handleSaveCategoryName = async () => {
    try {
      await fetch(`http://localhost:5000/category/some/${popupCategoryId}`, {
        method: "PUT", // Używamy PUT do aktualizacji danych
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }), // Przekazujemy nową nazwę
      });
      // Aktualizacja kategorii w lokalnym stanie
      setCategories(categories.map((category) => 
        category.id === popupCategoryId ? { ...category, name: categoryName } : category
      ));
      setPopupCategoryId(null); // Zamknięcie popupu
    } catch (error) {
      console.error("Błąd podczas zapisywania nazwy kategorii:", error);
    }
  };

  // Funkcja usuwania kategorii
  const handleDeleteCategory = async (id) => {
    try {
      await fetch(`http://localhost:5000/category/some/${id}`, {
        method: "DELETE", // Wysłanie żądania usunięcia kategorii
      });
      setCategories(categories.filter((category) => category.id !== id)); // Usuwanie kategorii z lokalnego stanu
    } catch (error) {
      console.error("Błąd podczas usuwania kategorii:", error);
    }
  };

  return (
    <div className="notes-list">
      {filteredCategories.length === 0 ? (
        <p>Brak kategorii.</p>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.id} className="note-card">
            <p>{category.id}</p>
            <h3 className="note-title">{category.name}</h3>

            <div className="options-menu-container">
              <MoreVertical
                className="menu-icon"
                onClick={() => setMenuOpen(menuOpen === category.id ? null : category.id)}
              />

              {menuOpen === category.id && (
                <div className="dropdown-menu">
                  <button onClick={() => handleEditCategoryName(category.id, category.name)}>✏️ Edytuj nazwę</button>
                  <button onClick={() => handleDeleteCategory(category.id)}>🗑️ Usuń kategorię</button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Popup dla edycji nazwy kategorii */}
      {popupCategoryId && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Edytuj nazwę kategorii</h3>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nowa nazwa kategorii"
            />
            <button onClick={handleSaveCategoryName}>Zapisz</button>
            <button className="close-btn" onClick={() => setPopupCategoryId(null)}>
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
