import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { triggerSaveEvent } from '../components/SaveIndicator'
import { AuthContext } from '../context/AuthContext'

function Inventory() {
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

  const equipItem = async (item) => {
    try {
      triggerSaveEvent('saving')
      const res = await authenticatedFetch(`/api/store/${userId}/equip`, {
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

  if (!player || !catalog) return <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>Cargando Inventario...</div>

  // Helper to map IDs back to their catalog items for display
  const getOwnedItems = () => {
    let ownedIds = []
    let currentEquipped = null

    if (activeTab === 'skins') {
      ownedIds = player.inventory?.ownedSkins || []
      currentEquipped = player.inventory?.equippedSkin
    }
    if (activeTab === 'pets') {
      ownedIds = player.inventory?.ownedPets || []
      currentEquipped = player.inventory?.equippedPet
    }
    if (activeTab === 'titles') {
      ownedIds = player.inventory?.ownedTitles || []
      currentEquipped = player.inventory?.equippedTitle
    }
    
    // Add default options if they don't exist in catalog strictly
    const baseItems = catalog[activeTab] || []
    const ownedItems = baseItems.filter(i => ownedIds.includes(i.id))
    
    if (activeTab === 'skins') {
      ownedItems.unshift({ id: 'default', name: 'Ropa Casual', sprite: player.character?.gender === 'boy' ? '👦' : '👧', rarity: 'Básica' })
    }

    return { ownedItems, currentEquipped }
  }

  const { ownedItems, currentEquipped } = getOwnedItems()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#2b2b2b', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, textShadow: '2px 2px #000' }}>🎒 Mi Inventario</h1>
        <div className="rpg-box" style={{ padding: '10px' }}>
          Equipado: <strong>{currentEquipped || 'Ninguno'}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'skins' ? '#ffeb3b' : '', color: activeTab === 'skins' ? '#000' : '' }} onClick={() => setActiveTab('skins')}>Trajes</button>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'pets' ? '#ffeb3b' : '', color: activeTab === 'pets' ? '#000' : '' }} onClick={() => setActiveTab('pets')}>Mascotas</button>
        <button className="btn-retro" style={{ backgroundColor: activeTab === 'titles' ? '#ffeb3b' : '', color: activeTab === 'titles' ? '#000' : '' }} onClick={() => setActiveTab('titles')}>Títulos</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {ownedItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            No tienes items de este tipo. Visita la tienda.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {ownedItems.map(item => {
              const isEquipped = currentEquipped === item.id
              return (
                <div key={item.id} className="rpg-box" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  border: isEquipped ? '4px solid #4caf50' : '4px solid #000'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{item.sprite || '📜'}</div>
                  <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#ffeb3b', margin: '5px 0' }}>{item.rarity}</div>
                  
                  <button 
                    className={`btn-retro ${isEquipped ? 'success' : ''}`}
                    style={{ marginTop: '10px', width: '100%' }}
                    onClick={() => equipItem(item)}
                    disabled={isEquipped}
                  >
                    {isEquipped ? 'Equipado ✅' : 'Equipar'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '20px' }}>
        <button className="btn-retro" onClick={() => navigate('/shop')}>🏪 Ir a la Tienda</button>
        <button className="btn-retro success" onClick={() => navigate('/map')}>🗺️ Volver al Mapa</button>
      </div>

    </div>
  )
}

export default Inventory
