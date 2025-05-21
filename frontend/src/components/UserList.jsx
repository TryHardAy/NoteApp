import React, { useEffect, useState } from "react";
import { MoreVertical } from "lucide-react";

const UserList = ({ searchTerm, userId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [activeUserId, setActiveUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const url = `http://localhost:5000/users/some/${userId}?prefix=${searchTerm}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Nie udało się pobrać użytkowników");
        }

        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId, searchTerm]);

  const openCategoryPopup = async (uid) => {
    try {
      const res = await fetch(`http://localhost:5000/categories/user/${uid}`);
      const data = await res.json();
      setCategories(data);
      // const initiallySelected = data.filter((c) => c.has_user).map((c) => c.id);
      // setSelectedCategories(initiallySelected);
      setActiveUserId(uid);
      setPopupOpen(true);
    } catch (err) {
      console.error("Błąd podczas pobierania kategorii użytkownika:", err);
    }
  };

  const handleCategoryChange = (changedCategory) => {
    // category.has_user = !category.has_user;
    // setCategories(categories);
    // setCategories((prev) =>
    //   prev.includes(categoryId)
    //     ? prev.filter((id) => id !== categoryId)
    //     : [...prev, categoryId]
    // );

    const newCategories = categories.map(category =>
      category.id === changedCategory.id
        ? { ...category, has_user: !category.has_user }
        : category
    );
    setCategories(newCategories);
  };

  const handleSubmitCategories = async () => {
    // const updated = categories.map((cat) => ({
    //   ...cat,
    //   has_user: selectedCategories.includes(cat.id),
    // }));

    try {
      await fetch(`http://localhost:5000/categories/user/${activeUserId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categories),
      });

      setPopupOpen(false);
      alert("Kategorie zaktualizowane!");
    } catch (err) {
      console.error("Błąd przy aktualizacji kategorii:", err);
      alert("Wystąpił błąd przy aktualizacji kategorii.");
    }
  };

  if (loading) {
    return <div>⏳ Ładowanie użytkowników...</div>;
  }

  if (error) {
    return <div>❌ Błąd: {error}</div>;
  }

  return (
    <div className="notes-list">
      {users.map((user) => (
        <div key={user.id} className="note-card">
          <h3
            className="note-title"
            style={{
              fontWeight: "bold",
              marginLeft: "10px",
            }}
          >
            {`${user.name} ${user.last_name}`}
          </h3>

          <div className="options-menu-container">
            <MoreVertical
              className="menu-icon"
              onClick={() =>
                setMenuOpen(menuOpen === user.id ? null : user.id)
              }
            />

            {menuOpen === user.id && (
              <div className="dropdown-menu">
                <button onClick={() => openCategoryPopup(user.id)}>
                  📂 Przypisz kategorię
                </button>
              </div>
            )}
          </div>

          {popupOpen && activeUserId === user.id && (
            <div className="popup-overlay">
              <div className="popup">
                <h3>Wybierz kategorie</h3>
                {categories.map((category) => (
                  <div key={category.id}>
                    <input
                      type="checkbox"
                      checked={category.has_user}
                      onChange={() => handleCategoryChange(category)}
                    />
                    <label>{category.name}</label>
                  </div>
                ))}
                <button onClick={handleSubmitCategories}>
                  Zaktualizuj kategorie
                </button>
                <button onClick={() => setPopupOpen(false)}>Zamknij</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserList;
