// Service Worker for PWA
const CACHE_NAME = "rehab-app-v1"
const urlsToCache = [
  "/",
  "/dashboard",
  "/login",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || "재활운동 알림"
  const options = {
    body: data.body || "운동 시간입니다!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    tag: "exercise-notification",
    requireInteraction: true,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow("/dashboard")
  )
})

