import React from 'react';

const SearchInput = ({ searchTerm, setSearchTerm }) => {
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}             // Wartość pochodzi z props
        onChange={handleChange}        // Aktualizacja odbywa się poprzez funkcję z props
        placeholder="Wyszukaj..."
        className="search-input"
      />
    </div>
  );
};

export default SearchInput;
