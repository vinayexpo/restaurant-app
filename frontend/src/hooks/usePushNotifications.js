import { useEffect, useState } from 'react'
import { pushService } from '../services/pushService'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

const isSupported = 'serviceWorker' in navigator && 'PushManager' in window

export function usePushNotifications() {
  const [permission, setPermission] = useState(isSupported ? Notification.permission : 'unsupported')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isSupported) return
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  const enable = async () => {
    if (!isSupported) return
    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== 'granted') return

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      })
      await pushService.subscribe(subscription.toJSON())
    } finally {
      setLoading(false)
    }
  }

  const disable = async () => {
    if (!isSupported) return
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await pushService.unsubscribe(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setPermission(Notification.permission)
    } finally {
      setLoading(false)
    }
  }

  return { permission, loading, enable, disable, isSupported }
}
