import React from "react";
import { Link } from 'react-router-dom';

const InterfaceButton = ({ label, url }) => {
  /*const handleClick = () => {
    window.location.href = url; 
  };*/

  return (
    <Link to={url}>
      <button className="InterfaceButton">
        {label}
      </button>
    </Link>
  );
};

export default InterfaceButton;
