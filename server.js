const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static("public"));

const tiles = [
["Salida","🚩","start",0],["Bosque nativo","🌳","land",100],["Evento verde","♻️","event",0],["Humedal protegido","🦆","land",120],["Impuesto ecológico","💧","tax",100],["Planta solar","☀️","utility",150],["Costa limpia","🏖️","land",140],["Evento verde","🌱","event",0],["Reserva marina","🐬","land",160],["Parque nacional","🏞️","land",180],["Pausa consciente","🧘","rest",0],["Centro de reciclaje","♻️","land",200],["Evento verde","🌎","event",0],["Huerto comunitario","🥕","land",220],["Barrio sostenible","🏡","land",240],["Parque eólico","🌬️","utility",150],["Santuario de aves","🦜","land",260],["Evento verde","🌿","event",0],["Corredor biológico","🦋","land",280],["Bosque lluvioso","🌴","land",300],["Visita al vertedero","🗑️","jail",0],["Río protegido","🏞️","land",320],["Evento verde","🐟","event",0],["Lago cristalino","💎","land",340],["Planta de tratamiento","🚰","land",360],["Bono solar","🔆","utility",150],["Isla ecológica","🏝️","land",380],["Eco-mercado","🥬","land",400],["Evento verde","🌳","event",0],["Reserva de cóndores","🦅","land",420],["Día sin autos","🚲","rest",0],["Energía geotérmica","🌋","land",440],["Evento verde","🌦️","event",0],["Parque de turbinas","💨","land",460],["Centro de innovación","🔬","land",480],["Fondo climático","🌍","tax",120],["Bosque regenerado","🌲","land",500],["Evento verde","🍃","event",0],["Reserva de la biosfera","🦚","land",550],["Santuario planetario","🌏","land",600]
];
const cards = [
["¡Reforestación comunitaria!","Tu comunidad plantó árboles. Recibes 100 Eco-monedas.",100],
["Limpieza de playas","Participaste en una jornada de limpieza. Recibes 80 Eco-monedas.",80],
["Sequía prolongada","Debes contribuir al fondo de emergencia hídrica. Pagas 90 Eco-monedas.",-90],
["Innovación renovable","Tu proyecto de energía limpia recibe apoyo. Recibes 120 Eco-monedas.",120],
["Fauna rescatada","Ayudaste a proteger especies nativas. Recibes 70 Eco-monedas.",70],
["Residuos mal gestionados","Tu ciudad debe financiar una mejora. Pagas 80 Eco-monedas.",-80],
["Transporte sostenible","Promoviste el uso de bicicletas. Recibes 60 Eco-monedas.",60],
["Restauración de humedales","Aportas al cuidado de un humedal. Pagas 50 Eco-monedas y ganas 1 punto verde.",-50]
];
const rooms = new Map();
const colors=["#e76f51","#277da1","#9b5de5","#43aa8b","#f8961e","#577590"];
const avatars=["🦊","🐢","🦉","🐬","🐝","🦋"];
const clean=s=>String(s||"").trim().slice(0,16);
function publicState(r){return {host:r.host,players:r.players.map(p=>({id:p.id,name:p.name,cash:p.cash,pos:p.pos,color:p.color,avatar:p.avatar,green:p.green})),current:r.current,started:r.started,rolled:r.rolled,lastDice:r.lastDice,properties:r.properties,finished:r.finished};}
function sendState(r){io.to(r.code).emit("state",publicState(r));}
function notice(r,msg){io.to(r.code).emit("notice",msg);}
function fail(s,msg){s.emit("errorMessage",msg);}
function getRoom(s){const code=s.data.room;return rooms.get(code);}
function active(r,s){return r&&r.started&&!r.finished&&r.current===s.id&&r.rolled;}
function next(r){if(r.players.length<1)return;r.turn=(r.turn+1)%r.players.length;r.current=r.players[r.turn].id;r.rolled=false;r.pending=null;}
function finish(r){next(r);sendState(r);}
function bankrupt(r,p){if(p.cash>=0)return false;p.cash=0;notice(r,`${p.name} se quedó sin Eco-monedas y queda fuera de la partida.`);const eliminatedId=p.id;const oldTurn=r.turn;r.players=r.players.filter(x=>x.id!==eliminatedId);for(const [k,v] of Object.entries(r.properties))if(v.id===eliminatedId)delete r.properties[k];if(r.players.length===1){r.finished=true;io.to(r.code).emit("gameOver",`${r.players[0].name} gana con ${r.players[0].cash} Eco-monedas y ${r.players[0].green} puntos verdes.`);return true;}if(r.current===eliminatedId){r.turn=oldTurn%r.players.length;r.current=r.players[r.turn].id;r.rolled=false;}else{r.turn=Math.max(0,r.players.findIndex(x=>x.id===r.current));}return true;}
io.on("connection",s=>{
 s.on("createRoom",({name})=>{name=clean(name);if(!name)return fail(s,"Escribe un nombre.");if([...rooms.values()].some(r=>r.players.some(p=>p.id===s.id)))return;let code;do{code=crypto.randomBytes(3).toString("hex").slice(0,5).toUpperCase()}while(rooms.has(code));const r={code,host:s.id,players:[],properties:{},started:false,turn:0,current:null,rolled:false,lastDice:null,pending:null,finished:false};rooms.set(code,r);addPlayer(s,r,name);s.emit("roomCreated",{code,state:publicState(r)});});
 s.on("joinRoom",({name,code})=>{name=clean(name);code=String(code||"").toUpperCase();const r=rooms.get(code);if(!name)return fail(s,"Escribe un nombre.");if(!r)return fail(s,"No encontramos esa sala. Revisa el código.");if(r.started)return fail(s,"La partida ya comenzó.");if(r.players.length>=6)return fail(s,"La sala está completa (6 jugadores).");addPlayer(s,r,name);s.emit("joinedRoom",{code,state:publicState(r)});notice(r,`${name} se unió a la partida.`);sendState(r);});
 function addPlayer(s,r,name){const p={id:s.id,name,cash:1500,pos:0,color:colors[r.players.length],avatar:avatars[r.players.length],green:0};r.players.push(p);s.join(r.code);s.data.room=r.code;if(!r.current)r.current=s.id;}
 s.on("startGame",()=>{const r=getRoom(s);if(!r||s.id!==r.host)return fail(s,"Solo el anfitrión puede iniciar.");if(r.players.length<2)return fail(s,"Se necesitan al menos 2 jugadores.");if(r.started)return;r.started=true;r.turn=0;r.current=r.players[0].id;notice(r,"¡Comienza ECO-POLY! Cada guardián inicia con 1.500 Eco-monedas.");sendState(r);});
 s.on("roll",()=>{const r=getRoom(s);if(!r||!r.started||r.current!==s.id||r.rolled||r.finished)return;const p=r.players.find(x=>x.id===s.id);const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6);r.lastDice=[a,b];r.rolled=true;const old=p.pos;p.pos=(p.pos+a+b)%40;if(p.pos<old){p.cash+=200;notice(r,`${p.name} pasó por SALIDA y recibió 200 Eco-monedas.`);}notice(r,`${p.name} avanzó ${a+b} casillas hasta ${tiles[p.pos][0]}.`);sendState(r);});
 s.on("buy",()=>{const r=getRoom(s);if(!active(r,s))return;const p=r.players.find(x=>x.id===s.id),t=tiles[p.pos];if(!["land","utility"].includes(t[2])||r.properties[p.pos])return fail(s,"Este territorio ya no está disponible.");if(p.cash<t[3])return fail(s,"No tienes suficientes Eco-monedas.");p.cash-=t[3];r.properties[p.pos]={id:p.id,name:p.name,level:0};notice(r,`${p.name} adquirió ${t[0]} por ${t[3]} Eco-monedas.`);sendState(r);});
 s.on("payRent",()=>{const r=getRoom(s);if(!active(r,s))return;const p=r.players.find(x=>x.id===s.id),o=r.properties[p.pos];if(!o||o.id===p.id)return;const amount=Math.round(tiles[p.pos][3]*(.12+(o.level||0)*.16));const owner=r.players.find(x=>x.id===o.id);p.cash-=amount;if(owner)owner.cash+=amount;notice(r,`${p.name} pagó ${amount} Eco-monedas de alquiler a ${owner?.name||"otro guardián"}.`);bankrupt(r,p);sendState(r);});
 s.on("build",()=>{const r=getRoom(s);if(!active(r,s))return;const p=r.players.find(x=>x.id===s.id),o=r.properties[p.pos],cost=Math.floor(tiles[p.pos][3]*.6);if(!o||o.id!==p.id||tiles[p.pos][2]!=="land")return fail(s,"Solo puedes mejorar tus propios territorios.");if(p.cash<cost)return fail(s,"No tienes suficientes Eco-monedas.");if(o.level>=3)return fail(s,"Este territorio ya tiene el máximo de 3 mejoras.");p.cash-=cost;o.level++;p.green++;notice(r,`${p.name} construyó una mejora ecológica en ${tiles[p.pos][0]}. Alquiler aumentado.`);sendState(r);});
 s.on("drawEvent",()=>{const r=getRoom(s);if(!active(r,s)||r.pending)return;const card=cards[Math.floor(Math.random()*cards.length)];r.pending={player:s.id,card};s.emit("eventCard",{title:card[0],description:card[1]});});
 s.on("resolveEvent",()=>{const r=getRoom(s);if(!active(r,s)||!r.pending||r.pending.player!==s.id)return;const p=r.players.find(x=>x.id===s.id),c=r.pending.card;p.cash+=c[2];if(c[0].includes("Restauración"))p.green++;notice(r,`${p.name}: ${c[0]} (${c[2]>=0?"+":""}${c[2]} Eco).`);r.pending=null;bankrupt(r,p);sendState(r);});
 s.on("payTax",()=>{const r=getRoom(s);if(!active(r,s))return;const p=r.players.find(x=>x.id===s.id);p.cash-=tiles[p.pos][3];notice(r,`${p.name} aportó ${tiles[p.pos][3]} Eco-monedas al fondo planetario.`);bankrupt(r,p);sendState(r);});
 s.on("finishTurn",()=>{const r=getRoom(s);if(!active(r,s))return;const p=r.players.find(x=>x.id===s.id);if(tiles[p.pos][2]==="jail")p.green=Math.max(0,p.green);finish(r);});
 s.on("disconnect",()=>{const r=getRoom(s);if(!r)return;const p=r.players.find(x=>x.id===s.id);if(!p)return;if(!r.started){r.players=r.players.filter(x=>x.id!==s.id);if(r.players.length===0)rooms.delete(r.code);else{if(r.host===s.id)r.host=r.players[0].id;notice(r,`${p.name} salió de la sala.`);sendState(r);}}else{notice(r,`${p.name} se desconectó. Su lugar queda reservado hasta que termine la partida.`);}});
});
const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log(`ECO-POLY disponible en http://localhost:${PORT}`));
