import { useEffect, useState } from 'react'
import { pushService } from '../services/pushService'
import { subscribeToRealtimeChannel } from '../lib/echo'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window

export function usePushNotifications() {
  const [permission, setPermission] = useState(isSupported ? Notification.permission : 'unsupported')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!isSupported) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setSubscribed(!!subscription))
      .catch(() => {})
  }, [])

  const enable = async () => {
    if (!isSupported) return false
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!publicKey) {
      throw new Error('Push notifications are not configured (missing VAPID key).')
    }
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return false

      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }))
      await pushService.subscribe(subscription.toJSON())
      setSubscribed(true)
      return true
    } finally {
      setLoading(false)
    }
  }

  const disable = async () => {
    if (!isSupported) return false
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await pushService.unsubscribe(subscription.endpoint).catch(() => {})
        await subscription.unsubscribe()
      }
      setSubscribed(false)
      setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
      return true
    } finally {
      setLoading(false)
    }
  }

  return { permission, loading, enable, disable, isSupported, subscribed }
}

/**
 * Subscribe to the authenticated user's realtime notification channel.
 * Returns a cleanup function. Used by every role layout so owner / delivery /
 * admin panels get the same live behaviour as the customer layout.
 */
export function subscribeToUserNotifications(userId, { onNotification, onReconnect } = {}) {
  if (!userId) return () => {}

  return subscribeToRealtimeChannel(
    `App.Models.User.${userId}`,
    {
      '.notification.created': (notification) => {
        onNotification?.(notification)
        window.dispatchEvent(new CustomEvent('restaurantapp:notification', { detail: notification }))
      },
    },
    {
      onReconnect,
    }
  )
}
