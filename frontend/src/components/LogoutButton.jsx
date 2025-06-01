import React from "react";

const LogoutButton = ({kc}) => {
  return (
    <button className="logout-button" onClick={() => kc.logout()}>
      Wyloguj
    </button>
  );
};

export default LogoutButton;