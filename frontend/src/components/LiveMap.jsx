import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const COLORS = {
  restaurant: '#F97316',
  rider: '#2563EB',
  customer: '#16A34A',
}

const dotIcon = (color) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px ${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }
    map.fitBounds(points, { padding: [40, 40] })
  }, [map, JSON.stringify(points)])

  return null
}

/**
 * markers: [{ id, position: [lat, lng], type: 'restaurant' | 'rider' | 'customer', label }]
 */
export function LiveMap({ markers, height = 160 }) {
  const validMarkers = markers.filter((m) => Number.isFinite(m.position?.[0]) && Number.isFinite(m.position?.[1]))
  const points = validMarkers.map((m) => m.position)
  const mapRef = useRef(null)

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400"
        style={{ height }}
      >
        Waiting for location…
      </div>
    )
  }

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg">
      <MapContainer
        ref={mapRef}
        center={points[0]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {validMarkers.map((m) => (
          <Marker key={m.id} position={m.position} icon={dotIcon(COLORS[m.type] ?? '#525252')}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
