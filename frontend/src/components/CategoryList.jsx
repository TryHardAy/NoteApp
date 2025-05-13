import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";

const CategoriesList = ({ searchTerm }) => {
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupCategoryId, setPopupCategoryId] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  // Pobieranie kategorii z backendu przy załadowaniu komponentu
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

  // Filtrowanie kategorii na podstawie wpisanego tekstu
  const filteredCategories = categories.filter((category) =>
    (category.name ?? "").toLowerCase().includes((searchTerm ?? "").toLowerCase())
  );

  // Obsługa kliknięcia edycji kategorii
  const handleEditCategoryName = (id, name) => {
    setCategoryName(name);
    setPopupCategoryId(id);
  };

  // Zapis nowej nazwy kategorii do backendu (dopasowany do /category/{id})
  const handleSaveCategoryName = async () => {
    try {
      await fetch(`http://localhost:5000/category/${popupCategoryId}`, {
        method: "PUT", // Musisz mieć taki endpoint w FastAPI!
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }),
      });

      setCategories((prev) =>
        prev.map((category) =>
          category.id === popupCategoryId
            ? { ...category, name: categoryName }
            : category
        )
      );
      setPopupCategoryId(null);
    } catch (error) {
      console.error("Błąd podczas zapisywania nazwy kategorii:", error);
    }
  };

  // Usuwanie kategorii (dopasowany do /category/{id})
  const handleDeleteCategory = async (id) => {
    try {
      await fetch(`http://localhost:5000/category/${id}`, {
        method: "DELETE",
      });

      setCategories((prev) => prev.filter((category) => category.id !== id));
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
                onClick={() =>
                  setMenuOpen(menuOpen === category.id ? null : category.id)
                }
              />
              {menuOpen === category.id && (
                <div className="dropdown-menu">
                  <button
                    onClick={() =>
                      handleEditCategoryName(category.id, category.name)
                    }
                  >
                    ✏️ Edytuj nazwę
                  </button>
                  <button onClick={() => handleDeleteCategory(category.id)}>
                    🗑️ Usuń kategorię
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}

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
            <button onClick={() => setPopupCategoryId(null)}>Zamknij</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
