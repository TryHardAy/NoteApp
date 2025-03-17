import React, { useState } from 'react';

const UserForm = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  
  const tags = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4']; // Możesz dodać własne tagi

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with:', inputValue, selectedTag);
    // Tutaj możesz dodać logikę zapisywania danych
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label htmlFor="inputValue">Wprowadź tekst:</label>
          <input
            type="text"
            id="inputValue"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="inputValue">Wprowadź tekst:</label>
          <input
            type="text"
            id="inputValue"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        
        <div className="input-container">
          <label htmlFor="tagSelect">Wybierz tag:</label>
          <select
            id="tagSelect"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">Wybierz...</option>
            {tags.map((tag, index) => (
              <option key={index} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">Zapisz</button>
      </form>
    </div>
  );
};

export default UserForm;
