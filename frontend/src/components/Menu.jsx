import React from 'react';
import InterfaceButton from './InterfaceButtons';

const Menu = () => {
  return (
    <div className="menu-container">
      <div className="menu">
        <InterfaceButton label="Home" />
        <InterfaceButton label="About" />
        <InterfaceButton label="Services" />
        <InterfaceButton label="Contact" />
      </div>
    </div>
  );
};

export default Menu;
