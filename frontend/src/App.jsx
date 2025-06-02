import { React, useState, useEffect } from "react";
import './App.css';
import Menu from "./components/Menu";
import SearchInput from "./components/SearchInput";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Editor from "./components/Editor";
import UserMenu from "./components/UserMenu";
import Form from "./components/CategoryForm";
import UserForm from "./components/UserForm";
import NotesList from "./components/NotesList";
import Profile from "./components/Profile";
import UserList from "./components/UserList";
import CategoriesList from "./components/CategoryList";
import { ApiCall } from "./auth/ApiHandler";
import { useUser } from "./auth/AuthProvider";

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState([]);

  const handleSearchChange = (term) => setSearchTerm(term);

  const uploadNote = async ({ title, content }) => {
    try {
      await ApiCall({
        method: "POST",
        url: '/note/create',
        data: { title, content },
      });
      console.log("Notatka zapisana");
      window.location.reload();
    } catch (error) {
      console.error("Błąd przy zapisie notatki:", error);
    }
  };

  const validateHTMLWithW3C = async (htmlContent) => {
    const startsWithDoctype = htmlContent.trim().toLowerCase().startsWith("<!doctype html>");
    const fullHTML = startsWithDoctype
      ? htmlContent
      : `<!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HTML Validation</title></head><body>${htmlContent}</body></html>`;

    const response = await fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: fullHTML,
    });

    const result = await response.json();
    if (result.messages.length > 0) {
      alert("Błąd: Plik HTML ma uszkodzoną strukturę.");
      console.log(result.messages);
      return false;
    }
    return true;
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || file.type !== "text/html") {
      alert("Plik musi być w formacie HTML");
      return;
    }
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, "");
    const isValid = await validateHTMLWithW3C(text);
    if (isValid) await uploadNote({ title, content: text });
  };

  const NotAuthorized = () => (
    <div className="large-white-box">
      <Menu is_admin={user?.is_admin} />
      <h2>Brak dostępu</h2>
      <p>Nie masz uprawnień do wyświetlenia tej strony.</p>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
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
              <Menu is_admin={user?.is_admin} />
              <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              <div className="notes-container">
                <NotesList searchTerm={searchTerm} notes={notes} />
              </div>
              <div className="profile">
                <Profile userData={user} />
              </div>
            </div>
          }
        />

        <Route
          path="/editor"
          element={
            <div className="large-white-box">
              <Menu is_admin={user?.is_admin} />
              <Editor />
              <div className="profile">
                <Profile userData={user} />
              </div>
            </div>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <div className="large-white-box">
              <Menu is_admin={user?.is_admin} />
              <Editor />
              <div className="profile">
                <Profile userData={user} />
              </div>
            </div>
          }
        />

        <Route
          path="/users"
          element={
            user?.is_admin ? (
              <div className="large-white-box">
                <Menu is_admin={true} />
                <UserMenu />
                <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <div className="notes-container">
                  <UserList searchTerm={searchTerm} userId={user?.id} />
                </div>
                <div className="profile">
                  <Profile userData={user} />
                </div>
              </div>
            ) : <NotAuthorized />
          }
        />

        <Route
          path="/categories"
          element={
            user?.is_admin ? (
              <div className="large-white-box">
                <Menu is_admin={true} />
                <UserMenu />
                <Form />
                <div className="profile">
                  <Profile userData={user} />
                </div>
              </div>
            ) : <NotAuthorized />
          }
        />

        <Route
          path="/categoryList"
          element={
            user?.is_admin ? (
              <div className="large-white-box">
                <Menu is_admin={true} />
                <UserMenu />
                <CategoriesList />
                <div className="profile">
                  <Profile userData={user} />
                </div>
              </div>
            ) : <NotAuthorized />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
