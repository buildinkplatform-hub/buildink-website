self.addEventListener("push", (event) => {
  if (!event.data) return

  let payload = {
    title: "Buildink",
    body: "You have a new notification",
    icon: "/brand/buildink-logo.svg",
    badge: "/brand/buildink-logo.svg",
    tag: "buildink-notification",
    data: {
      notificationId: null,
      actionUrl: null,
    },
  }

  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const focused = windowClients.some(
          (client) => client.visibilityState === "visible",
        )
        if (focused) return undefined
        return self.registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          tag: payload.tag,
          data: payload.data,
        })
      }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const actionUrl = event.notification.data?.actionUrl
  if (!actionUrl || typeof actionUrl !== "string") return

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.navigate(actionUrl)
            return client.focus()
          }
        }
        return clients.openWindow(actionUrl)
      }),
  )
})

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        client.postMessage({ type: "PUSH_SUBSCRIPTION_CHANGED" })
      }
    }),
  )
})
