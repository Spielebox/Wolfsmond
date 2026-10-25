export default{fetch(r,e){const u=new URL(r.url),c=(u.searchParams.get('room')||'').toUpperCase();if(!c)return new Response('Wolfsmond läuft');return e.ROOM.get(e.ROOM.idFromName(c)).fetch(r)}};
const ROLE={seer:'seherin',wolves:'werwolf',heal:'hexe',poison:'hexe'},NEXT={seer:'wolves',wolves:'heal',heal:'poison',poison:'end'},CUE={seherin:['seherin-erwacht','seherin-schlaeft'],werwolf:['werwoelfe-erwachen','werwoelfe-schlafen'],hexe:['hexe-erwacht','hexe-schlaeft']};
export class Room{
constructor(st){this.st=st.storage;this.phase='lobby';this.step=null;this.P=new Map();this.host=null;this.unanimous=true;this.announce=[];this.win=null;this.votes=new Map();this.cueN=0;this.cue=null;this.cb=null;this.nx=null;this.reset();st.blockConcurrencyWhile(async()=>{const d=await this.st.get('s');if(d)this.load(d)})}
reset(){this.pot={heal:true,poison:true};this.nightReset()}
nightReset(){this.wp=new Map();this.wok=new Set();this.victim=null;this.healed=false;this.poisoned=null;this.seen=null}
save(){try{this.st.put('s',this.dump())}catch{}}
dump(){return{phase:this.phase,step:this.step,host:this.host,unanimous:this.unanimous,announce:this.announce,win:this.win,pot:this.pot,victim:this.victim,healed:this.healed,poisoned:this.poisoned,seen:this.seen,nx:this.nx,P:[...this.P.values()].map(({id,name,role,alive})=>({id,name,role,alive})),wp:[...this.wp],wok:[...this.wok],votes:[...this.votes]}}
load(d){Object.assign(this,{phase:d.phase,step:d.step,host:d.host,unanimous:d.unanimous,announce:d.announce,win:d.win,pot:d.pot,victim:d.victim,healed:d.healed,poisoned:d.poisoned,seen:d.seen,nx:d.nx});
this.P=new Map(d.P.map(p=>[p.id,p]));this.wp=new Map(d.wp);this.wok=new Set(d.wok);this.votes=new Map(d.votes);
if(this.phase==='lobby'){this.P.clear();this.host=null}else if(this.phase==='night')this.go(this.step==='wait'||!this.step?(this.nx||'seer'):this.step)}
get A(){return[...this.P.values()].filter(x=>x.alive)}
get W(){return this.A.filter(x=>x.role==='werwolf')}
same(){const w=this.W;return w.length>0&&w.every(x=>this.wp.has(x.id))&&new Set(w.map(x=>this.wp.get(x.id))).size===1}
async fetch(r){const u=new URL(r.url),id=u.searchParams.get('id'),[c,ws]=Object.values(new WebSocketPair());ws.accept();
let p=this.P.get(id);
if(!p){if(this.phase!=='lobby'||!id){ws.send('{"err":"Das Spiel läuft bereits."}');ws.close();return new Response(null,{status:101,webSocket:c})}
p={id,name:(u.searchParams.get('name')||'Spieler').slice(0,14),alive:true,role:null};this.P.set(id,p);this.host??=id}
p.ws=ws;
ws.addEventListener('message',e=>{try{this.msg(p,JSON.parse(e.data))}catch{}});
ws.addEventListener('close',()=>{if(p.ws!==ws)return;p.ws=null;if(this.phase==='lobby'){this.P.delete(id);if(this.host===id)this.host=this.P.keys().next().value??null}this.push()});
this.push();return new Response(null,{status:101,webSocket:c})}
msg(p,m){const t=m.t,h=p.id===this.host;
if(t==='cd'&&h)this.cd(m.n);
else if(t==='cfg'&&h&&this.phase==='lobby')this.unanimous=!!m.u;
else if(t==='start'&&h&&this.phase==='lobby'&&this.P.size>=4)this.start();
else if(t==='go'&&h&&(this.phase==='roles'||this.step==='out'))this.night();
else if(((t==='again'&&this.phase==='over')||(t==='reset'&&this.phase!=='lobby'))&&h){this.phase='lobby';this.step=null;this.win=null;this.announce=[];this.votes=new Map();for(const x of this.P.values()){x.alive=true;x.role=null}this.reset()}
else if(this.phase==='night'&&p.alive)this.nightMsg(p,m);
else if(this.phase==='day'&&this.step==='talk'&&h&&t==='vs'){this.step='vote';this.votes=new Map()}
else if(this.phase==='day'&&this.step==='vote'){if(t==='vote'&&p.alive&&!this.votes.has(p.id)&&m.id!==p.id&&this.P.get(m.id)?.alive)this.votes.set(p.id,m.id);if((h&&t==='tally')||this.votes.size>=this.A.length)this.tally()}
this.push()}
nightMsg(p,m){const t=m.t,s=this.step;
if(s==='wolves'&&p.role==='werwolf'){
if(t==='pick'&&this.P.get(m.id)?.alive&&this.P.get(m.id).role!=='werwolf'){this.wp.set(p.id,m.id);this.wok.clear()}
if(t==='ok'&&(this.unanimous?this.same():this.wp.has(p.id)))this.wok.add(p.id);
if(this.W.every(x=>this.wok.has(x.id)))this.wolvesDone()}
else if(s==='seer'&&p.role==='seherin'){
if(t==='see'&&!this.seen&&m.id!==p.id&&this.P.get(m.id)?.alive)this.seen={id:m.id,w:this.P.get(m.id).role==='werwolf'};
if(t==='next'&&this.seen)this.next('seer')}
else if(s==='heal'&&p.role==='hexe'&&t==='heal'){
if(m.yes&&this.pot.heal&&this.victim){this.healed=true;this.pot.heal=false}
this.next('heal')}
else if(s==='poison'&&p.role==='hexe'&&t==='poison'){
const q=this.P.get(m.id);if(m.id&&this.pot.poison&&q?.alive&&q.id!==p.id){this.poisoned=m.id;this.pot.poison=false}
this.next('poison')}}
wolvesDone(){const c={};for(const v of this.wp.values())c[v]=(c[v]||0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);
this.victim=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;this.next('wolves')}
next(s){if(this.step!==s)return;this.done(s)}
done(s){const n=NEXT[s];if(ROLE[n]&&ROLE[n]===ROLE[s])return this.go(n);this.step='wait';this.nx=n;this.say(CUE[ROLE[s]][1],()=>this.go(n))}
go(s){if(s==='end'){this.step='wait';return this.say('dorf-erwacht',()=>this.dawn())}
const r=ROLE[s];if(!this.A.some(x=>x.role===r))return this.go(NEXT[s]);
this.step=s;if(s!=='poison')this.say(CUE[r][0]);this.push()}
say(id,cb){const n=++this.cueN;this.cue={id,n};this.cb=cb||null;clearTimeout(this.ct);if(cb)this.ct=setTimeout(()=>this.cd(n),9000);this.push()}
cd(n){if(n!==this.cueN||!this.cb)return;clearTimeout(this.ct);const f=this.cb;this.cb=null;setTimeout(()=>{f();this.push()},2500)}
dawn(){const d=new Set();if(this.victim&&!this.healed)d.add(this.victim);if(this.poisoned)d.add(this.poisoned);
d.forEach(i=>this.P.get(i).alive=false);this.announce=[...d];this.phase='day';this.step='talk';this.check()}
check(){const w=this.W.length,o=this.A.length-w;if(!w)this.fin('dorf');else if(w>=o)this.fin('wolf')}
fin(x){this.win=x;this.phase='over';this.step=null}
night(){this.phase='night';this.nightReset();this.announce=[];this.step='wait';this.nx='seer';this.say('nacht-beginnt',()=>this.go('seer'))}
tally(){const c={};for(const v of this.votes.values())c[v]=(c[v]||0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);
const o=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;
if(o)this.P.get(o).alive=false;this.announce=o?[o]:[];this.step='out';this.check()}
start(){const ids=[...this.P.keys()],n=ids.length,r=Array(Math.max(1,n>>2)).fill('werwolf');
if(n>=5)r.push('seherin');if(n>=6)r.push('hexe');while(r.length<n)r.push('dorfbewohner');
for(let i=r.length-1;i>0;i--){const j=Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*(i+1));[r[i],r[j]]=[r[j],r[i]]}ids.forEach((id,i)=>this.P.get(id).role=r[i]);this.phase='roles'}
push(){this.save();for(const p of this.P.values()){try{p.ws?.send(JSON.stringify(this.view(p)))}catch{}}}
view(p){const L=[...this.P.values()],s=this.step,v={phase:this.phase,step:s,host:this.host,u:this.unanimous,win:this.win,announce:this.announce,
me:{id:p.id,name:p.name,role:p.role,alive:p.alive},
players:L.map(x=>({id:x.id,name:x.name,alive:x.alive,on:!!x.ws,role:(!x.alive||this.phase==='over')?x.role:undefined}))};
if(p.role==='werwolf'&&this.phase!=='lobby')v.mates=L.filter(x=>x.role==='werwolf').map(x=>x.id);
if(this.phase==='night'&&p.alive){
if(s==='wolves'&&p.role==='werwolf'){const c={};for(const t of this.wp.values())c[t]=(c[t]||0)+1;Object.assign(v,{picks:c,mine:this.wp.get(p.id),ok:this.wok.has(p.id),can:this.unanimous?this.same():this.wp.has(p.id)})}
if(s==='seer'&&p.role==='seherin')v.seen=this.seen;
if((s==='heal'||s==='poison')&&p.role==='hexe')Object.assign(v,{victim:this.victim,pot:this.pot})}
if(this.phase==='day'&&s==='vote')Object.assign(v,{voted:this.votes.has(p.id),n:this.votes.size,total:this.A.length});
if(p.id===this.host&&this.cue)v.cue=this.cue;return v}}
