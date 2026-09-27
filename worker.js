const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...extra}});
const MAX_STATE_BYTES=512000;
const code=()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';crypto.getRandomValues(new Uint8Array(7)).forEach(n=>s+=chars[n%chars.length]);return s};
const token=()=>{const a=new Uint8Array(32);crypto.getRandomValues(a);return [...a].map(x=>x.toString(16).padStart(2,'0')).join('')};
async function hash(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function validState(s){
 if(!s||typeof s!=='object'||!Array.isArray(s.teams)||s.teams.length<2||s.teams.length>50)return false;
 if(!Array.isArray(s.active)||!Array.isArray(s.queue)||!Array.isArray(s.history)||typeof s.wins!=='object'||!s.wins||typeof s.partials!=='object'||!s.partials)return false;
 const ids=new Set();
 for(const t of s.teams){if(!t||typeof t.id!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(t.id)||ids.has(t.id)||typeof t.name!=='string'||t.name.length>80)return false;ids.add(t.id)}
 if(s.active.length>2||!s.active.every(x=>ids.has(x))||!s.queue.every(x=>ids.has(x)))return false;
 return true;
}
function statePayload(state){if(!validState(state))return {error:'Estado inválido',status:400};const raw=JSON.stringify(state);if(new TextEncoder().encode(raw).byteLength>MAX_STATE_BYTES)return {error:'La partida es demasiado grande',status:413};return {raw}}
async function ensureSchema(env){await env.DB.prepare(`CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY,state TEXT NOT NULL,edit_token_hash TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`).run()}
export default {async fetch(req,env){const u=new URL(req.url);if(!u.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);try{
 await ensureSchema(env);
 if(u.pathname==='/api/rooms'&&req.method==='POST'){
  const body=await req.json();const payload=statePayload(body.state);if(payload.error)return json({error:payload.error},payload.status);
  let id;for(let i=0;i<8;i++){id=code();const x=await env.DB.prepare('SELECT id FROM rooms WHERE id=?').bind(id).first();if(!x)break}
  const editToken=token(),h=await hash(editToken),now=new Date().toISOString();
  await env.DB.prepare('INSERT INTO rooms(id,state,edit_token_hash,version,created_at,updated_at) VALUES(?,?,?,?,?,?)').bind(id,payload.raw,h,1,now,now).run();
  return json({roomId:id,editToken,version:1},201);
 }
 const m=u.pathname.match(/^\/api\/rooms\/([A-Z0-9]+)$/i);
 if(m){
  const id=m[1].toUpperCase(),row=await env.DB.prepare('SELECT * FROM rooms WHERE id=?').bind(id).first();
  if(!row)return json({error:'Partida no encontrada'},404);
  if(req.method==='GET')return json({roomId:id,state:JSON.parse(row.state),version:row.version,updatedAt:row.updated_at});
  if(req.method==='PUT'){
   const auth=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
   if(!auth||await hash(auth)!==row.edit_token_hash)return json({error:'Sin permiso para editar'},401);
   const body=await req.json();
   if(Number(body.version)!==Number(row.version))return json({error:'Conflicto de versión',state:JSON.parse(row.state),version:row.version},409);
   const payload=statePayload(body.state);if(payload.error)return json({error:payload.error},payload.status);
   const v=Number(row.version)+1,now=new Date().toISOString();
   await env.DB.prepare('UPDATE rooms SET state=?,version=?,updated_at=? WHERE id=?').bind(payload.raw,v,now,id).run();
   return json({roomId:id,version:v,updatedAt:now});
  }
 }
 return json({error:'Ruta no encontrada'},404);
 }catch(e){return json({error:'Error del servidor'},500)}}};
