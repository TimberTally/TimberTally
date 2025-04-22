// --- START OF FILE service-worker.js ---

// V IMPORTANT: Increment this version number with each update!
const CACHE_NAME = 'timber-tally-cache-v4'; // <--- CHANGE THIS

const urlsToCache = [
  // ... your list of URLs ...
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icon.png'
];

// --- Installation Event ---
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing new version...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell for new version');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] New version installation complete.');
        // DO NOT call self.skipWaiting() here automatically IF you want a user prompt.
        // Let the user decide via the UI prompt.
      })
      .catch(error => {
        console.error('[Service Worker] New version caching failed:', error);
      })
  );
});

// --- Activation Event ---
// (Your existing activate event to clean up old caches is good)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating new version...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation complete, old caches deleted.');
      // Take control of uncontrolled clients (like the current page)
      return self.clients.claim();
    })
  );
});

// --- Fetch Event ---
// (Your existing fetch event is fine - cache-first strategy)
self.addEventListener('fetch', event => {
   // ... your existing fetch logic ...
    if (event.request.method !== 'GET') {
        return;
    }
    event.respondWith(/* ... */);
});

// --- Message Event Listener (New!) ---
// Listen for messages from the client (page)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message. Activating new version immediately.');
    self.skipWaiting(); // Tell the waiting service worker to activate
  }
});

// --- END OF FILE service-worker.js ---
