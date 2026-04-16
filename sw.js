const CACHE_NAME = 'graduale-cantoral-v2026-offline';

const ASSETS_TO_CACHE = [
  './',
  './cantoral.html',           // ← importante
  './index.html',
  './piano.htmm',
  './manifest.json',
  
  // Todas las imágenes del Cantoral
  './Iconos/logo.png',
  './Iconos/base.png',
  './Iconos/serafin.png',
  './Iconos/tiempos1.png',
  './Iconos/tiempos.png',
  './Iconos/momentos.png',
  './Iconos/momentos1.png',
  './Iconos/programados.png',
  './Iconos/pro1.png',
  './Iconos/favoritos.png',
  './Iconos/favoritos1.png',
  './Iconos/luna.png',
  './Iconos/sol.png',
  './Iconos/lupa.png',
  './Iconos/filtro.png',
  './Iconos/mas.png',
  './Iconos/ad.png',
  './Iconos/adviento.png',
  './Iconos/navidad.png',
  './Iconos/cuaresma.png',
  './Iconos/pascua.png',
  './Iconos/ordinario.png',
  './Iconos/misa.png',
  './Iconos/pentecostes.png',
  './Iconos/purisima.png',
  './Iconos/corazon.png',
  './Iconos/francisco.png',
  './Iconos/santos.png',
  './Iconos/triduo.png',
  './Iconos/maria.png',
  './Iconos/entrada.png',
  './Iconos/kyrie.png',
  './Iconos/gloria.png',
  './Iconos/salmos.png',
  './Iconos/aleluya.png',
  './Iconos/honor.png',
  './Iconos/ofertorio.png',
  './Iconos/santo.png',
  './Iconos/doxologia.png',
  './Iconos/padre.png',
  './Iconos/cordero.png',
  './Iconos/comunion.png',
  './Iconos/adoración.png',
  './Iconos/salida.png',
  './Iconos/alabanzas.png',
  './Iconos/difuntos.png',
  './Iconos/varios.png',
  './Iconos/cantoral.png',
  './Iconos/formacion.png',
  './Iconos/Oraciones.png',
  './Iconos/carga.png',
  './Iconos/logo1.png',
  './Iconos/logo512.png',
  './Iconos/logo_maskable.png',
  './Iconos/gn.png',
  './Iconos/fondo.png',

  // Scripts y estilos externos (para que funcione todo offline)
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&family=JetBrains+Mono&display=swap',
  'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@tonaljs/tonal/browser/tonal.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// Estrategia: Cache First (ideal para offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});
