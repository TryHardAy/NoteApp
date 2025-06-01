import React from "react";
import keycloak from "../auth/keycloak";

const LogoutButton = () => {
  return (
    <button className="logout-button" onClick={() => keycloak.logout()}>
      Log Out
    </button>
  );
};

export default LogoutButton;