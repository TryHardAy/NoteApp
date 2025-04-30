import React from "react";

const LogoutButton = ({kc}) => {
  return (
    <button onClick={() => kc.logout()}>
      Log Out
    </button>
  );
};

export default LogoutButton;