import React, { useState } from 'react';
import App from '../App';

const SearchInput = () => {
  const [inputValue, setInputValue] = useState('');
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Szukaj"
        className="search-input"
      />
    </div>
  );
};

export default SearchInput;
