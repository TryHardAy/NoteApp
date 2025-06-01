import React, { createContext, useContext, useEffect, useState } from "react";
import keycloak from "./keycloak";
import { ApiCall } from "./ApiHandler";

const AuthContext = createContext();

export const useUser = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const initializedKeycloak = async () => {
      if (!keycloak.didInitialize) {
        console.log(keycloak.didInitialize);
        console.log("Inicjalizuje", keycloak);
        await keycloak.init({ 
          onLoad: "login-required", 
          checkLoginIframe: false,
          pkceMethod: 'S256',
        }).then(async auth => {
          if (auth) {
            try {
              const response = await ApiCall({
                method: "GET",
                url: "/user/login",
              });
              console.log("USER ZALOGOWANY", response);
              setUser(response);
              setAuthenticated(true);
            } catch (e) {
              console.error("GET /user/login ", e);
              // setAuthenticated(false);
              // setHasToRelog(true);
              // await keycloak.logout();
              // keycloak.login();
            }
          } else {
            // setAuthenticated(false);
            // setHasToRelog(true);
            // keycloak.login();
          }
        })
      } else {
        // const response = await ApiCall({
        //   method: "GET",
        //   url: "/user/login",
        // });
        // console.log("USER ZALOGOWANY", response);
        // setUser(response);
      }
      setAuthenticated(true);
    }
    initializedKeycloak();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {authenticated && user ? children : <div>Ładowanie...</div>}
    </AuthContext.Provider>
  );
};


