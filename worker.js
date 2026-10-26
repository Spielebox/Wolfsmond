export default{fetch(r,e){const u=new URL(r.url),c=(u.searchParams.get('room')||'').toUpperCase();if(!c)return new Response('Wolfsmond läuft');return e.ROOM.get(e.ROOM.idFromName(c)).fetch(r)}};
const ROLE={amor:'amor',prot:'heiler',seer:'seherin',wolves:'werwolf',heal:'hexe',poison:'hexe'},
NEXT={amor:'lovers',lovers:'prot',prot:'seer',seer:'wolves',wolves:'heal',heal:'poison',poison:'end'},
CUE={amor:['amor-erwacht','amor-schlaeft'],lovers:['verliebte-erwachen','verliebte-schlafen'],prot:['heiler-erwacht','heiler-schlaeft'],seer:['seherin-erwacht','seherin-schlaeft'],wolves:['werwoelfe-erwachen','werwoelfe-schlafen'],heal:['hexe-erwacht','hexe-schlaeft']},
KEYS=['phase','step','host','cfg','win','pot','victim','healed','poisoned','seen','nx','captain','lovers','nn','protect','lastProt','dead','kind','pend','cont','aw','actor','retry'];
function comp(n,h){const r=Array(n<6?1:n<9?2:n<13?3:4).fill('werwolf');if(n>=5)r.push('seherin');if(n>=6)r.push('hexe','jaeger');if(n>=7)r.push('amor');if(n>=11)r.push('maedchen');if(h&&n>=6)r.push('heiler');while(r.length<n)r.push('dorfbewohner');return r.slice(0,n)}
export class Room{
constructor(st){this.st=st.storage;this.phase='lobby';this.step=null;this.P=new Map();this.host=null;this.cfg={u:true,cap:true,capWhen:'n1',heiler:false};this.win=null;this.votes=new Map();this.cueN=0;this.cue=null;this.cb=null;this.pz=2500;this.reset();
st.blockConcurrencyWhile(async()=>{const d=await this.st.get('s');if(d)this.load(d)})}
reset(){this.pot={heal:true,poison:true};this.captain=null;this.lovers=null;this.nn=0;this.lastProt=null;this.dead=[];this.kind=null;this.pend=[];this.cont=null;this.aw=null;this.actor=null;this.retry=0;this.nx=null;this.nightReset()}
nightReset(){this.wp=new Map();this.wok=new Set();this.victim=null;this.healed=false;this.poisoned=null;this.seen=null;this.protect=null;this.lk=new Set()}
save(){try{this.st.put('s',this.dump())}catch{}}
dump(){const o={};KEYS.forEach(k=>o[k]=this[k]);o.P=[...this.P.values()].map(({id,name,role,alive})=>({id,name,role,alive}));o.wp=[...this.wp];o.wok=[...this.wok];o.votes=[...this.votes];o.lk=[...this.lk];return o}
load(d){KEYS.forEach(k=>{if(d[k]!==undefined)this[k]=d[k]});this.P=new Map(d.P.map(p=>[p.id,p]));this.wp=new Map(d.wp);this.wok=new Set(d.wok);this.votes=new Map(d.votes);this.lk=new Set(d.lk||[]);
if(this.phase==='lobby'){this.P.clear();this.host=null}else if(this.phase==='night')this.go(this.step==='wait'||!this.step?(this.nx||'amor'):this.step)}
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
msg(p,m){const t=m.t,h=p.id===this.host,ph=this.phase,s=this.step;
if(t==='cd'&&h)this.cd(m.n);
else if(t==='cfg'&&h&&ph==='lobby'){if(['u','cap','capWhen','heiler'].includes(m.k))this.cfg[m.k]=m.v}
else if(t==='start'&&h&&ph==='lobby'&&this.P.size>=4)this.start();
else if(t==='go'&&h&&(ph==='roles'||s==='out')){if(ph==='roles'&&this.cfg.cap&&this.cfg.capWhen==='start'){this.phase='day';this.step='wahl';this.votes=new Map();this.aw='night';this.dead=[]}else this.night()}
else if(((t==='again'&&ph==='over')||(t==='reset'&&ph!=='lobby'))&&h){this.phase='lobby';this.step=null;this.win=null;this.votes=new Map();for(const x of this.P.values()){x.alive=true;x.role=null}this.reset()}
else if(ph==='night'&&p.alive)this.nightMsg(p,m);
else if(ph==='day')this.dayMsg(p,m,h);
this.push()}
dayMsg(p,m,h){const t=m.t,s=this.step;
if(s==='talk'&&h&&t==='vs'){this.step='vote';this.votes=new Map()}
else if(s==='vote'||s==='wahl'){if(t==='vote'&&p.alive&&!this.votes.has(p.id)&&this.P.get(m.id)?.alive&&(s==='wahl'||m.id!==p.id))this.votes.set(p.id,m.id);
if((h&&t==='tally'&&s==='vote')||this.votes.size>=this.A.length)s==='vote'?this.tally():this.tallyW()}
else if(s==='jaeger'&&p.id===this.actor&&t==='shoot'&&this.P.get(m.id)?.alive){this.pend.shift();this.die(m.id,'jaeger');this.settle()}
else if(s==='nachf'&&p.id===this.actor&&t==='nachf'&&this.P.get(m.id)?.alive){this.pend.shift();this.captain=m.id;this.settle()}}
nightMsg(p,m){const t=m.t,s=this.step;
if(s==='amor'&&p.role==='amor'&&t==='lv'){const[a,b]=m.ids||[];if(a&&b&&a!==b&&this.P.get(a)?.alive&&this.P.get(b)?.alive){this.lovers=[a,b];this.next('amor')}}
else if(s==='lovers'&&this.lovers?.includes(p.id)&&t==='lok'){this.lk.add(p.id);if(this.lk.size>=2)this.next('lovers')}
else if(s==='prot'&&p.role==='heiler'&&t==='prot'&&m.id!==this.lastProt&&this.P.get(m.id)?.alive){this.protect=m.id;this.next('prot')}
else if(s==='wolves'&&p.role==='werwolf'){
if(t==='pick'&&this.P.get(m.id)?.alive&&this.P.get(m.id).role!=='werwolf'){this.wp.set(p.id,m.id);this.wok.clear()}
if(t==='ok'&&(this.cfg.u?this.same():this.wp.has(p.id)))this.wok.add(p.id);
if(this.W.every(x=>this.wok.has(x.id)))this.wolvesDone()}
else if(s==='seer'&&p.role==='seherin'){
if(t==='see'&&!this.seen&&m.id!==p.id&&this.P.get(m.id)?.alive)this.seen={id:m.id,w:this.P.get(m.id).role==='werwolf'};
if(t==='next'&&this.seen)this.next('seer')}
else if(s==='heal'&&p.role==='hexe'&&t==='heal'){if(m.yes&&this.pot.heal&&this.victim){this.healed=true;this.pot.heal=false}this.next('heal')}
else if(s==='poison'&&p.role==='hexe'&&t==='poison'){const q=this.P.get(m.id);if(m.id&&this.pot.poison&&q?.alive&&q.id!==p.id){this.poisoned=m.id;this.pot.poison=false}this.next('poison')}}
wolvesDone(){const c={};for(const v of this.wp.values())c[v]=(c[v]||0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);
this.victim=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;this.next('wolves')}
has(s){if(s==='amor')return this.nn===1&&this.A.some(x=>x.role==='amor');if(s==='lovers')return this.nn===1&&!!this.lovers;return this.A.some(x=>x.role===ROLE[s])}
go(s){if(s==='end'){this.step='wait';return this.say('dorf-erwacht',()=>this.dawn(),800)}
if(!this.has(s))return this.go(NEXT[s]);
this.step=s;if(s!=='poison')this.say(CUE[s][0]);this.push()}
done(s){if(s==='heal')return this.go('poison');this.step='wait';this.nx=NEXT[s];this.say(CUE[s==='poison'?'heal':s][1],()=>this.go(NEXT[s]))}
next(s){if(this.step===s)this.done(s)}
say(id,cb,pz){const n=++this.cueN;this.cue={id,n};this.cb=cb||null;this.pz=pz??2500;clearTimeout(this.ct);if(cb)this.ct=setTimeout(()=>this.cd(n),9000);this.push()}
cd(n){if(n!==this.cueN||!this.cb)return;clearTimeout(this.ct);const f=this.cb;this.cb=null;setTimeout(()=>{f();this.push()},this.pz)}
night(){this.phase='night';this.nn++;this.nightReset();this.dead=[];this.step='wait';this.nx='amor';this.say('nacht-beginnt',()=>this.go('amor'))}
die(id,how){const p=this.P.get(id);if(!p||!p.alive)return;p.alive=false;this.dead.push({id,how});
if(this.lovers&&this.lovers.includes(id))this.die(this.lovers.find(x=>x!==id),'liebe');
if(p.role==='jaeger')this.pend.push({t:'jaeger',id});
if(this.captain===id)this.pend.push({t:'nachf',id})}
dawn(){this.dead=[];this.kind='n';if(this.victim&&!this.healed&&this.protect!==this.victim)this.die(this.victim,'wolf');if(this.poisoned)this.die(this.poisoned,'gift');
this.lastProt=this.protect||null;this.phase='day';this.cont=(this.cfg.cap&&!this.captain&&this.cfg.capWhen==='n1'&&this.nn===1)?'wahl':'talk';this.settle()}
tally(){const c={};for(const[a,b]of this.votes)c[b]=(c[b]||0)+(a===this.captain?2:1);const e=Object.entries(c).sort((x,y)=>y[1]-x[1]);
const o=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;this.dead=[];this.kind='v';if(o)this.die(o,'vote');this.cont='out';this.settle()}
tallyW(){const c={};for(const b of this.votes.values())c[b]=(c[b]||0)+1;const e=Object.entries(c).sort((x,y)=>y[1]-x[1]);
const o=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;this.votes=new Map();
if(!o){this.retry=1;return}this.retry=0;this.captain=o;if(this.aw==='night'){this.aw=null;this.night()}else this.step='talk'}
settle(){while(this.pend.length&&!this.A.length)this.pend.shift();const q=this.pend[0];
if(q){this.step=q.t;this.actor=q.id;return this.push()}
this.actor=null;const w=this.check();if(w)return this.fin(w);
this.step=this.cont;if(this.step==='wahl'){this.votes=new Map();this.retry=0}this.push()}
check(){const A=this.A,w=A.filter(x=>x.role==='werwolf').length,o=A.length-w;
if(this.lovers&&A.length===2&&this.lovers.every(i=>this.P.get(i).alive))return w===2?'wolf':'liebe';
if(!w)return'dorf';if(!o)return'wolf';
if(w===1&&o===1){const c=this.cfg.cap&&this.captain&&this.P.get(this.captain);return c&&c.alive&&c.role!=='werwolf'?'dorf':'wolf'}
return null}
fin(w){const L=[...this.P.values()];this.win={w,ids:w==='dorf'?L.filter(x=>x.role!=='werwolf').map(x=>x.id):w==='wolf'?L.filter(x=>x.role==='werwolf').map(x=>x.id):[]};this.phase='over';this.step=null;this.push()}
start(){const ids=[...this.P.keys()],r=comp(ids.length,this.cfg.heiler);
for(let i=r.length-1;i>0;i--){const j=Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*(i+1));[r[i],r[j]]=[r[j],r[i]]}
ids.forEach((id,i)=>this.P.get(id).role=r[i]);this.phase='roles'}
push(){this.save();for(const p of this.P.values()){try{p.ws?.send(JSON.stringify(this.view(p)))}catch{}}}
view(p){const L=[...this.P.values()],s=this.step,ph=this.phase,v={phase:ph,step:s,host:this.host,cfg:this.cfg,win:this.win,dead:this.dead,kind:this.kind,captain:this.captain,actor:this.actor,retry:this.retry,
me:{id:p.id,name:p.name,role:p.role,alive:p.alive},
players:L.map(x=>({id:x.id,name:x.name,alive:x.alive,on:!!x.ws,role:(!x.alive||ph==='over')?x.role:undefined}))};
if(this.lovers&&(ph==='over'||this.lovers.includes(p.id)))v.lovers=this.lovers;
if(p.role==='werwolf'&&ph!=='lobby')v.mates=L.filter(x=>x.role==='werwolf').map(x=>x.id);
if(ph==='night'&&p.alive){
if(s==='wolves'&&p.role==='werwolf'){const c={};for(const t of this.wp.values())c[t]=(c[t]||0)+1;Object.assign(v,{picks:c,mine:this.wp.get(p.id),ok:this.wok.has(p.id),can:this.cfg.u?this.same():this.wp.has(p.id)})}
if(s==='seer'&&p.role==='seherin')v.seen=this.seen;
if(s==='prot'&&p.role==='heiler')v.last=this.lastProt;
if(s==='lovers'&&this.lovers?.includes(p.id)){v.partner=this.lovers.find(x=>x!==p.id);v.lok=this.lk.has(p.id)}
if((s==='heal'||s==='poison')&&p.role==='hexe')Object.assign(v,{victim:this.victim,pot:this.pot})}
if(ph==='day'&&(s==='vote'||s==='wahl'))Object.assign(v,{voted:this.votes.has(p.id),n:this.votes.size,total:this.A.length});
if(p.id===this.host&&this.cue)v.cue=this.cue;return v}}
