import { React, useState, useEffect, use } from "react";
//import { useAuth0 } from "@auth0/auth0-react";
//import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
//import Profile from "./components/Profile"; 
import './App.css';
import Menu from "./components/Menu";
import SearchInput from "./components/SearchInput";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Editor from "./components/Editor";
import UserMenu from "./components/UserMenu";
import Form from "./components/CategoryForm";
import UserForm from "./components/UserForm";
import NotesList from "./components/NotesList";
import Keycloak from "keycloak-js";
//import TagForm from "./components/ShareForm";
//import { useState } from "react";
import Profile from "./components/Profile";

function App() {
  //const { isAuthenticated, user, loginWithRedirect, logout, isLoading, getAccessTokenSilently } = useAuth0();
  //const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userId, setUserId] = useState(null);
  const [keycloak, setKeycloak] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // <-- nowy stan

  

  useEffect(() => {
    const storedKC = localStorage.getItem("keycloak");
    const val = JSON.parse(storedKC) ? storedKC : null;

    if (val === null) {
      setKeycloak(new Keycloak({
        url: "http://localhost:8080",
        realm: "NoteAppRealm",
        clientId: "client",
      }));
    }
    else setKeycloak(val);
  }, []);

  useEffect(() => {
    localStorage.setItem("keycloak", JSON.stringify(keycloak));
  
    if (keycloak === null) return;
    if (keycloak.authenticated) return;
  
    keycloak.init({ onLoad: 'login-required' }).then(async authenticated => {
      if (authenticated) {
        console.log("Authenticated!", keycloak.token);
        console.log("Authenticated = ", authenticated);
  
        // 🔹 WYCIĄGANIE DANYCH Z TOKENA
        const user = keycloak.tokenParsed;
        const mappedUser = {
        firstName: user.given_name,
        lastName: user.family_name,
        email: user.email,
};
setUserInfo(mappedUser);
        console.log("Dane użytkownika z tokena:", user);
        
        setUserInfo(user); // <- zapisujemy do stanu
        
        // 🔹 LOGOWANIE PO STRONIE BACKENDU
        const response = await fetch(`http://localhost:5000/user/login/${keycloak.token}`, {
          method: "GET",
          headers: {  
            "Content-Type": "application/json" 
          },
        });
  
        const data = await response.json(); // <- poprawka: await json()
        setUserId(data.id); // <- zakładamy, że backend zwraca { id: ... }
      }
    });
  }, [keycloak]);
  
 /* useEffect(() => {
    //console.log("Keycloak instance:", keycloak.authenticated);

  }, []);*/

  
  //keycloak.logout()
  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };
  console.log("Keycloak instance:", keycloak);
  const [isDragging, setIsDragging] = useState(false);
  const [notes, setNotes] = useState([]); // Dodanie stanu notes
  //if (keycloak === null) {
  // return <div>Loading...</div>;
  //}

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
      const userId = 1; // lub dynamicznie z Auth0

      const response = await fetch(`http://localhost:5000/note/create/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  
  // wersja ręczna
  /*const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (!file) return;
  
    const isHtml = file.type === "text/html";
  
    if (!isHtml) {
      alert("Plik musi być w formacie HTML");
      return;
    }
  
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ""); // bez rozszerzenia
  
    let content;
  
    try {
      // Simple regex check to see if there are any unclosed tags
      const invalidTagRegex = /<([a-zA-Z0-9]+)(?=[^>]*?)(?!<\/\1>)[^>]*?>/g;
      const invalidTags = text.match(invalidTagRegex);
  
      if (invalidTags) {
        // If there are any unclosed or malformed tags, alert the user
        alert("Błąd: Plik HTML ma uszkodzoną strukturę. Formatowanie może być nieprawidłowe.");
        content = text; // You can still store the original HTML content
      } else {
        // Parse the HTML using DOMParser for further checking
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");
  
        // Check if the document has a parsererror element, indicating parsing issues
        if (doc.getElementsByTagName("parsererror").length > 0) {
          alert("Błąd: Plik HTML ma uszkodzoną strukturę. Formatowanie może być nieprawidłowe.");
          content = text; // If there's a parsererror, store the raw HTML
        } else {
          content = text; // HTML is considered valid, proceed with the content
        }
      }
    } catch (err) {
      alert("Błąd przy parsowaniu pliku HTML.");
      return;
    }
  
    await uploadNote({ title, content });
  };*/

  // wersja z biblioteką jeśki bład to nie zapisuje pliku
  /*const validateHTMLWithW3C = async (htmlContent) => {
    const response = await fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      body: htmlContent,
    });
  
    const result = await response.json();
    if (result.messages.length > 0) {
      alert("Błąd: Plik HTML ma uszkodzoną strukturę. Formatowanie może być nieprawidłowe.");
      console.log(result.messages); // Validation errors
    } else {
      console.log("HTML is valid.");
    }
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (!file) return;
  
    const isHtml = file.type === "text/html";
  
    if (!isHtml) {
      alert("Plik musi być w formacie HTML");
      return;
    }
  
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ""); // without the file extension
  
    // Validate HTML using W3C API
    await validateHTMLWithW3C(text);
  };*/
  
  // wersja z biblioteka pozwalajaca zapisac uszkodzony plik
  const validateHTMLWithW3C = async (htmlContent) => {
    // Check if the HTML content starts with <!DOCTYPE html>
    const startsWithDoctype = htmlContent.trim().toLowerCase().startsWith("<!doctype html>");

    // If it doesn't start with <!DOCTYPE html>, wrap it in a full HTML structure
    const fullHTML = startsWithDoctype
      ? htmlContent // If the content is already full HTML, use it as is
      : `
        <!DOCTYPE html>
        <html lang="pl">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HTML Validation</title>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `;
    
    const response = await fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      body: fullHTML, // Send either full HTML or just the original content
    });
  
    const result = await response.json();
    if (result.messages.length > 0) {
      alert("Błąd: Plik HTML ma uszkodzoną strukturę. Formatowanie może być nieprawidłowe.");
      console.log(result.messages); // Validation errors
      return false; // Return false indicating that validation failed
    } else {
      console.log("HTML is valid.");
      return true; // Return true indicating that validation passed
    }
  };

  /*// wersja do debugowania z wyswietlaniem logw walidatora (trzeba zablokowac przeladowanie okna przegladark)
  const validateHTMLWithW3C = async (htmlContent) => {
    const startsWithDoctype = htmlContent.trim().toLowerCase().startsWith("<!doctype html>");
  
    // If it doesn't start with <!DOCTYPE html>, wrap it in a full HTML structure
    const fullHTML = startsWithDoctype
      ? htmlContent
      : `<!DOCTYPE html>
          <html lang="pl">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>HTML Validation</title>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>`;
  
    const response = await fetch("https://validator.w3.org/nu/?out=json", {
      method: "POST",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      body: fullHTML, 
    });
  
    const result = await response.json();
  
    console.log("W3C Validator Response:", result);
  
    // Check if the 'messages' array contains any errors
    if (result.messages && result.messages.length > 0) {
      console.log("Found validation errors:");
  
      // Loop through the errors and display them one by one
      result.messages.forEach((message, index) => {
        console.log(`Error ${index + 1}:`);
        console.log(`Message: ${message.message}`);
        console.log(`Type: ${message.type}`);
        console.log(`Line: ${message.lastLine}`);
        console.log(`Column: ${message.lastColumn}`);
        console.log("---------------------------");
      });
  
      return false;
    } else {
      console.log("HTML is valid.");
      return true;
    }
  };*/
  
  
  const handleFileDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
  
    const file = e.dataTransfer.files[0];
    if (!file) return;
  
    const isHtml = file.type === "text/html";
  
    if (!isHtml) {
      alert("Plik musi być w formacie HTML");
      return;
    }
  
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ""); // without the file extension
  
    // Validate HTML using W3C API
    const isValid = await validateHTMLWithW3C(text);
  
    // Regardless of validation, upload the note
    await uploadNote({ title, content: text });
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

  

  

  return (<>{keycloak === null ?(<div>Loading...</div>)
  : (
    <Router>
      <Routes>
      <Route
          path="/"
          element={
            <div>
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
                  <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                  <NotesList searchTerm={searchTerm} notes={notes} fetchNotes={fetchNotes} /> {/* Przekazanie notes i fetchNotes do NotesList */}
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />
                  }
                  </div>
                  <button onClick={fetchUsers}>Fetch Users</button>
                </div>
                {userInfo && (
  <div className="user-info">
    <h3>Dane użytkownika:</h3>
    <p>Imię: {userInfo.given_name}</p>
    <p>Nazwisko: {userInfo.family_name}</p>
    <p>Email: {userInfo.email}</p>
    <p>Login: {userInfo.preferred_username}</p>
  </div>
)}
                <div>
                  <LogoutButton kc = { keycloak }/>
                </div>
            </div>
          }
        />
        <Route
          path="/editor" 
          element={
            <div>
                <div className="large-white-box">
                  <Menu />
                  <Editor />
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />}
                  </div>
                </div>
            </div>
          }
        />
        <Route
          path="/editor/:id" 
          element={
            <div>
                <div className="large-white-box">
                  <Menu />
                  <Editor />
                  
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />}
                  </div>
                </div>
            </div>
          }
        />

        {/*<Route path="/users" element={<Users />} />*/}
        <Route
          path="/users" 
          element={
            <div>
                <div className="large-white-box">
                  <Menu />
                  <UserMenu/>
                  <SearchInput/>
                  
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />}
                  </div>
                </div>
            </div>
          }
        />
        <Route
          path="/NewUser" 
          element={
            <div>
                <div className="large-white-box">
                    <Menu />
                    <UserMenu/>
                    <UserForm/>
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />}
                  </div>
                </div>
            </div>
          }
        />
        <Route
          path="/categories" 
          element={
            <div>
                <div className="large-white-box">
                    <Menu />
                    <UserMenu/>
                    <Form/>
                  <div className="profile">
                    {<Profile userData={userInfo} 
                    />}
                  </div>
                </div>
            </div>
          }
        />
      </Routes>
    </Router>
  )}
    </>
  );
}

export default App;