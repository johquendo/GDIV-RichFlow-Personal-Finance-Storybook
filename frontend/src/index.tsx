import React from 'react';
import { createRoot } from 'react-dom/client';
import Landing from './pages/Landing/Landing';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/login';
import Dashboard from './pages/Dashboard/Dashboard';
import { BrowserRouter } from 'react-router-dom';
import App from './App';


const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  );
}
