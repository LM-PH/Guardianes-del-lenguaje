import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { triggerSaveEvent } from '../components/SaveIndicator'
import { AuthContext } from '../context/AuthContext'

function Shop() {
  const navigate = useNavigate()
  const { userId, authenticatedFetch } = useContext(AuthContext)
  const [player, setPlayer] = useState(null)
  const [catalog, setCatalog] = useState(null)
  const [activeTab, setActiveTab] = useState('skins')

  useEffect(() => {
    if (!userId) return;
    authenticatedFetch(`/api/players/${userId}`)
      .then(res => res.json())
      .then(data => setPlayer(data))
      
    fetch('/api/store/catalog')
      .then(res => res.json())
      .then(data => setCatalog(data))
  }, [userId, authenticatedFetch])

  const buyItem = async (item) => {
    if (player.lingocoins < item.price) {
      alert('No tienes suficientes Lingocoins')
      return
    }
    
    if (confirm(`¿Comprar ${item.name} por ${item.price} Lingocoins?`)) {
      try {
        triggerSaveEvent('saving')
        const res = await authenticatedFetch(`/api/store/${userId}/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemType: activeTab, itemId: item.id })
        })
        const data = await res.json()
        if (res.ok) {
          setPlayer(data.player)
          triggerSaveEvent('saved')
        } else {
          alert(data.message)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  if (!player || !catalog) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Cargando Tienda...</div>

  const renderCatalogList = () => {
    const items = catalog[activeTab] || []
    
    // Checks para ver si ya lo tiene
    let ownedList = []
    if (activeTab === 'skins') ownedList = player.inventory?.ownedSkins || []
    if (activeTab === 'pets') ownedList = player.inventory?.ownedPets || []
    if (activeTab === 'titles') ownedList = player.inventory?.ownedTitles || []

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {items.map(item => {
          const isOwned = ownedList.includes(item.id)
          return (
            <div key={item.id} className="rpg-box" style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', 
              opacity: isOwned ? 0.6 : 1, filter: isOwned ? 'grayscale(100%)' : 'none' 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.sprite || '📜'}</div>
              <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#ffeb3b', margin: '5px 0' }}>{item.rarity}</div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                💰 {item.price}
              </div>
              
              <button 
                className="btn-retro" 
                style={{ marginTop: '10px', width: '100%' }}
                onClick={() => buyItem(item)}
                disabled={isOwned || player.lingocoins < item.price}
              >
                {isOwned ? 'Comprado' : 'Comprar'}
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#2b2b2b', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, textShadow: '2px 2px #000' }}>🏪 Tienda del Lenguaje</h1>
        <div className="rpg-box" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}>
          <span>Tus fondos:</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffeb3b' }}>💰 {player.lingocoins} LC</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'skins' ? '#ffeb3b' : '', color: activeTab === 'skins' ? '#000' : '' }} onClick={() => setActiveTab('skins')}>Trajes</button>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'pets' ? '#ffeb3b' : '', color: activeTab === 'pets' ? '#000' : '' }} onClick={() => setActiveTab('pets')}>Mascotas</button>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'titles' ? '#ffeb3b' : '', color: activeTab === 'titles' ? '#000' : '' }} onClick={() => setActiveTab('titles')}>Títulos</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderCatalogList()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '20px' }}>
        <button className="btn-retro" onClick={() => navigate('/inventory')}>🎒 Ir al Inventario</button>
        <button className="btn-retro success" onClick={() => navigate('/map')}>🗺️ Volver al Mapa</button>
      </div>

    </div>
  )
}

export default Shop
