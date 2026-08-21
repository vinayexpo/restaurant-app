import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import { LocateFixed, Loader2 } from 'lucide-react'

const pinIcon = L.divIcon({
  className: '',
  html: `<span style="display:block;width:20px;height:20px;border-radius:9999px 9999px 9999px 0;background:#F97316;border:2px solid white;transform:rotate(45deg);box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
})

const DEFAULT_CENTER = [20.5937, 78.9629] // India, used only until a location is picked

async function reverseGeocode(lat, lng) {
  // zoom=18 requests building-level detail (the most precise Nominatim supports) so the
  // returned postcode matches the pinned point rather than a larger enclosing area.
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`,
    { headers: { Accept: 'application/json' } }
  )
  if (!res.ok) throw new Error('Reverse geocoding failed')
  return res.json()
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng])
    },
  })
  return null
}

/**
 * onChange receives { latitude, longitude, address_line1, city, state, pincode }
 * whenever the pin moves and reverse geocoding resolves.
 */
export function LocationPicker({ onChange, initialPosition }) {
  const [position, setPosition] = useState(initialPosition ?? null)
  const [locating, setLocating] = useState(false)
  const [resolving, setResolving] = useState(false)
  const requestIdRef = useRef(0)

  const applyPosition = async (pos) => {
    const requestId = ++requestIdRef.current
    setPosition(pos)
    setResolving(true)
    try {
      const data = await reverseGeocode(pos[0], pos[1])
      if (requestId !== requestIdRef.current) return
      const addr = data.address ?? {}
      onChange({
        latitude: pos[0],
        longitude: pos[1],
        address_line1: [addr.house_number, addr.road].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '',
        city: addr.city || addr.town || addr.village || addr.suburb || '',
        state: addr.state || '',
        pincode: addr.postcode || '',
      })
    } catch {
      if (requestId !== requestIdRef.current) return
      onChange({ latitude: pos[0], longitude: pos[1] })
      toast.error('Could not look up that address. You can still fill the fields manually.')
    } finally {
      if (requestId === requestIdRef.current) setResolving(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location detection is not supported on this device.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        applyPosition([pos.coords.latitude, pos.coords.longitude])
      },
      () => {
        setLocating(false)
        toast.error('Could not detect your location. Please allow location access or set it on the map.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (!initialPosition) detectLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase text-neutral-400">Pin your location</p>
        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600 disabled:opacity-60"
        >
          {locating ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
          {locating ? 'Detecting…' : 'Use current location'}
        </button>
      </div>

      <div className="relative h-48 overflow-hidden rounded-lg border border-neutral-200">
        <MapContainer
          center={position ?? DEFAULT_CENTER}
          zoom={position ? 16 : 5}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={applyPosition} />
          {position && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => applyPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]),
              }}
            />
          )}
        </MapContainer>
        {resolving && (
          <div className="absolute inset-x-0 bottom-0 bg-white/90 px-2 py-1 text-center text-[11px] text-neutral-500">
            Looking up address…
          </div>
        )}
      </div>
      <p className="text-[11px] text-neutral-400">
        Tap the map or drag the pin to fine-tune the exact spot. The address fields below are auto-filled as a starting
        point — please double-check them, especially the pincode, before saving.
      </p>
    </div>
  )
}
