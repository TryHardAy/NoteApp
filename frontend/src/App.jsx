import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/UserProfile"; // Import the Profile component
import './App.css';

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <div>
        <h1>Welcome to the bestest Note App</h1>

        {!isAuthenticated ? (
          <LoginButton />
        ) : (
          <div>
            <p>You're logged in!</p>
            {/* Render the LogoutButton */}
            <LogoutButton />
            {/* Render the Profile component */}
            <div className="profile">
            <Profile />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
