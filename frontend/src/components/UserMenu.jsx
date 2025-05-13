import React from 'react';
import UserInterfaceButton from './UserInterfaceButton';


const UserMenu = () => {
  return (
    <div className="usermenu-container">
      <div className="usermenu">
        <UserInterfaceButton label="Nowy użytkownik" url="/NewUser" />
        <UserInterfaceButton label="Dodaj Kategorie" url="/categories" />
        <UserInterfaceButton label="Kategorie" url="/categoryList" />
      </div>
    </div>
  );
};

export default UserMenu;
