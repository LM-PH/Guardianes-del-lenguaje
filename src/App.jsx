import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome'
import CharacterCreation from './pages/CharacterCreation'
import MainMap from './pages/MainMap'
import Battle from './pages/Battle'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Certificate from './pages/Certificate'
import Ranking from './pages/Ranking'
import Shop from './pages/Shop'
import Inventory from './pages/Inventory'
import SaveIndicator from './components/SaveIndicator'
import './index.css'

function App() {
  return (
    <Router>
      <SaveIndicator />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/create" element={<CharacterCreation />} />
        <Route path="/map" element={<MainMap />} />
        <Route path="/battle" element={<Battle />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/admin/preguntas" element={<Admin />} />
      </Routes>
    </Router>
  )
}

export default App
