# Dominó Cubano — marcador compartido

PWA móvil para llevar partidas de dominó cubano a 100 puntos y compartir el marcador entre varios teléfonos.

## Funciones
- Crear una partida y compartir un código.
- Unirse desde otro teléfono en modo espectador.
- El anfitrión conserva una credencial privada de edición.
- Sincronización de equipos, mesa, cola, puntuación, victorias cara a cara e historial.
- Protección frente a escrituras simultáneas mediante versión.
- Respaldo e importación JSON.
- Instalable como PWA, con caché de la interfaz.
- Pollona con animación/aviso.

## Cloudflare

El proyecto usa Cloudflare Workers + Static Assets + D1. Wrangler puede aprovisionar D1 automáticamente porque la configuración declara el binding DB sin un ID fijo.

Desde Cloudflare, conecta este repositorio como un Worker y usa:

- Build command: `npm install`
- Deploy command: `npm run deploy`

El Worker crea la tabla `rooms` automáticamente en la primera petición a la API. `schema.sql` se conserva como referencia/recuperación manual.

## Seguridad

El código de sala permite lectura. La edición requiere un token aleatorio de 256 bits guardado localmente por el anfitrión. El servidor guarda solamente su hash SHA-256.
