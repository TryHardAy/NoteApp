import React from 'react';
import InterfaceButton from './InterfaceButtons';

const Menu = ({ is_admin }) => {
  return (
    <div className="menu-container">
      <div className="menu">
        <InterfaceButton label="Moje pliki" url="/" />
        <InterfaceButton label="Nowy plik" url="/editor" />
        
        {/* 🔒 Pokaż tylko jeśli admin */}
        {is_admin && (
          <InterfaceButton label="Użytkownicy" url="/users" />
        )}
      </div>
    </div>
  );
};

export default Menu;
