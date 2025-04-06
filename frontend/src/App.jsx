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
import UserMenu from "./components/UserMenu";
import Form from "./components/CategoryForm";
import UserForm from "./components/UserForm";
import NotesList from "./components/NotesList";
//import NotesList from "./components/NotesList";
import TagForm from "./components/ShareForm";
import { useState } from "react";

function App() {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading, getAccessTokenSilently } = useAuth0();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  /*const fetchUsers = async () => {
    if (!isAuthenticated) {
      console.log("User is not authenticated.");
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently({
        audience: `https://dev-r42s3taej0vvgom1.eu.auth0.com/api/v2/`, // Sprawdź swój audience
        scope: 'read:users', // Zakres dostępu
      });

      console.log("Access Token: ", accessToken);

      const response = await fetch('https://dev-r42s3taej0vvgom1.eu.auth0.com/api/v2/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error fetching users:", error);
        return;
      }

      const users = await response.json();
      console.log("Users:", users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };*/

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/users");
      if (response.ok) {
        const users = await response.json();
        console.log(users);
      } else {
        console.error("Error fetching users");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };  

  

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
                  <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                  <NotesList searchTerm={searchTerm} />
                  <div className="profile">
                    <Profile />
                  </div>
                  <button onClick={fetchUsers}>Fetch Users</button>
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
        <Route
          path="/editor/:id" 
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
        <Route
          path="/users" 
          element={
            <div>
              {!isAuthenticated ? (
                <LoginButton />
              ) : (
                <div className="large-white-box">
                  <Menu />
                  <UserMenu/>
                  <SearchInput/>
                  
                  <div className="profile">
                    <Profile />
                  </div>
                </div>
              )}
            </div>
          }
        />
        <Route
          path="/NewUser" 
          element={
            <div>
              {!isAuthenticated ? (
                <LoginButton />
              ) : (
                <div className="large-white-box">
                    <Menu />
                    <UserMenu/>
                    <UserForm/>
                  <div className="profile">
                    <Profile />
                  </div>
                </div>
              )}
            </div>
          }
        />
        <Route
          path="/categories" 
          element={
            <div>
              {!isAuthenticated ? (
                <LoginButton />
              ) : (
                <div className="large-white-box">
                    <Menu />
                    <UserMenu/>
                    <Form/>
                  <div className="profile">
                    <Profile />
                  </div>
                </div>
              )}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
