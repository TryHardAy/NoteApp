import React, { useState, useEffect } from "react";
import { ApiCall } from "../auth/ApiHandler";

const TagForm = ({ noteId, onSave, userId }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [categoryPermission, setCategoryPermission] = useState(2);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermission, setUserPermission] = useState(2);

  useEffect(() => {
    const fetchCategories = async () => {
      console.log("📦 Pobieranie kategorii...");
      try {
        const data = await ApiCall({
          method: "GET",
          url: `/categories`,
        });
        setCategories(data);
        console.log("✅ Kategorie pobrane:", data);
      } catch (error) {
        console.error("❌ Błąd podczas pobierania kategorii:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      console.log(`🔍 Wyszukiwanie użytkowników dla: "${searchTerm}"`);
      const fetchUsers = async () => {
        try {
          const data = await ApiCall({
            method: "GET",
            url: `/users/except?prefix=${encodeURIComponent(searchTerm)}`,
          });
          setUsers(data);
          console.log("✅ Użytkownicy znalezieni:", data);
        } catch (error) {
          console.error("❌ Błąd podczas pobierania użytkowników:", error);
        }
      };
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [searchTerm]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(Number(e.target.value));
    console.log("📁 Wybrano kategorię:", e.target.value);
  };

  const handlePermissionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setCategoryPermission(value);
    console.log("🔒 Uprawnienia do kategorii:", value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm("");
    setUsers([]);
    console.log("👤 Wybrano użytkownika:", user);
  };

  const handleUserPermissionChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setUserPermission(value);
    console.log("🔒 Uprawnienia dla użytkownika:", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("Brak ID użytkownika – zaloguj się ponownie.");
      return;
    }

    const payload = {
      note_id: noteId,
      category_id: selectedCategory || 0,
      category_permission: categoryPermission,
      user_id: selectedUser ? String(selectedUser.id) : "",
      user_permission: userPermission,
    };

    console.log("📤 Payload do wysłania:", JSON.stringify(payload, null, 2));

    try {
      const result = await ApiCall({
        method: "PUT",
        url: `/permission/add`,
        data: payload,
      });

      console.log("✅ Odpowiedź serwera:", result);
      onSave();
    } catch (error) {
      console.error("❌ Błąd podczas zapisywania:", error);
      console.error("❌ Payload przy błędzie:", JSON.stringify(payload, null, 2));

      if (error?.response?.data) {
        console.error("📨 Odpowiedź serwera (błąd):", error.response.data);
      }

      alert("Błąd podczas zapisywania danych!");
    }

    // Reset formularza
    setSelectedCategory(0);
    setCategoryPermission(2);
    setSearchTerm("");
    setSelectedUser(null);
    setUserPermission(2);
  };

  return (
    <div className="tag-form">
      <h4>Przypisz kategorię do notatki {noteId}</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="category-select">Wybierz kategorię:</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value={-1}>--Wybierz kategorię--</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="category-permission">Uprawnienia kategorii:</label>
        <select
          id="category-permission"
          value={categoryPermission}
          onChange={handlePermissionChange}
        >
          <option value={2}>Pełne uprawnienia</option>
          <option value={1}>Tylko odczyt</option>
        </select>
        <br />

        <label htmlFor="user-search">Wyszukaj użytkownika:</label>
        <input
          type="text"
          id="user-search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Imię lub nazwisko"
        />
        <br />

        {users.length > 0 && (
          <div className="user-results">
            <ul>
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedUser?.id === user.id ? "#ddd" : "transparent",
                  }}
                >
                  {user.name} {user.last_name} - {user.email}
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedUser && (
          <div className="selected-user">
            <p>
              Wybrany użytkownik: {selectedUser.name} {selectedUser.last_name} - {selectedUser.email}
            </p>
            <label htmlFor="user-permission">Uprawnienia użytkownika:</label>
            <select
              id="user-permission"
              value={userPermission}
              onChange={handleUserPermissionChange}
            >
              <option value={2}>Pełne uprawnienia</option>
              <option value={1}>Tylko odczyt</option>
            </select>
            <br />
          </div>
        )}

        <button type="submit">Zapisz</button>
      </form>
    </div>
  );
};

export default TagForm;
