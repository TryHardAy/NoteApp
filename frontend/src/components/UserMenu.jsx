import React from 'react';
import UserInterfaceButton from './UserInterfaceButton';


const UserMenu = () => {
  return (
    <div className="usermenu-container">
      <div className="usermenu">
        <UserInterfaceButton label="Dodaj Kategorie" url="/categories" />
        <UserInterfaceButton label="Kategorie" url="/categoryList" />
      </div>
    </div>
  );
};

export default UserMenu;
