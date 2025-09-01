// Service Worker for Eko PWA
const CACHE_NAME = 'eko-app-v1.0.0';
const STATIC_CACHE = 'eko-static-v1.0.0';
const DYNAMIC_CACHE = 'eko-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/robots.txt'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('🌴 Eko Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🌴 Eko Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event - cache strategy
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve from cache and update cache in background
        fetch(event.request).then((response) => {
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
        }).catch(() => {
          // Offline - cache is already serving
        });
        return cachedResponse;
      }

      // Fetch new request and cache it
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (response.status !== 200) {
          return response;
        }

        // Cache successful responses
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      }).catch(() => {
        // Network failed - serve fallback for specific routes
        return handleOfflineFallback(event.request);
      });
    })
  );
});

// Handle offline fallbacks
function handleOfflineFallback(request) {
  if (request.url.includes('/')) {
    // Return a simple offline page or redirect to home
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Eko - Offline</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: black;
              color: #00ff00;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
              border: 1px solid #00ff00;
            }
            h1 { color: #00ff00; }
            p { opacity: 0.8; }
          </style>
        </head>
        <body>
          <h1>🌴 You're Offline</h1>
          <p>Eko is working offline!</p>
          <p>Connect to the internet for live messaging.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for when connection returns
self.addEventListener('sync', (event) => {
  console.log('🌴 Eko Service Worker: Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Sync any pending data
  console.log('🌴 Eko: Performing background sync');
}

// Push notifications (optional - would need server setup)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.json().body || 'New message in Eko!',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      primaryKey: 1,
      action: 'open-chat'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Eko',
        icon: '/logo192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🌴 Eko', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const url = '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
