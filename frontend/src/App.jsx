import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile"; // Import the Profile component
import './App.css';
import Menu from "./components/Menu";
import SearchInput from "./components/SearchInput";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Editor from "./components/Editor";


function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {!isAuthenticated ? (
                <LoginButton />
              ) : (
                <div className="large-white-box">
                  <Menu />
                  <SearchInput />

                  <div className="profile">
                    <Profile />
                  </div>
                </div>
              )}
            </div>
          }
        />
        <Route
          path="/editor" 
          element={
            <div>
              {!isAuthenticated ? (
                <LoginButton />
              ) : (
                <div className="large-white-box">
                  <Menu />
                  <Editor />
                  
                  <div className="profile">
                    <Profile />
                  </div>
                </div>
              )}
            </div>
          }
        />
        {/*<Route path="/users" element={<Users />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
