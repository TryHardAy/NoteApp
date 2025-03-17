import React from "react";
import { Link } from 'react-router-dom';

const UserInterfaceButton = ({ label, url }) => {
  /*const handleClick = () => {
    window.location.href = url; 
  };*/

  return (
    <Link to={url}>
      <button className="UserInterfaceButton">
        {label}
      </button>
    </Link>
  );
};

export default UserInterfaceButton;
