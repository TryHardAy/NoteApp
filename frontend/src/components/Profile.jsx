import React from 'react';
import LogoutButton from './LogoutButton';
// import Keycloak from 'keycloak-js';

const Profile = ({ userData }) => {
  // if (!userData) return <div>Loading...</div>; // Możesz dodać spinnera lub inny wskaźnik, gdy dane użytkownika są ładowane
  if (!userData) return <LogoutButton/>
  return (
    <div className="profile-info">
      <div className="name">
        <p>{userData.name}</p>
        <p>{userData.last_name}</p>
      </div>
      <div className="contact-info">
        <p>{userData.email}</p>
      </div>
      <LogoutButton/>
    </div>
  );
};

export default Profile;
