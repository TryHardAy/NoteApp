import React from "react";
import keycloak from "../auth/keycloak";

const LogoutButton = () => {
  return (
    <button className="logout-button" onClick={() => keycloak.logout()}>
      Wyloguj
    </button>
  );
};

export default LogoutButton;