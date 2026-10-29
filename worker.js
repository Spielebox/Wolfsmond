export default{fetch(r,e){const u=new URL(r.url),c=(u.searchParams.get('room')||'').toUpperCase();if(!c)return new Response('Wolfsmond läuft');return e.ROOM.get(e.ROOM.idFromName(c)).fetch(r)}};
const ROLE={thief:'dieb',amor:'amor',prot:'heiler',seer:'seherin',wolves:'werwolf',heal:'hexe',poison:'hexe'},
NEXT={thief:'amor',amor:'lovers',lovers:'prot',prot:'seer',seer:'wolves',wolves:'heal',heal:'poison',poison:'end'},
CUE={thief:['dieb-erwacht','dieb-schlaeft'],amor:['amor-erwacht','amor-schlaeft'],lovers:['verliebte-erwachen','verliebte-schlafen'],prot:['heiler-erwacht','heiler-schlaeft'],seer:['seherin-erwacht','seherin-schlaeft'],wolves:['werwoelfe-erwachen','werwoelfe-schlafen'],heal:['hexe-erwacht','hexe-schlaeft']},
KEYS=['phase','step','host','cfg','win','pot','victim','healed','poisoned','seen','nx','captain','lovers','nn','protect','lastProt','dead','kind','pend','cont','aw','actor','retry','sn','capNew','cands','rnd','lot','capHow','res','spare','thiefDone','thiefId','capNone','tEnd'];
const RL={werwolf:1,seherin:1,hexe:1,jaeger:1,amor:1,heiler:1,maedchen:1,dieb:1};
function suggest(n){return{werwolf:n<6?1:n<9?2:n<13?3:4,seherin:n>=5?1:0,hexe:n>=6?1:0,jaeger:n>=6?1:0,amor:n>=7?1:0,heiler:0,maedchen:n>=11?1:0,dieb:n>=12?1:0}}
function build(n,c){const r=c.auto?suggest(n):c.r,l=[];if(!r.werwolf)return null;for(const[k,v]of Object.entries(r))for(let i=0;i<v;i++)l.push(k);const p=n+(r.dieb?2:0);if(l.length>p)return null;while(l.length<p)l.push('dorfbewohner');return l}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export class Room{
constructor(st,env){this.st=st.storage;this.env=env;this.locked=false;this.phase='lobby';this.step=null;this.P=new Map();this.host=null;this.cfg={u:true,cap:true,capWhen:'n1',selfW:false,capTie:'los',reveal:true,seerTrue:false,timer:300,pause:2.5,rolePause:5,auto:true,n:0,r:suggest(6)};this.win=null;this.votes=new Map();this.cueN=0;this.cue=null;this.cb=null;this.pz=2500;this.reset();
st.blockConcurrencyWhile(async()=>{const d=await this.st.get('s');if(d)this.load(d)})}
reset(){this.pot={heal:true,poison:true};this.captain=null;this.lovers=null;this.nn=0;this.lastProt=null;this.dead=[];this.kind=null;this.pend=[];this.cont=null;this.aw=null;this.actor=null;this.retry=0;this.nx=null;this.sn=false;this.capNew=null;this.cands=null;this.rnd=1;this.lot=false;this.capHow=null;this.res=null;this.spare=[];this.capNone=false;this.tEnd=0;this.seenR=new Set();this.readyAt=0;this.nightReset()}
nightReset(){this.wp=new Map();this.wok=new Set();this.victim=null;this.healed=false;this.poisoned=null;this.seen=null;this.protect=null;this.lk=new Set();this.thiefDone=false;this.thiefId=null}
save(){try{this.st.put('s',this.dump())}catch{}}
dump(){const o={};KEYS.forEach(k=>o[k]=this[k]);o.P=[...this.P.values()].map(({id,name,role,alive})=>({id,name,role,alive}));o.wp=[...this.wp];o.wok=[...this.wok];o.votes=[...this.votes];o.lk=[...this.lk];return o}
load(d){KEYS.forEach(k=>{if(d[k]!==undefined)this[k]=d[k]});this.P=new Map(d.P.map(p=>[p.id,p]));this.wp=new Map(d.wp);this.wok=new Set(d.wok);this.votes=new Map(d.votes);this.lk=new Set(d.lk||[]);
if(this.phase==='lobby'){this.P.clear();this.host=null}else if(this.phase==='night')this.go(this.step==='wait'||!this.step?(this.nx||'thief'):this.step)}
get A(){return[...this.P.values()].filter(x=>x.alive)}
get W(){return this.A.filter(x=>x.role==='werwolf')}
same(){const w=this.W;return w.length>0&&w.every(x=>this.wp.has(x.id))&&new Set(w.map(x=>this.wp.get(x.id))).size===1}
async fetch(r){const u=new URL(r.url),id=u.searchParams.get('id'),[c,ws]=Object.values(new WebSocketPair());ws.accept();
let p=this.P.get(id);
if(!p){const no=e=>{ws.send(JSON.stringify({err:e}));ws.close();return new Response(null,{status:101,webSocket:c})};
if(this.phase!=='lobby'||!id)return no('Das Spiel läuft bereits.');
if(this.locked)return no('Die Lobby ist gesperrt.');
const kw=this.env&&this.env.ACCESS_WORD;if(!this.host&&kw&&u.searchParams.get('k')!==kw)return no('Zugangswort fehlt oder ist falsch.');
p={id,name:(u.searchParams.get('name')||'Spieler').replace(/[<>&"'`]/g,'').slice(0,14)||'Spieler',alive:true,role:null};this.P.set(id,p);this.host??=id}
p.ws=ws;
ws.addEventListener('message',e=>{try{this.msg(p,JSON.parse(e.data))}catch{}});
ws.addEventListener('close',()=>{if(p.ws!==ws)return;p.ws=null;if(this.phase==='lobby'){this.P.delete(id);if(this.host===id)this.host=this.P.keys().next().value??null}this.push()});
this.push();return new Response(null,{status:101,webSocket:c})}
msg(p,m){const t=m.t,h=p.id===this.host,ph=this.phase,s=this.step;
if(t==='cd'&&h)this.cd(m.n);
else if(t==='cfg'&&h&&ph==='lobby'){const lim={u:0,cap:0,capWhen:0,selfW:0,capTie:0,reveal:0,seerTrue:0,auto:0,timer:[0,1800],pause:[.5,8],rolePause:[0,15],n:[0,20]};if(m.k in lim){let x=m.v;if(Array.isArray(lim[m.k]))x=Math.max(lim[m.k][0],Math.min(lim[m.k][1],+x||0));this.cfg[m.k]=x}}
else if(t==='role'&&h&&ph==='lobby'&&m.k in RL){if(this.cfg.auto){this.cfg.r=suggest(this.cfg.n||this.P.size);this.cfg.auto=false}this.cfg.r[m.k]=Math.max(0,Math.min(m.k==='werwolf'?6:1,Math.round(+m.v)||0))}
else if(t==='lock'&&h&&ph==='lobby')this.locked=!!m.v;
else if(t==='kick'&&h&&ph==='lobby'&&m.id!==p.id){const q=this.P.get(m.id);if(q){try{q.ws?.send('{"err":"Du wurdest vom Host entfernt."}');q.ws?.close()}catch{}q.ws=null;this.P.delete(m.id)}}
else if(t==='start'&&h&&ph==='lobby'&&this.P.size>=4)this.start();
else if(t==='seen'&&ph==='roles'){this.seenR.add(p.id);if(this.seenR.size>=this.P.size&&!this.readyAt){this.readyAt=Date.now()+this.cfg.rolePause*1000;setTimeout(()=>this.push(),this.cfg.rolePause*1000+150)}}
else if(t==='more'&&h&&s==='talk'&&this.tEnd)this.tEnd=Math.max(this.tEnd,Date.now())+120000;
else if((t==='go'&&h&&((ph==='roles'&&this.ready())||s==='out'||s==='cap'))||(t==='gof'&&h&&ph==='roles')){if(ph==='roles'&&this.cfg.cap&&this.cfg.capWhen==='start'){this.phase='day';this.step='wahl';this.aw='night';this.dead=[];this.sn=false;this.capNew=null;this.initW()}else this.night()}
else if(((t==='again'&&ph==='over')||(t==='reset'&&ph!=='lobby'))&&h){this.phase='lobby';this.step=null;this.win=null;this.locked=false;this.votes=new Map();for(const x of this.P.values()){x.alive=true;x.role=null}this.reset()}
else if(ph==='night'&&p.alive)this.nightMsg(p,m);
else if(ph==='day')this.dayMsg(p,m,h);
this.push()}
dayMsg(p,m,h){const t=m.t,s=this.step;
if(h&&t==='skip'&&s==='tie'&&this.cands){const a=this.cands;this.cands=null;this.actor=null;this.die(a[Math.floor(Math.random()*a.length)],'vote');this.settle()}
else if(h&&t==='skip'&&(s==='jaeger'||s==='nachf')){this.pend.shift();if(s==='nachf'&&this.A.length){const a=this.A;this.captain=a[Math.floor(Math.random()*a.length)].id;this.capNew=this.captain;this.capHow='nachf'}this.settle()}
else if(s==='talk'&&h&&t==='vs'){this.step='vote';this.votes=new Map()}
else if(s==='vote'||s==='wahl'){if(t==='vote'&&p.alive&&!this.votes.has(p.id)&&this.P.get(m.id)?.alive&&(s==='wahl'?((!this.cands||this.cands.includes(m.id))&&(this.cfg.selfW||m.id!==p.id)):m.id!==p.id))this.votes.set(p.id,m.id);
if((h&&t==='tally'&&s==='vote')||(h&&t==='tallyw'&&s==='wahl')||this.votes.size>=this.A.length)s==='vote'?this.tally():this.tallyW()}
else if(s==='tie'&&p.id===this.actor&&t==='tie'&&this.cands?.includes(m.id)){this.cands=null;this.actor=null;this.die(m.id,'vote');this.settle()}
else if(s==='jaeger'&&p.id===this.actor&&t==='shoot'&&this.P.get(m.id)?.alive){this.pend.shift();this.die(m.id,'jaeger');this.settle()}
else if(s==='nachf'&&p.id===this.actor&&t==='nachf'&&this.P.get(m.id)?.alive){this.pend.shift();this.captain=m.id;this.capNew=m.id;this.capHow='nachf';this.settle()}}
nightMsg(p,m){const t=m.t,s=this.step;
if(s==='thief'){if(p.role==='dieb'&&!this.thiefDone&&t==='thief'){const sp=this.spare,i=m.i;if(i===-1&&!sp.every(x=>x==='werwolf')){this.thiefDone=true;this.thiefId=p.id}else if(i===0||i===1){p.role=sp[i];p.origin='dieb';sp[i]='dieb';this.thiefDone=true;this.thiefId=p.id}}else if(this.thiefDone&&p.id===this.thiefId&&t==='next')this.next('thief')}
else if(s==='amor'&&p.role==='amor'&&t==='lv'){const[a,b]=m.ids||[];if(a&&b&&a!==b&&this.P.get(a)?.alive&&this.P.get(b)?.alive){this.lovers=[a,b];this.next('amor')}}
else if(s==='lovers'&&this.lovers?.includes(p.id)&&t==='lok'){this.lk.add(p.id);if(this.lk.size>=2)this.next('lovers')}
else if(s==='prot'&&p.role==='heiler'&&t==='prot'&&m.id!==this.lastProt&&this.P.get(m.id)?.alive){this.protect=m.id;this.next('prot')}
else if(s==='wolves'&&p.role==='werwolf'){
if(t==='pick'&&this.P.get(m.id)?.alive&&this.P.get(m.id).role!=='werwolf'){this.wp.set(p.id,m.id);this.wok.clear()}
if(t==='ok'&&(this.cfg.u?this.same():this.wp.has(p.id)))this.wok.add(p.id);
if(this.W.every(x=>this.wok.has(x.id)))this.wolvesDone()}
else if(s==='seer'&&p.role==='seherin'){
if(t==='see'&&!this.seen&&m.id!==p.id&&this.P.get(m.id)?.alive)this.seen={id:m.id,w:this.P.get(m.id).role==='werwolf',role:['dieb','amor'].includes(this.P.get(m.id).role)?'dorfbewohner':this.P.get(m.id).role};
if(t==='next'&&this.seen)this.next('seer')}
else if(s==='heal'&&p.role==='hexe'&&t==='heal'){if(m.yes&&this.pot.heal&&this.victim){this.healed=true;this.pot.heal=false}this.next('heal')}
else if(s==='poison'&&p.role==='hexe'&&t==='poison'){const q=this.P.get(m.id);if(m.id&&this.pot.poison&&q?.alive&&q.id!==p.id){this.poisoned=m.id;this.pot.poison=false}this.next('poison')}}
wolvesDone(){const c={};for(const v of this.wp.values())c[v]=(c[v]||0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]);
this.victim=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;this.next('wolves')}
has(s){if(s==='thief')return this.nn===1&&this.A.some(x=>x.role==='dieb');if(s==='amor')return this.nn===1&&this.A.some(x=>x.role==='amor');if(s==='lovers')return this.nn===1&&!!this.lovers;return this.A.some(x=>x.role===ROLE[s])}
go(s){if(s==='end'){this.step='wait';return this.say('dorf-erwacht',()=>this.dawn(),800)}
if(!this.has(s))return this.go(NEXT[s]);
this.step=s;if(s!=='poison')this.say(CUE[s][0]);this.push()}
done(s){if(s==='heal')return this.go('poison');this.step='wait';this.nx=NEXT[s];this.say(CUE[s==='poison'?'heal':s][1],()=>this.go(NEXT[s]))}
next(s){if(this.step===s)this.done(s)}
say(id,cb,pz){const n=++this.cueN;this.cue={id,n};this.cb=cb||null;this.pz=pz??Math.round(this.cfg.pause*1000);clearTimeout(this.ct);if(cb)this.ct=setTimeout(()=>this.cd(n),9000);this.push()}
cd(n){if(n!==this.cueN||!this.cb)return;clearTimeout(this.ct);const f=this.cb;this.cb=null;setTimeout(()=>{f();this.push()},this.pz)}
night(){this.phase='night';this.nn++;this.nightReset();this.dead=[];this.step='wait';this.nx='thief';this.say('nacht-beginnt',()=>this.go('thief'))}
die(id,how){const p=this.P.get(id);if(!p||!p.alive)return;p.alive=false;this.dead.push({id,how});
if(this.lovers&&this.lovers.includes(id))this.die(this.lovers.find(x=>x!==id),'liebe');
if(p.role==='jaeger')this.pend.push({t:'jaeger',id});
if(this.captain===id)this.pend.push({t:'nachf',id});this.pend.sort((a,b)=>(a.t==='jaeger'?0:1)-(b.t==='jaeger'?0:1))}
dawn(){this.dead=[];this.kind='n';this.sn=false;this.capNew=null;this.lot=false;if(this.victim&&!this.healed&&this.protect!==this.victim)this.die(this.victim,'wolf');if(this.poisoned)this.die(this.poisoned,'gift');
this.lastProt=this.protect||null;this.phase='day';this.cont=(this.cfg.cap&&!this.captain&&this.cfg.capWhen==='n1'&&this.nn===1)?'wahl':'talk';this.settle()}
tally(){const c={};for(const[a,b]of this.votes)c[b]=(c[b]||0)+(a===this.captain?2:1);this.res={k:'v',r:Object.entries(c).sort((a,b)=>b[1]-a[1])};const mx=Math.max(0,...Object.values(c)),top=Object.keys(c).filter(k=>c[k]===mx);
this.dead=[];this.kind='v';this.sn=false;this.capNew=null;this.lot=false;this.cont='out';
if(top.length>1&&this.cfg.cap&&this.captain&&this.P.get(this.captain)?.alive){this.cands=top;this.step='tie';this.actor=this.captain;return}
if(top.length===1)this.die(top[0],'vote');this.settle()}
initW(){this.votes=new Map();this.retry=0;this.capNone=false;this.cands=null;this.rnd=1;this.lot=false}
tallyW(){const c={};for(const b of this.votes.values())c[b]=(c[b]||0)+1;this.res={k:'w',r:Object.entries(c).sort((a,b)=>b[1]-a[1])};const mx=Math.max(0,...Object.values(c));let top=Object.keys(c).filter(k=>c[k]===mx);if(!top.length)top=this.A.map(x=>x.id);
this.votes=new Map();if(top.length>1&&this.rnd<3){this.cands=top;this.rnd++;this.retry=1;return}
if(top.length>1&&this.cfg.capTie==='entfall'){this.retry=0;this.cands=null;this.captain=null;this.capNew=null;this.capNone=true;if(this.aw==='night'){this.aw=null;this.step='cap'}else{this.step='talk';this.startT()}return}
let o=top[0];if(top.length>1){o=top[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*top.length)];this.lot=true}
this.retry=0;this.cands=null;this.captain=o;this.capNew=o;this.capHow='wahl';if(this.aw==='night'){this.aw=null;this.step='cap'}else{this.step='talk';this.startT()}}
settle(){while(this.pend.length&&!this.A.length)this.pend.shift();
if(!this.pend.length){const x=this.check();if(x)return this.fin(x)}
const q=this.pend[0];if(q){this.sn=true;this.step=q.t;this.actor=q.id;return this.push()}
this.actor=null;this.step=this.cont;if(this.step==='talk')this.startT();if(this.step==='wahl'){this.sn=true;this.initW()}this.push()}
check(){const A=this.A,w=A.filter(x=>x.role==='werwolf').length,o=A.length-w;
if(this.lovers&&A.length===2&&this.lovers.every(i=>this.P.get(i).alive))return w===2?'wolf':'liebe';
if(!w)return'dorf';if(!o)return'wolf';
if(w===1&&o===1){const c=this.cfg.cap&&this.captain&&this.P.get(this.captain);return c&&c.alive&&c.role!=='werwolf'?'dorf':'wolf'}
return null}
fin(w){const L=[...this.P.values()];if((w==='dorf'||w==='wolf')&&this.A.length===2&&this.W.length===1){const l=this.A.find(x=>(x.role==='werwolf')===(w==='dorf'));if(l)l.alive=false}this.win={w,ids:w==='dorf'?L.filter(x=>x.role!=='werwolf').map(x=>x.id):w==='wolf'?L.filter(x=>x.role==='werwolf').map(x=>x.id):[]};this.phase='over';this.step=null;this.push()}
start(){const ids=[...this.P.keys()],list=build(ids.length,this.cfg);if(!list)return;shuf(list);let sp=[];
if(list.includes('dieb')){list.splice(list.indexOf('dieb'),1);sp=[list.pop(),list.pop()];list.push('dieb');shuf(list)}
this.spare=sp;ids.forEach((id,i)=>this.P.get(id).role=list[i]);this.seenR=new Set();this.readyAt=0;this.phase='roles'}
ready(){return this.seenR.size>=this.P.size&&this.readyAt>0&&Date.now()>=this.readyAt}
startT(){this.tEnd=this.cfg.timer>0?Date.now()+this.cfg.timer*1000:0}
push(){this.save();for(const p of this.P.values()){try{p.ws?.send(JSON.stringify(this.view(p)))}catch{}}}
view(p){const L=[...this.P.values()],s=this.step,ph=this.phase,v={phase:ph,step:s,host:this.host,cfg:this.cfg,win:this.win,dead:this.dead,kind:this.kind,captain:this.captain,actor:this.actor,locked:this.locked,res:this.res,capNone:this.capNone,tEnd:this.tEnd,now:Date.now(),retry:this.retry,capHow:this.capHow,lot:this.lot,cands:this.cands,rnd:this.rnd,capNew:this.capNew,news:this.sn,pm:this.pend.some(q=>q.id===p.id),
me:{id:p.id,name:p.name,role:p.role,alive:p.alive},
players:L.map(x=>({id:x.id,name:x.name,alive:x.alive,on:!!x.ws,role:((!x.alive&&this.cfg.reveal)||ph==='over'||x.id===p.id)?x.role:undefined}))};
if(this.lovers&&(ph==='over'||this.lovers.includes(p.id)))v.lovers=this.lovers;
if(p.role==='werwolf'&&ph!=='lobby')v.mates=L.filter(x=>x.role==='werwolf').map(x=>x.id);
if(ph==='night'&&p.alive){
if(s==='wolves'&&p.role==='werwolf'){const c={};for(const t of this.wp.values())c[t]=(c[t]||0)+1;Object.assign(v,{picks:c,mine:this.wp.get(p.id),ok:this.wok.has(p.id),can:this.cfg.u?this.same():this.wp.has(p.id)})}
if(s==='seer'&&p.role==='seherin')v.seen=this.seen;
if(s==='thief'&&(p.role==='dieb'||p.id===this.thiefId)){v.thiefDone=this.thiefDone;if(!this.thiefDone){v.spare=this.spare;v.must=this.spare.every(x=>x==='werwolf')}}
if(s==='prot'&&p.role==='heiler')v.last=this.lastProt;
if(s==='lovers'&&this.lovers?.includes(p.id)){v.partner=this.lovers.find(x=>x!==p.id);v.lok=this.lk.has(p.id)}
if((s==='heal'||s==='poison')&&p.role==='hexe')Object.assign(v,{victim:this.protect===this.victim?null:this.victim,pot:this.pot})}
if(ph==='day'&&(s==='vote'||s==='wahl'))Object.assign(v,{voted:this.votes.has(p.id),n:this.votes.size,total:this.A.length,missing:this.A.filter(x=>!this.votes.has(x.id)).map(x=>x.id)});
if(ph==='lobby'){const e=this.cfg.auto?suggest(this.cfg.n||this.P.size):this.cfg.r,np=this.cfg.n||this.P.size;v.eff=e;v.vil=np+(e.dieb?2:0)-Object.values(e).reduce((a,b)=>a+b,0);v.rolesOk=!!build(this.P.size,this.cfg)}
if(ph==='roles'){v.seenN=this.seenR.size;v.total=this.P.size;v.ready=this.ready()}
if(p.id===this.host&&this.cue)v.cue=this.cue;return v}}
