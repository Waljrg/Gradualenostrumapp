
const CACHE_NAME = 'graduale-v2026-v1'; // Cambia el v1 cuando hagas cambios grandes
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Iconos/logo.png',
  './Iconos/fondo.png',
  './Iconos/gn.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&display=swap'
];

// 1. Instalación: Guarda los archivos esenciales de inmediato
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache abierto y recursos guardados');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Fuerza a que el nuevo SW tome el control de inmediato
});

// 2. Activación: Limpia versiones viejas de caché automáticamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Estrategia: Stale-While-Revalidate (La mejor para PWAs profesionales)
// Carga desde el caché instantáneamente, pero busca actualizaciones en red en segundo plano
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Si la respuesta es válida, guarda una copia actualizada en el caché
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        // Retorna el caché si existe, si no, espera a la red
        return response || fetchPromise;
      });
    })
  );
});
