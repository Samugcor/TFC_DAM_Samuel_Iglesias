import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import LogIn from './components/LogIn';
import './styles/App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './components/HomePage';
import TimeLineEditor from './components/TimeLineEditor';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={< LogIn/>} />
        <Route path="/home" element={< HomePage/>} />
        <Route path='/timeline' element={<TimeLineEditor/>} />
        <Route path='/timeline/:timelineID' element={<TimeLineEditor/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
