import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function isIp(addr) {
  return /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(addr)
}

export default function Home() {
  const [geo, setGeo] = useState(null)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadClientGeo()
    const saved = JSON.parse(localStorage.getItem('search_history') || '[]')
    setHistory(saved)
  }, [])

  async function loadClientGeo() {
    try {
      const res = await axios.get('https://ipinfo.io/geo')
      setGeo(res.data)
    } catch (e) {
      setError('Could not fetch client geo')
    }
  }

  async function search(e) {
    e && e.preventDefault()
    setError('')
    if (!isIp(query)) return setError('Please enter a valid IPv4 address')
    try {
      const res = await axios.get(`https://ipinfo.io/${query}/geo`)
      setGeo(res.data)
      const newHist = [ { ip: query, data: res.data, id: Date.now() }, ...history ]
      setHistory(newHist)
      localStorage.setItem('search_history', JSON.stringify(newHist))
    } catch (e) {
      setError('Failed to fetch geo for that IP')
    }
  }

  function clear() {
    setQuery('')
    loadClientGeo()
  }

  function loadFromHistory(item) {
    setGeo(item.data)
  }

  function removeSelected() {
    const remaining = history.filter(h => !h.checked)
    setHistory(remaining)
    localStorage.setItem('search_history', JSON.stringify(remaining))
  }

  function toggleCheck(idx) {
    const copy = [...history]
    copy[idx].checked = !copy[idx].checked
    setHistory(copy)
    localStorage.setItem('search_history', JSON.stringify(copy))
  }

  const coords = geo?.loc?.split(',').map(Number)

  function Recenter({ center }) {
    const map = useMap()
    useEffect(() => {
      if (center && map) {
        map.setView(center, 10)
      }
    }, [center, map])
    return null
  }

  return (
    <div className="container">
      <header>
        <h1>Home</h1>
        <div>Logged as: {JSON.parse(localStorage.getItem('user')||'{}').email}</div>
        <button className="primary" onClick={() => { localStorage.clear(); window.location.href='/login' }}>Logout</button>
      </header>

      <main>
        <section className="left">
          <form onSubmit={search} className="search-form">
            <div className="input-wrap">
              <input value={query} type="text" onChange={e=>setQuery(e.target.value)} placeholder="Enter IPv4 address" />
            </div>
            <div className="button-row">
              <button type="submit" className="primary">Search</button>
              <button type="button" onClick={clear} className="secondary">Clear</button>
            </div>
          </form>
          {error && <div className="error">{error}</div>}

          {geo && (
            <div className="card info">
              <h3>IP & Geolocation Info</h3>
              <table className="info-table">
                <tbody>
                  <tr>
                    <td>IP</td>
                    <td>{geo.ip || geo.hostname || '-'}</td>
                  </tr>
                  <tr>
                    <td>City</td>
                    <td>{geo.city || '-'}</td>
                  </tr>
                  <tr>
                    <td>Region</td>
                    <td>{geo.region || '-'}</td>
                  </tr>
                  <tr>
                    <td>Country</td>
                    <td>{geo.country || '-'}</td>
                  </tr>
                  <tr>
                    <td>Loc</td>
                    <td>{geo.loc || '-'}</td>
                  </tr>
                  <tr>
                    <td>Org</td>
                    <td>{geo.org || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="card info">
            <div className="card-header">
              <h3>Search History</h3>
              {history.some(h => h.checked) && (
                <button className='danger' onClick={removeSelected}>Delete selected</button>
              )}
            </div>
            <ul className="history">
              {history.map((h, i) => (
                <li key={h.id}>
                  <input type="checkbox" checked={!!h.checked} onChange={()=>toggleCheck(i)} />
                  <button className="link" onClick={()=>loadFromHistory(h)}>{h.ip}</button>
                </li>
              ))}
              {!history.length && <li className="muted">No history</li>}
            </ul>
          </div>
        </section>

        <section className="right">
          <div className="mapCard">
            {coords ? (
              <MapContainer center={coords} zoom={10} style={{ height: '400px', width: '100%' }}>
                <Recenter center={coords} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={coords}>
                  <Popup>{geo.city}, {geo.region}</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="muted">Map unavailable</div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
