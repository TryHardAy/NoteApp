import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/UserProfile"; // Import the Profile component
import './App.css';
import Menu from "./components/Menu";
import SearchInput from "./components/SearchInput";
function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <div>
          <Menu/>

        {!isAuthenticated ? (
          <LoginButton />
        ) : (
          <div className="large-white-box">
                      <SearchInput/>
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
