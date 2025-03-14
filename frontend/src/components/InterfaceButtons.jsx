import React from "react";

const InterfaceButton = ({ label, url }) => {
  const handleClick = () => {
    window.location.href = url; 
  };

  return (
    <button className="InterfaceButton" onClick={handleClick}>
      {label}
    </button>
  );
};

export default InterfaceButton;
