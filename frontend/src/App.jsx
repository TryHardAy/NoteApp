import { React, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import Profile from "./components/Profile"; 
import './App.css';
import Menu from "./components/Menu";
import SearchInput from "./components/SearchInput";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Editor from "./components/Editor";
import UserMenu from "./components/UserMenu";
import Form from "./components/CategoryForm";
import UserForm from "./components/UserForm";
import NotesList from "./components/NotesList";
import TagForm from "./components/ShareForm";



function App() {
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading, getAccessTokenSilently } = useAuth0();
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState([]); // Dodanie stanu notes
  if (isLoading) {
    return <div>Loading...</div>;
  }

   // Funkcja do pobierania notatek
   const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:5000/notes/1");
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData); // Aktualizuj stan notatek
      } else {
        console.error("Błąd pobierania notatek");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  };

  // Funkcja do dodania nowej notatki
  const uploadNote = async ({ title, content }) => {
    try {
      const accessToken = await getAccessTokenSilently();
      const userId = 1; // lub dynamicznie z Auth0

      const response = await fetch(`http://localhost:5000/note/create/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        console.error("Błąd podczas zapisu notatki");
      } else {
        console.log("Notatka zapisana");
        //fetchNotes();
        window.location.reload();
      }
    } catch (error) {
      console.error("Błąd przy pobieraniu tokena lub zapisie notatki:", error);
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (!file) return;
  
    const isHtml = file.type === "text/html";
    const isJson = file.type === "application/json";
  
    if (!isHtml && !isJson) {
      alert("Obsługiwane są tylko pliki HTML lub JSON.");
      return;
    }
  
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ""); // bez rozszerzenia
  
    let content;
    if (isHtml) {
      content = text;
    } else {
      try {
        content = JSON.parse(text);
      } catch (err) {
        alert("Błąd przy parsowaniu pliku JSON");
        return;
      }
    }
  
    await uploadNote({ title, content });
  };
  
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
                <div
                  className="large-white-box"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  {isDragging && <div className="drop-overlay show">Upuść plik tutaj</div>}
                  <Menu />
                  <SearchInput />
                  <NotesList notes={notes} fetchNotes={fetchNotes} /> {/* Przekazanie notes i fetchNotes do NotesList */}
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
<Route
  path="/share/:id"
  element={
    <div>
      {!isAuthenticated ? (
        <LoginButton />
      ) : (
        <div className="tag-form">
          <TagForm />
          <div className="large-white-box">
            <Menu />
            <SearchInput />
            <NotesList />
            <div className="profile">
              <Profile />
            </div>
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
