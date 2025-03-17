import React, { useState } from 'react';


const CategoryForm = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted with:', inputValue);
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

        <button type="submit" className="submit-button">Zapisz</button>
      </form>
    </div>
  );
};

export default CategoryForm;
