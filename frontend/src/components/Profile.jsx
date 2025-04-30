import React from 'react';
import LogoutButton from './LogoutButton';

const Profile = ({ userData }) => {
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
      <LogoutButton />
    </div>
  );
};

export default Profile;
