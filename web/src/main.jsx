import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import './styles.css'

function App() {
  const isAuth = !!localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={isAuth ? <Home /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
