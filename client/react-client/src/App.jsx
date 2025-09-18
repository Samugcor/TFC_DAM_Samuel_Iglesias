import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LogIn from './LogIn';
import './styles/App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< LogIn/>} />
        <Route path="/home" element={< HomePage/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
