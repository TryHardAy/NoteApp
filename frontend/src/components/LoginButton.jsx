import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "NoteAppRealm",
  clientId: "client",
});

keycloak.init({ onLoad: 'login-required' }).then(async authenticated => {
  if (authenticated) {
    console.log("Authenticated!", keycloak.token);
    const response = await fetch(`http://localhost:5000/user/login/${keycloak.token}`, {
      method: "GET",
      headers: {  
        "Content-Type": "application/json" 
      },
    });
    console.log("Response from backend:", response.json());
  }
});

//keycloak.logout()

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button onClick={() => loginWithRedirect()}>Log In</button>;
};

export default LoginButton;