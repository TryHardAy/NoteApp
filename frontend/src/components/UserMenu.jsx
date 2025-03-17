import React from 'react';
import UserInterfaceButton from './UserInterfaceButton';


const UserMenu = () => {
  return (
    <div className="usermenu-container">
      <div className="usermenu">
        <UserInterfaceButton label="Nowy użytkownik" url="/NewUser" />
        <UserInterfaceButton label="Kategorie" url="/categories" />
      </div>
    </div>
  );
};

export default UserMenu;
