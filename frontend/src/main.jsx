import React from 'react';
import ReactDOM from 'react-dom/client'; // Import ReactDOM
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App'; // Import component App

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}