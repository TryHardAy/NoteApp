import React from "react";

const LogoutButton = ({kc}) => {
  return (
    <button className="logout-button" onClick={() => kc.logout()}>
      Log Out
    </button>
  );
};

export default LogoutButton;