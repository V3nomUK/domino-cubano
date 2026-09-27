# Dominó Cubano — marcador compartido

PWA móvil para llevar partidas de dominó cubano a 100 puntos y compartir el marcador entre varios teléfonos.

## Incluye
- Crear una partida y compartir un código.
- Unirse como espectador desde otro dispositivo.
- Credencial privada de edición para el anfitrión.
- Sincronización periódica de equipos, mesa, cola, puntuación, victorias cara a cara e historial.
- Protección contra escrituras simultáneas mediante versión.
- Respaldo/importación JSON.
- Instalación como PWA y caché de la interfaz.
- Pollona con animación y sonido.

## Despliegue en Cloudflare
1. Crea una base D1 llamada `domino-cubano-db`.
2. Ejecuta `schema.sql` contra esa base.
3. Sustituye `REPLACE_WITH_D1_DATABASE_ID` en `wrangler.jsonc` por el ID real.
4. Despliega el proyecto como Cloudflare Worker con Static Assets.

La aplicación y la API viven en el mismo despliegue. La API usa `/api/rooms`.

## Seguridad
El código de sala permite leer una partida. Para editar se necesita un token aleatorio de 256 bits que queda guardado en el dispositivo del anfitrión. El servidor almacena solamente SHA-256 del token.
