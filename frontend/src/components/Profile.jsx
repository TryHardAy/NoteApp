import React from 'react';
import LogoutButton from './LogoutButton';
import Keycloak from 'keycloak-js';

const Profile = ({ userData, kc }) => {
  if (!userData) return <div>Loading...</div>; // Możesz dodać spinnera lub inny wskaźnik, gdy dane użytkownika są ładowane

  return (
    <div className="profile-info">
      <div className="name">
        <p>{userData.given_name}</p>
        <p>{userData.family_name}</p>
      </div>
      <div className="contact-info">
        <p>{userData.email}</p>
      </div>
      <LogoutButton kc={kc} />
    </div>
  );
};

export default Profile;
