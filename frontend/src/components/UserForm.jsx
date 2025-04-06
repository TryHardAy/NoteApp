/*import React, { useState } from 'react';

const UserForm = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      name,
      last_name: lastName,
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:5000/user/create', {  // Upewnij się, że adres URL jest poprawny
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        // Resetowanie formularza po poprawnym zapisie:
        setName('');
        setLastName('');
        setEmail('');
        setPassword('');
      } else {
        console.error("Błąd przy zapisie użytkownika");
        alert("Błąd przy zapisie użytkownika");
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
          <label htmlFor="name">Imię:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="lastName">Nazwisko:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">Zapisz</button>
      </form>
    </div>
  );
};

export default UserForm;*/

import React, { useState } from 'react';

const UserForm = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      name,
      last_name: lastName,
      email,
      password,
    };

    try {
      const response = await fetch('http://localhost:5000/user/create', {  // Upewnij się, że adres URL jest poprawny
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        alert("Użytkownik został zapisany!");
      } else {
        console.error("Błąd przy zapisie użytkownika");
        alert("Błąd przy zapisie użytkownika");
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
          <label htmlFor="name">Imię:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="lastName">Nazwisko:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Hasło:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-button">Zapisz</button>
      </form>
    </div>
  );
};

export default UserForm;


/*const UserForm = () => {
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

export default UserForm;*/
