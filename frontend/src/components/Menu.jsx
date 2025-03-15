import React from 'react';
import InterfaceButton from './InterfaceButtons';

const Menu = () => {
  return (
    <div className="menu-container">
      <div className="menu">
        <InterfaceButton label="Moje pliki" url="/" />
        <InterfaceButton label="Nowy plik" url="/editor" />
        <InterfaceButton label="Użytkownicy" url="/users" />
      </div>
    </div>
  );
};

export default Menu;
