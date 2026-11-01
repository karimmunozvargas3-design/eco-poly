# ECO-POLY — videojuego web multijugador

ECO-POLY es un juego de tablero online para 2 a 6 jugadores. Funciona en PC y celular desde un navegador.

## Requisitos
- Node.js 18 o superior
- Conexión a internet para instalar dependencias y para jugar online

## Ejecutarlo en tu PC
1. Descomprime `eco-poly.zip`.
2. Abre una terminal dentro de la carpeta `eco_poly`.
3. Ejecuta: `npm install`
4. Ejecuta: `npm start`
5. Abre `http://localhost:3000` en tu navegador.

Para que tus amigos entren desde otras redes, debes desplegar la carpeta en un servicio de hosting que admita Node.js y WebSockets (por ejemplo, un hosting de aplicaciones Node). Comparte la URL pública del servidor; cada jugador entra, escribe su nombre y usa el código de sala.

## Cómo jugar
1. Una persona crea la sala y comparte el código de 5 caracteres.
2. Los demás se unen con ese código. Máximo 6 jugadores.
3. El anfitrión pulsa «Comenzar partida» cuando haya al menos 2 jugadores.
4. En tu turno, lanza los dados y realiza la acción de la casilla.
5. Compra territorios, cobra alquileres, mejora tus propiedades y resuelve eventos.
6. La partida termina cuando solo queda un jugador solvente.

## Controles
- Crear sala: crea una sala privada.
- Unirse: entra usando el código.
- Lanzar dados: mueve tu ficha.
- Comprar / pagar alquiler / construir: resuelve la casilla actual.
- Finalizar turno: pasa el turno al siguiente jugador.

## Notas
- Las salas y partidas viven en la memoria del servidor. Si se reinicia el servidor, las partidas en curso se pierden.
- Esta es una primera versión jugable. No incluye cuentas, chat, guardado permanente ni reconexión de jugadores durante una partida.
- El servidor debe mantenerse activo para que las salas online funcionen.
