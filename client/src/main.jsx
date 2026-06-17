/**
 * main.jsx — Application Entry Point
 *
 * This is the very first file Vite loads (referenced in index.html as
 * <script type="module" src="/src/main.jsx">).
 *
 * Its only job is to:
 *  1. Import React and ReactDOM
 *  2. Import the global stylesheet (index.css)
 *  3. Mount the root <App /> component into the <div id="root"> in index.html
 *
 * You should rarely need to edit this file. The one common reason to
 * change it is when adding a Router (e.g. React Router) so that the
 * whole app gets access to URL-based navigation — see the "Adding Pages"
 * guide in the README.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ReactDOM.createRoot targets the <div id="root"> in client/index.html
// StrictMode runs each component twice in development to catch bugs early
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
