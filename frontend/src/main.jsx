import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')).render(
  <Auth0Provider
    domain="dev-r42s3taej0vvgom1.eu.auth0.com"
    clientId="zAuDO7KS5MV1PGFOe4bws6WPquILzBi5"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
  <StrictMode>
    <App />
  </StrictMode>
  </Auth0Provider>,
)
