import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import axios from 'axios'
import { store } from '../app/store'

window.Pusher = Pusher

let echoInstance = null

const broadcastAuthUrl = `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')}/broadcasting/auth`

export function getEcho() {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        const token = store.getState().auth.token
        axios
          .post(
            broadcastAuthUrl,
            { socket_id: socketId, channel_name: channel.name },
            { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
          )
          .then((response) => callback(false, response.data))
          .catch((error) => callback(true, error))
      },
    }),
  })

  return echoInstance
}

export function disconnectEcho() {
  echoInstance?.disconnect()
  echoInstance = null
}

/**
 * Keep channel setup consistent and refresh REST-backed views after a socket
 * reconnect, because broadcasts sent while offline cannot be replayed.
 */
export function subscribeToRealtimeChannel(channelName, listeners, { onReconnect, onError } = {}) {
  try {
    const echo = getEcho()
    const channel = echo.private(channelName)
    const connection = echo.connector?.pusher?.connection
    const refresh = () => onReconnect?.()
    const reportError = (error) => onError?.(error)

    Object.entries(listeners).forEach(([event, listener]) => channel.listen(event, listener))
    connection?.bind('connected', refresh)
    connection?.bind('error', reportError)
    connection?.bind('failed', reportError)
    connection?.bind('unavailable', reportError)

    return () => {
      connection?.unbind('connected', refresh)
      connection?.unbind('error', reportError)
      connection?.unbind('failed', reportError)
      connection?.unbind('unavailable', reportError)
      echo.leave(channelName)
    }
  } catch (error) {
    onError?.(error)
    return () => {}
  }
}

// Reconnect the authorizer whenever the auth token changes (login/logout).
store.subscribe(() => {
  const { isAuthenticated } = store.getState().auth
  if (!isAuthenticated && echoInstance) {
    disconnectEcho()
  }
})
