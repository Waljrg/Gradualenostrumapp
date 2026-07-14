const CACHE_NAME = 'graduale-nostrum-v1.0';

const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'Iconos/logo.png',
  'Iconos/gn.png',
  'Iconos/tiempos1.png',
  'Iconos/momentos.png',
  'Iconos/programados.png',
  'Iconos/favoritos.png'
];

// Instalación - Precarga de assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Graduale Nostrum: Cache precargado con éxito');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación - Limpieza de caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache obsoleto:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ==================== ESTRATEGIA PRINCIPAL: CACHE FIRST ====================
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  
  // Excluir APIs externas (Firebase, Supabase, etc.)
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('supabase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('cdn.jsdelivr.net')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {

        // Si existe en caché → devolverlo inmediatamente (rápido)
        if (cachedResponse) {
          // Actualizar en segundo plano si hay conexión
          if (navigator.onLine) {
            fetch(event.request)
              .then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                  cache.put(event.request, networkResponse.clone());
                }
              })
              .catch(() => {}); // Silencioso si falla
          }
          return cachedResponse;
        }

        // Si NO está en caché → intentar red
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback offline
            if (event.request.destination === 'document') {
              return caches.match('index.html') || caches.match('./');
            }
            return new Response('Sin conexión', { 
              status: 503, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });

      });
    })
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cantos') {
    console.log('🔄 Sincronizando cantos...');
  }
});

// Push Notifications
self.addEventListener('push', event => {
  try {
    const data = event.data ? event.data.json() : { title: 'Graduale Nostrum', body: 'Nueva actualización disponible' };
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'Iconos/logo.png',
        badge: 'Iconos/logo.png'
      })
    );
  } catch (error) {
    console.error('❌ Error al procesar Push Notification:', error);
  }
});
