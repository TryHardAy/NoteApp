import React, { useState } from 'react';

const CategoryForm = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const category = {
      name: inputValue,
    };

    try {
      const response = await fetch('http://localhost:5000/newCategory', {  // Upewnij się, że adres URL jest poprawny
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        alert("Kategoria została zapisana!");
      } else {
        console.error("Błąd przy zapisie kategorii");
        alert("Błąd przy zapisie kategorii");
      }
    } catch (error) {
      console.error("Wystąpił błąd:", error);
      alert("Wystąpił błąd");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="inputValue">Wprowadź nazwę kategorii:</label>
          <input
            type="text"
            id="inputValue"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-button">Zapisz</button>
      </form>
    </div>
  );
};

export default CategoryForm;
