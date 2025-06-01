import Keycloak from "keycloak-js";

const url = process.env.REACT_APP_KEYCLOAK_URL;
const realm = process.env.REACT_APP_KEYCLOAK_REALM;
const client = process.env.REACT_APP_KEYCLOAK_CLIENT;

const keycloak = new Keycloak({
  url,
  realm,
  clientId: client,
});

export default keycloak;
