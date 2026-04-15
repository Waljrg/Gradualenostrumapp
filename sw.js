const CACHE_NAME = 'graduale-v2026-v1'; 
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

// 1. Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activación
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Estrategia: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});

// ==========================================================
// NUEVO: SECCIÓN DE NOTIFICACIONES
// ==========================================================

// Escuchar cuando llega un mensaje desde el servidor (Push)
self.addEventListener('push', (event) => {
  let data = { title: 'Graduale', body: 'Tienes un nuevo mensaje' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Graduale', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: './Iconos/logo.png', // Tu icono configurado
    badge: './Iconos/gn1.png',   // Icono pequeño para la barra de estado
    vibrate: [200, 100, 200],   // Vibración rítmica
    data: {
      url: './mensajes.html'    // La subpágina de mensajes que mencionaste
    },
    // Nota: El sonido depende de la configuración del sistema del usuario
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Escuchar cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cerrar la notificación

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si la app ya está abierta, ir a ella
      for (const client of clientList) {
        if (client.url.includes('mensajes.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abrir la subpágina de mensajes
      if (clients.openWindow) {
        return clients.openWindow('./mensajes.html');
      }
    })
  );
});

