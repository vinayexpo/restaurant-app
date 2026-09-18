self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {}
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'RestaurantApp', body: event.data.text() }
  }
  const { title = 'RestaurantApp', body = '', data = {} } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const data = event.notification.data ?? {}
  const destination = data.url ?? data.path
  const orderId = data.order_id
  let url = orderId ? `/orders/${orderId}` : '/'

  if (typeof destination === 'string') {
    try {
      const parsed = new URL(destination, self.location.origin)
      if (parsed.origin === self.location.origin) url = `${parsed.pathname}${parsed.search}${parsed.hash}`
    } catch {
      // Use the safe order/home fallback for malformed notification data.
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
      return undefined
    })
  )
})
