import React, { useState, useEffect } from "react";

const TagForm = ({ noteId, onSave, userId }) => {
  const [categories, setCategories] = useState([]); // Lista kategorii
  const [selectedCategory, setSelectedCategory] = useState(""); // Wybrana kategoria
  const [categoryPermission, setCategoryPermission] = useState(1); // Uprawnienia kategorii
  const [searchTerm, setSearchTerm] = useState(""); // Wyszukiwany termin dla użytkowników
  const [users, setUsers] = useState([]); // Lista użytkowników
  const [selectedUser, setSelectedUser] = useState(null); // Wybrany użytkownik
  const [userPermission, setUserPermission] = useState(1); // Uprawnienia użytkownika

  // Pobieranie kategorii z backendu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/categories");
        const data = await response.json();
        setCategories(data); // Zakładając, że backend zwraca [{ id, name }, ...]
      } catch (error) {
        console.error("Błąd podczas pobierania kategorii:", error);
      }
    };

    fetchCategories();
  }, []);

  // Pobieranie użytkowników na podstawie wpisywanego tekstu
  useEffect(() => {
    if (searchTerm.length > 0) {
      const fetchUsers = async () => {
        try {
          const effectiveUserId = userId ? userId : 0;
          const response = await fetch(
            `http://localhost:5000/Users/some/${effectiveUserId}?prefix=${encodeURIComponent(searchTerm)}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setUsers(data); // Lista użytkowników pasujących do wyszukiwanego terminu
        } catch (error) {
          console.error("Błąd podczas pobierania użytkowników:", error);
        }
      };

      fetchUsers();
    } else {
      setUsers([]); // Jeśli pole jest puste, nie pokazuj wyników wyszukiwania
    }
  }, [searchTerm, userId]);

  // Obsługa zmiany kategorii
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Obsługa zmiany uprawnień kategorii
  const handlePermissionChange = (e) => {
    setCategoryPermission(parseInt(e.target.value, 10));
  };

  // Obsługa zmiany wyszukiwanego terminu
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Obsługa wyboru użytkownika z listy
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchTerm(""); // Czyścimy pole wyszukiwania
    setUsers([]); // Usuwamy wyniki wyszukiwania – wybrany użytkownik będzie widoczny osobno
  };

  // Obsługa zmiany uprawnień użytkownika
  const handleUserPermissionChange = (e) => {
    setUserPermission(parseInt(e.target.value, 10));
  };

  // Obsługa wysłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory && !selectedUser) {
      alert("Proszę wybrać przynajmniej kategorię lub użytkownika");
      return;
    }

    // Budowanie form data warunkowo – dodajemy klucze tylko, gdy mają wartość
    const formData = new URLSearchParams();
    formData.append("note_id", noteId);
    if (selectedCategory) {
      formData.append("category_id", parseInt(selectedCategory, 10));
      formData.append("category_permission", categoryPermission);
    }
    if (selectedUser) {
      formData.append("user_id", selectedUser.id);
      formData.append("user_permission", userPermission);
    }

    try {
      const response = await fetch("http://localhost:5000/note/category/add", {
        method: "PUT",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const result = await response.json();
      console.log("Odpowiedź serwera:", result);
      // Zmiana: Usunięto alert przy sukcesie oraz dodano wywołanie onSave() w celu zamknięcia popupu.
      onSave(); 
    } catch (error) {
      console.error("Błąd podczas zapisywania:", error);
      alert("Błąd podczas zapisywania danych!");
    }

    // Resetowanie formularza
    setSelectedCategory("");
    setCategoryPermission(1);
    setSearchTerm("");
    setSelectedUser(null);
    setUserPermission(1);
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
          <option value="">--Wybierz kategorię--</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <br />

        <label htmlFor="category-permission">Wybierz uprawnienia do kategorii:</label>
        <select
          id="category-permission"
          value={categoryPermission}
          onChange={handlePermissionChange}
        >
          <option value={1}>Pełne uprawnienia</option>
          <option value={0}>Tylko odczyt</option>
        </select>
        <br />

        <label htmlFor="user-search">Wyszukaj użytkownika:</label>
        <input
          type="text"
          id="user-search"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Wyszukaj po imieniu lub nazwisku"
        />
        <br />

        {/* Wyświetlanie wyników wyszukiwania */}
        {users.length > 0 && (
          <div className="user-results">
            <ul>
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedUser?.id === user.id ? "#ddd" : "transparent",
                  }}
                >
                  {user.name} {user.last_name} - {user.email}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Wyświetlenie wybranego użytkownika, który pozostaje widoczny */}
        {selectedUser && (
          <div className="selected-user">
            <p>
              Wybrany użytkownik: {selectedUser.name} {selectedUser.last_name} - {selectedUser.email}
            </p>
            <label htmlFor="user-permission">Wybierz uprawnienia dla użytkownika:</label>
            <select
              id="user-permission"
              value={userPermission}
              onChange={handleUserPermissionChange}
            >
              <option value={1}>Pełne uprawnienia</option>
              <option value={0}>Tylko odczyt</option>
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
