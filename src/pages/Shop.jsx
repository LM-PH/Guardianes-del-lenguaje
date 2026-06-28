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
              <div style={{ fontWeight: 'bold', textAlign: 'center', color: '#000' }}>{item.name}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#fff', 
                backgroundColor: item.rarity === 'Legendario' ? '#e91e63' : (item.rarity === 'Épico' ? '#9c27b0' : '#4caf50'),
                padding: '2px 8px',
                borderRadius: '10px',
                margin: '5px 0',
                border: '1px solid #000',
                fontWeight: 'bold'
              }}>
                {item.rarity}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', color: '#000' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#2b2b2b', color: '#fff', height: '100vh', overflow: 'hidden' }}>
      
      {/* HEADER: MOSTRADOR Y VENDEDOR (ESTILO POKÉMON) */}
      <div style={{ flex: '0 0 45%', backgroundColor: '#f8f8f8', borderBottom: '4px solid #111', display: 'flex', flexDirection: 'column', backgroundImage: 'linear-gradient(#e0e0e0 1px, transparent 1px)', backgroundSize: '100% 20px', fontFamily: '"Press Start 2P", cursive', padding: '10px' }}>
        
        {/* Top Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="rpg-box" style={{ margin: 0, padding: '10px', display: 'inline-block' }}>
            <span style={{ fontSize: '0.8rem', color: '#000' }}>TIENDA LINGO</span>
          </div>
          <div className="rpg-box" style={{ margin: 0, padding: '10px', display: 'inline-block' }}>
            <span style={{ fontSize: '0.8rem', color: '#000' }}>💰 {player.lingocoins} LC</span>
          </div>
        </div>

        {/* Mostrador y Vendedor */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', position: 'relative' }}>
          {/* Vendedor animado */}
          <div className="sprite-walk-front" style={{ width: '80px', height: '80px', backgroundImage: `url('/sprites/shopkeeper.png')`, backgroundSize: '400% 100%', imageRendering: 'pixelated', position: 'relative', zIndex: 1, marginBottom: '20px' }}></div>
          {/* El Mostrador */}
          <div style={{ position: 'absolute', bottom: '0', width: '200px', height: '40px', backgroundColor: '#8d6e63', borderTop: '4px solid #5d4037', borderLeft: '4px solid #5d4037', borderRight: '4px solid #5d4037', zIndex: 2, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
        </div>

        {/* Diálogo del Vendedor */}
        <div className="rpg-box" style={{ margin: 0, marginTop: '10px', padding: '10px', height: '60px', display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#000', lineHeight: '1.4' }}>
            ¡Hola! Tenemos los mejores artículos. ¿Qué vas a llevar hoy?
          </p>
        </div>
      </div>

      {/* FOOTER: CATÁLOGO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--gbc-white)', padding: '10px', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
          <button className="btn-retro" style={{ margin: 0, backgroundColor: activeTab === 'skins' ? '#ffeb3b' : '', color: activeTab === 'skins' ? '#000' : '' }} onClick={() => setActiveTab('skins')}>Trajes</button>
          <button className="btn-retro" style={{ margin: 0, backgroundColor: activeTab === 'pets' ? '#ffeb3b' : '', color: activeTab === 'pets' ? '#000' : '' }} onClick={() => setActiveTab('pets')}>Mascotas</button>
          <button className="btn-retro" style={{ margin: 0, backgroundColor: activeTab === 'titles' ? '#ffeb3b' : '', color: activeTab === 'titles' ? '#000' : '' }} onClick={() => setActiveTab('titles')}>Títulos</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
          {renderCatalogList()}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '10px' }}>
          <button className="btn-retro" style={{ margin: 0, backgroundColor: '#9e9e9e' }} onClick={() => navigate('/inventory')}>🎒 INVENTARIO</button>
          <button className="btn-retro" style={{ margin: 0, backgroundColor: '#f44336' }} onClick={() => navigate('/map')}>SALIR</button>
        </div>

      </div>

    </div>
  )
}

export default Shop
