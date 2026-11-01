# ECO-POLY OVALLE — Guardianes del Limarí

Juego de mesa multijugador online para navegador, adaptable a PC y celular. Está ambientado en Ovalle y presenta desafíos educativos relacionados con el agua, la cuenca del río Limarí, los residuos, la biodiversidad y la prevención de incendios.

## Ejecutar localmente
1. Instala Node.js.
2. Abre una terminal en esta carpeta.
3. Ejecuta `npm install`.
4. Ejecuta `npm start`.
5. Abre `http://localhost:3000`.

## Publicar en Render
- Tipo: Web Service
- Build Command: `npm install`
- Start Command: `npm start`
- Root Directory: vacío

El juego permite salas de 2 a 6 jugadores mediante códigos. Las salas se guardan en memoria y desaparecen si el servidor se reinicia. No incluye cuentas ni guardado permanente.

## Reglas automáticas de la partida
- Al caer en una casilla de evento, el servidor extrae obligatoriamente una carta buena o mala y muestra su efecto. El turno no puede continuar hasta resolverla.
- Al caer en una propiedad de otro jugador, el alquiler se descuenta automáticamente y se acredita al dueño.
- Si el jugador no puede cubrir el alquiler, paga lo que le queda y queda eliminado.
- También queda eliminado si una carta o aporte obligatorio lo deja sin dinero. Gana el último jugador que permanece en la partida.

## Enfoque educativo
Los eventos son escenarios didácticos inspirados en temas ambientales documentados para Ovalle; no representan necesariamente incidentes actuales ni atribuyen responsabilidades a personas o empresas.
