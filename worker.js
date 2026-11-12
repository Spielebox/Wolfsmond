export default{fetch(r,e){const u=new URL(r.url),c=(u.searchParams.get('room')||'').toUpperCase();if(!c)return new Response('Wolfsmond läuft');return e.ROOM.get(e.ROOM.idFromName(c)).fetch(r)}};
const ROLE={thief:'dieb',amor:'amor',prot:'heiler',seer:'seherin',wolves:'werwolf',heal:'hexe',poison:'hexe',raven:'rabe'},
NEXT={thief:'amor',amor:'lovers',lovers:'prot',prot:'seer',seer:'wolves',wolves:'heal',heal:'poison',poison:'raven',raven:'end'},
CUE={thief:['dieb-erwacht','dieb-schlaeft'],amor:['amor-erwacht','amor-schlaeft'],lovers:['verliebte-erwachen','verliebte-schlafen'],prot:['heiler-erwacht','heiler-schlaeft'],seer:['seherin-erwacht','seherin-schlaeft'],wolves:['werwoelfe-erwachen','werwoelfe-schlafen'],heal:['hexe-erwacht','hexe-schlaeft'],raven:['rabe-erwacht','rabe-schlaeft']},
KEYS=['phase','step','host','cfg','win','pot','victim','healed','poisoned','seen','nx','captain','lovers','nn','protect','lastProt','dead','kind','pend','cont','aw','actor','retry','sn','capNew','cands','rnd','lot','capHow','res','spare','thiefDone','thiefId','capNone','tEnd','fool','foolCap','bitId','desp','vset','bockId','curseId','dieb','hr','appId','appFrom','markId','log','tf','evDrawn','ef','rd','noCap','tieN','tieSure','victim2','wRound','protect2','lastProt2','healId','seen2','alt','mkc','tNext','tImm'];
const RL={werwolf:1,seherin:1,hexe:1,jaeger:1,amor:1,heiler:1,maedchen:1,dieb:1,wolfshund:1,dorfdepp:1,alter:1,suendenbock:1,verfluchter:1,schwestern:1,lehrling:1,verdaechtiger:1,rabe:1};
function suggest(n){return{werwolf:n<6?1:n<9?2:n<13?3:4,seherin:n>=5?1:0,hexe:n>=6?1:0,jaeger:n>=6?1:0,amor:n>=7?1:0,heiler:0,maedchen:n>=11?1:0,dieb:n>=12?1:0}}
const EV=[
{id:'gewitter',g:'tag',t:'Gewitter',x:'Ein schweres Unwetter zieht auf. Alle fliehen in ihre Häuser, heute findet keine Abstimmung statt.'},
{id:'verbannt',g:'tag',t:'Verbannt',x:'Das Dorf verbannt {a} bis zum nächsten Morgen. Heute keine Stimme, und die Nacht verbringt er fern vom Dorf. Er kann nichts tun und nicht sterben.'},
{id:'gnade',g:'tag',t:'Gnade des Dorfes',x:'Das Dorf zeigt Gnade: {a} kann heute nicht gewählt werden.'},
{id:'fackelzug',g:'tag',t:'Fackelzug',x:'Der Zorn des Dorfes ist groß. Heute scheiden die beiden Spieler mit den meisten Stimmen aus.'},
{id:'machtwechsel',g:'tag',t:'Machtwechsel',x:'Das Dorf hat genug von seinem Hauptmann. Er verliert sein Amt, ein neuer wird gewählt, der bisherige darf nicht noch einmal antreten.'},
{id:'machtwort',g:'tag',t:'Machtwort',x:'Heute spricht der Hauptmann allein. Er entscheidet ohne Abstimmung, wer ausscheidet.'},
{id:'schwache',g:'tag',t:'Schwache Stimme',x:'Heute hört kaum jemand auf den Hauptmann: Seine Stimme zählt nur einfach.'},
{id:'stichwahl',g:'tag',t:'Stichwahl',x:'Das Dorf ist unentschlossen. Heute wird zweimal abgestimmt, in der zweiten Runde stehen nur die Spieler mit den meisten Stimmen zur Wahl.'},
{id:'rufmord',g:'tag',t:'Rufmord',x:'Ein übles Gerücht macht die Runde: {a} gilt als verdächtig und bekommt bei der Abstimmung eine Stimme gegen sich dazu.'},
{id:'eilverfahren',g:'tag',t:'Eilverfahren',x:'Es bleibt keine Zeit zum Reden. Heute folgt direkt die Abstimmung.'},
{id:'geisterstunde',g:'tag',t:'Geisterstunde',x:'Die Geister der Ausgeschiedenen sind unruhig. Einigt euch mit einfacher Mehrheit auf eine Ja/Nein-Frage und stellt sie den Ausgeschiedenen. Fragen nach der Rolle einer bestimmten Person sind verboten.'},
{id:'beichtstuhl',g:'tag',t:'Beichtstuhl',x:'{a}, hast du eine Sonderrolle? Antworte allen mit Ja oder Nein. Lügen ist erlaubt.'},
{id:'stumme',g:'tag',t:'Der Stumme',x:'{a} hat heute die Sprache verloren und darf nur nicken oder den Kopf schütteln.'},
{id:'wanderer',g:'info',t:'Der Wanderer',x:'Ein Wanderer kam durchs Dorf und hat einem von euch etwas anvertraut. Wem und was, bleibt geheim.'},
{id:'glocken',g:'info',t:'Kirchenglocken',x:'Die Kirchenglocken läuten. So viele Werwölfe sind noch im Dorf: {z}'},
{id:'geruecht',g:'info',t:'Das Gerücht',x:'Im Dorf munkelt man: Unter {a} und {b} ist mindestens ein Werwolf.'},
{id:'klaresicht',g:'info',t:'Klare Sicht',x:'Der Mond steht klar am Himmel. In der nächsten Nacht darf die Seherin zwei Spieler ansehen.'},
{id:'blutmond',g:'nacht',t:'Blutmond',x:'Ein blutroter Vollmond geht auf. In der nächsten Nacht wählen die Werwölfe zwei Opfer.'},
{id:'sternen',g:'nacht',t:'Sternenklare Nacht',x:'Die Sterne leuchten hell. In der nächsten Nacht darf der Heiler dieselbe Person erneut schützen.'},
{id:'friedlich',g:'nacht',t:'Friedliche Nacht',x:'Die Wölfe haben sich in den Wald zurückgezogen. In der nächsten Nacht gibt es keinen Biss.'},
{id:'schlaftrunk',g:'nacht',t:'Schlaftrunk',x:'Im Dorf geht ein Schlaftrunk um. {a} schläft in der nächsten Nacht tief und kann nichts tun.'},
{id:'doppelschutz',g:'nacht',t:'Doppelter Schutz',x:'Der Heiler findet neue Kraft. In der nächsten Nacht schützt er zwei Spieler, keiner darf der zuletzt Geschützte sein.'},
{id:'markt',g:'nacht',t:'Der Markt',x:'Ein fahrender Händler hat der Hexe etwas mitgebracht. In der nächsten Nacht bekommt sie einen verbrauchten Trank zurück.'},
{id:'omen',g:'nacht',t:'Schlechtes Omen',x:'Ein schlechtes Omen liegt über dem Dorf. In der nächsten Nacht verliert die Hexe einen unverbrauchten Trank, der Zufall entscheidet welchen.'},
{id:'wunder',g:'nacht',t:'Das Wunder',x:'Ein Wunder geschieht! Das Opfer der Werwölfe aus der letzten Nacht kehrt als normaler Bürger zurück{a}.'},
{id:'graeber',g:'dauer',t:'Verhüllte Gräber',x:'Ab jetzt bleiben die Gräber verhüllt: Man erfährt nur noch, wer gestorben ist, nicht welche Rolle er hatte.'},
{id:'krone',g:'dauer',t:'Die Krone',x:'Ab jetzt zählt die Stimme des Hauptmanns dreifach.'},
{id:'richter',g:'dauer',t:'Der Richter',x:'Ab jetzt hat der Hauptmann nur noch eine einfache Stimme, bei Gleichstand entscheidet aber sein Votum.'},
{id:'altlasten',g:'dauer',t:'Altlasten',x:'Ab jetzt hängt ein Verdacht nach: Wer bei der Abstimmung die zweitmeisten Stimmen hatte, nimmt eine Stimme mit in die nächste Abstimmung.'},
{id:'muede',g:'dauer',t:'Müde Wölfe',x:'Ab jetzt sind die Wölfe erschöpft. Sie beißen nur noch in jeder zweiten Nacht.'},
{id:'fuehrungslos',g:'dauer',t:'Führungslos',x:'Ab jetzt wird kein neuer Hauptmann mehr ernannt, wenn der Hauptmann stirbt.'},
{id:'stille',g:'dauer',t:'Stille Nacht',x:'Ab jetzt wird jede dritte Nacht totenstill: Nur die Werwölfe wachen auf, alle anderen schlafen durch.'}],
EVI=Object.fromEntries(EV.map(c=>[c.id,c]));
function defCfg(){return{ev:'aus',evOn:EV.map(x=>x.id),u:true,cap:true,capWhen:'n1',rabeN:'1',selfW:false,capTie:'los',reveal:true,seerTrue:false,timer:300,pause:2.5,rolePause:3,auto:true,n:6,r:suggest(6)}}
function build(n,c){const r=c.auto?suggest(n):c.r,l=[];if(!r.werwolf)return null;for(const[k,v]of Object.entries(r))if(!((k==='lehrling'||k==='verdaechtiger')&&!r.seherin))for(let i=0;i<(k==='schwestern'?v*2:v);i++)l.push(k==='schwestern'?'schwester':k);const p=n+(r.dieb?2:0);if(l.length>p)return null;while(l.length<p)l.push('dorfbewohner');return l}
function shuf(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export class Room{
constructor(st,env){this.st=st.storage;this.env=env;this.locked=false;this.phase='lobby';this.step=null;this.P=new Map();this.host=null;this.cfg=defCfg();this.win=null;this.votes=new Map();this.cueN=0;this.cue=null;this.cb=null;this.pz=2500;this.reset();
st.blockConcurrencyWhile(async()=>{const d=await this.st.get('s');if(d)this.load(d)})}
reset(){this.tf=null;this.evDrawn=[];this.ef=null;this.rd=null;this.noCap=null;this.tieN=1;this.tieSure=[];this.pot={heal:true,poison:true};this.captain=null;this.lovers=null;this.nn=0;this.lastProt=null;this.lastProt2=null;this.alt=[];this.dead=[];this.kind=null;this.pend=[];this.cont=null;this.aw=null;this.actor=null;this.retry=0;this.nx=null;this.sn=false;this.capNew=null;this.cands=null;this.rnd=1;this.lot=false;this.capHow=null;this.res=null;this.spare=[];this.capNone=false;this.tEnd=0;this.seenR=new Set();this.readyAt=0;this.vset=null;this.bockId=null;this.log=[];this.nightReset()}
nightReset(){this.markId=null;this.bitId=null;this.curseId=null;this.desp=false;this.fool=null;this.foolCap=false;this.wp=new Map();this.wok=new Set();this.victim=null;this.victim2=null;this.wRound=1;this.protect2=null;this.healId=null;this.seen2=null;this.mkc=false;this.sl=new Set();this.healed=false;this.poisoned=null;this.seen=null;this.protect=null;this.lk=new Set();this.thiefDone=false;this.thiefId=null}
save(){try{this.st.put('s',this.dump())}catch{}}
dump(){const o={};KEYS.forEach(k=>o[k]=this[k]);o.P=[...this.P.values()].map(({id,name,role,alive,fool,bites,orig})=>({id,name,role,alive,fool,bites,orig}));o.wp=[...this.wp];o.wok=[...this.wok];o.votes=[...this.votes];o.lk=[...this.lk];o.sl=[...this.sl];return o}
load(d){KEYS.forEach(k=>{if(d[k]!==undefined)this[k]=d[k]});this.P=new Map(d.P.map(p=>[p.id,p]));this.wp=new Map(d.wp);this.wok=new Set(d.wok);this.votes=new Map(d.votes);this.lk=new Set(d.lk||[]);this.sl=new Set(d.sl||[]);
if(this.phase==='lobby'){this.P.clear();this.host=null}else if(this.phase==='night')this.go(this.step==='wait'||!this.step?(this.nx||'thief'):this.step)}
get A(){return[...this.P.values()].filter(x=>x.alive)}
get V(){const e=this.ef,a=this.A.filter(x=>!x.fool&&!(e&&e.id==='verbannt'&&e.a===x.id&&this.step==='vote')),b=this.vset?a.filter(x=>this.vset.includes(x.id)):a;return b.length?b:a}
pn(id){return this.tf&&this.tf.notes.find(n=>n.id===id&&n.k==='perm')}
away(){const e=this.ef;return e&&e.id==='verbannt'?e.a:null}
slp(){const e=this.ef;return e&&e.id==='schlaftrunk'?e.a:null}
idle(id){return !!id&&(id===this.away()||id===this.slp())}
still(){const n=this.pn('stille');return !!n&&this.nn>n.d&&(this.nn-n.d)%3===0}
rest(){const n=this.pn('muede');return !!n&&this.nn>n.d&&(this.nn-n.d)%2===1}
nightFx(){const e=this.ef||{},k=['heal','poison'],pk=a=>a[Math.floor(Math.random()*a.length)];if(e.id==='markt'){const u=k.filter(x=>!this.pot[x]);if(u.length===1)this.pot[u[0]]=true;else if(u.length===2)this.mkc=true}if(e.id==='omen'){const u=k.filter(x=>this.pot[x]);if(u.length)this.pot[pk(u)]=false}}
revive(){for(const q of this.dead.filter(q=>q.how==='wolf')){const p=this.P.get(q.id);if(p){p.alive=true;if(p.role!=='dorfbewohner'){p.orig=p.orig||p.role;p.role='dorfbewohner'}}this.pend=this.pend.filter(z=>z.id!==q.id||z.t==='nachf')}this.dead=this.dead.filter(q=>q.how!=='wolf')}
get Wa(){return this.W.filter(x=>!this.idle(x.id))}
get W(){return this.A.filter(x=>x.role==='werwolf')}
same(){const w=this.Wa;return w.length>0&&w.every(x=>this.wp.has(x.id))&&new Set(w.map(x=>this.wp.get(x.id))).size===1}
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
else if(t==='cfg'&&h&&ph==='lobby'){const lim={u:0,cap:0,capWhen:0,selfW:0,capTie:0,rabeN:0,reveal:0,seerTrue:0,auto:0,timer:[0,1800],pause:[.5,8],rolePause:[0,15],n:[0,20]};if(m.k==='ev'){if(['aus','selten','mittel','taeglich'].includes(m.v))this.cfg.ev=m.v}else if(m.k==='auto'){if(!m.v&&this.cfg.auto)this.cfg.r=suggest(this.cfg.n||this.P.size);this.cfg.auto=!!m.v}else if(m.k in lim){let x=m.v;if(Array.isArray(lim[m.k]))x=Math.max(lim[m.k][0],Math.min(lim[m.k][1],+x||0));this.cfg[m.k]=x}}
else if(t==='evon'&&h&&ph==='lobby'&&Array.isArray(m.ids)){const s=new Set(this.cfg.evOn||[]);for(const i of m.ids)if(EVI[i]){if(m.v)s.add(i);else s.delete(i)}this.cfg.evOn=EV.map(x=>x.id).filter(i=>s.has(i))}
else if(t==='rsug'&&h&&ph==='lobby'){this.cfg.r=suggest(this.cfg.n||this.P.size);this.cfg.auto=false}
else if(t==='cfgall'&&h&&ph==='lobby'){const d=defCfg(),c=m.c;if(c&&typeof c==='object'){for(const k of['u','cap','selfW','reveal','seerTrue'])if(typeof c[k]==='boolean')d[k]=c[k];if(['n1','start'].includes(c.capWhen))d.capWhen=c.capWhen;if(['1','2'].includes(c.rabeN))d.rabeN=c.rabeN;if(['los','entfall'].includes(c.capTie))d.capTie=c.capTie;if(['aus','selten','mittel','taeglich'].includes(c.ev))d.ev=c.ev;if(Array.isArray(c.evOn))d.evOn=EV.map(x=>x.id).filter(i=>c.evOn.includes(i));
for(const[k,[a,b]]of Object.entries({timer:[0,1800],pause:[.5,8],rolePause:[0,15]}))if(typeof c[k]==='number')d[k]=Math.max(a,Math.min(b,c[k]));
if(typeof c.n==='number')d.n=Math.max(0,Math.min(20,Math.round(c.n)));if(c.auto===false&&c.r){d.auto=false;for(const k in RL)d.r[k]=Math.max(0,Math.min(k==='werwolf'?6:1,Math.round(+c.r[k])||0))}}this.cfg=d}
else if(t==='role'&&h&&ph==='lobby'&&m.k in RL){if(this.cfg.auto){this.cfg.r=suggest(this.cfg.n||this.P.size);this.cfg.auto=false}this.cfg.r[m.k]=Math.max(0,Math.min(m.k==='werwolf'?6:1,Math.round(+m.v)||0));if(!this.cfg.r.seherin){this.cfg.r.lehrling=0;this.cfg.r.verdaechtiger=0}}
else if(t==='lock'&&h&&ph==='lobby')this.locked=!!m.v;
else if(t==='kick'&&h&&ph==='lobby'&&m.id!==p.id){const q=this.P.get(m.id);if(q){try{q.ws?.send('{"err":"Du wurdest vom Host entfernt."}');q.ws?.close()}catch{}q.ws=null;this.P.delete(m.id)}}
else if(t==='start'&&h&&ph==='lobby'&&this.P.size>=4)this.start();
else if(t==='seen'&&ph==='roles'){if(!(p.id===this.dieb&&!this.thiefDone)){this.seenR.add(p.id);this.redo?.delete(p.id);this.chk()}}
else if(t==='thief'&&ph==='roles'&&p.id===this.dieb&&!this.thiefDone)this.thiefPick(p,m.i)
else if(t==='dog'&&ph==='roles'&&p.role==='wolfshund'&&(m.r==='werwolf'||m.r==='dorfbewohner')){p.role=m.r;this.chk()}
else if(t==='more'&&h&&s==='talk'&&this.tEnd)this.tEnd=Math.max(this.tEnd,Date.now())+120000;
/*TEST-START*/else if(t==='tst'&&h){if('n' in m)this.tNext=EV.some(x=>x.id===m.n)?m.n:null;if('i' in m)this.tImm=!!m.i}/*TEST-END*/
else if((t==='go'&&h&&((ph==='roles'&&this.ready())||s==='out'||s==='cap'||(s==='talk'&&this.ef&&this.ef.id==='gewitter')))||(t==='gof'&&h&&ph==='roles')){if(ph==='roles'){this.thiefAuto();this.dogAuto()}if(ph==='roles'&&this.cfg.cap&&this.cfg.capWhen==='start'){this.phase='day';this.step='wahl';this.aw='night';this.dead=[];this.sn=false;this.capNew=null;this.initW()}else this.night()}
else if(((t==='again'&&ph==='over')||(t==='reset'&&ph!=='lobby'))&&h){this.phase='lobby';this.step=null;this.win=null;this.locked=false;this.votes=new Map();for(const x of this.P.values()){x.alive=true;x.role=null}this.reset()}
else if(ph==='night'&&p.alive)this.nightMsg(p,m);
else if(ph==='day')this.dayMsg(p,m,h);
this.push()}
dayMsg(p,m,h){const t=m.t,s=this.step;
if(h&&t==='skip'&&s==='tie'&&this.cands){const a=[...this.cands],n=this.tieN||1,pick=[];while(pick.length<n&&a.length)pick.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);const sure=this.tieSure||[];this.cands=null;this.actor=null;this.tieN=1;this.tieSure=[];this.rd=null;[...sure,...pick].forEach(i=>this.vdie(i));this.settle()}
else if(h&&t==='skip'&&(s==='jaeger'||s==='nachf'||s==='bock')){this.pend.shift();if(s==='nachf'&&this.A.length){const a=this.A;this.captain=a[Math.floor(Math.random()*a.length)].id;this.capNew=this.captain;this.capHow='nachf'}this.settle()}
else if(s==='talk'&&h&&t==='vs'&&!(this.ef&&this.ef.id==='gewitter')){const e=this.ef||{};this.step='vote';this.votes=new Map();this.cands=null;this.rd={m:e.id==='stichwahl'?'s':e.id==='fackelzug'?'f':null,r:1};if(e.id==='machtwort'&&this.cfg.cap&&this.captain){const q=this.P.get(this.captain);if(q&&q.alive&&!q.fool)this.vset=[this.captain]}}
else if(s==='vote'||s==='wahl'){if(t==='vote'&&p.alive&&this.V.some(x=>x.id===p.id)&&!this.votes.has(p.id)&&this.P.get(m.id)?.alive&&(s==='wahl'?((!this.cands||this.cands.includes(m.id))&&m.id!==this.noCap&&(this.cfg.selfW||m.id!==p.id)):m.id!==p.id&&!this.P.get(m.id).fool&&(!this.cands||this.cands.includes(m.id))&&!(this.ef&&this.ef.id==='gnade'&&this.ef.a===m.id)))this.votes.set(p.id,m.id);
if((h&&t==='tally'&&s==='vote')||(h&&t==='tallyw'&&s==='wahl')||this.votes.size>=this.V.length)s==='vote'?this.tally():this.tallyW()}
else if(s==='tie'&&p.id===this.actor&&t==='tie'){const ids=(Array.isArray(m.ids)?m.ids:[m.id]).filter((x,i,a)=>this.cands?.includes(x)&&a.indexOf(x)===i);if(ids.length===(this.tieN||1)){const sure=this.tieSure||[];this.cands=null;this.actor=null;this.tieN=1;this.tieSure=[];this.rd=null;[...sure,...ids].forEach(i=>this.vdie(i));this.settle()}}
else if(s==='jaeger'&&p.id===this.actor&&t==='shoot'&&(m.id===null||this.P.get(m.id)?.alive)){this.pend.shift();if(m.id!==null)this.die(m.id,'jaeger');this.settle()}
else if(s==='nachf'&&p.id===this.actor&&t==='nachf'&&this.P.get(m.id)?.alive){this.pend.shift();this.captain=m.id;this.capNew=m.id;this.capHow='nachf';this.settle()}
else if(s==='bock'&&p.id===this.actor&&t==='bock'&&Array.isArray(m.ids)){const ids=m.ids.filter(i=>this.P.get(i)?.alive&&!this.P.get(i).fool);if(ids.length){this.pend.shift();this.vset=[...new Set(ids)];this.settle()}}}
nightMsg(p,m){const t=m.t,s=this.step;
if(this.idle(p.id)){if(t==='slp'){if(s==='wolves'&&p.role==='werwolf'){this.sl.add(p.id);if(this.W.every(x=>this.idle(x.id)?this.sl.has(x.id):this.wok.has(x.id)))this.wolvesDone()}else if(s!=='wolves'&&ROLE[s]===p.role&&['prot','seer','heal','poison','raven'].includes(s))this.next(s)}return}
if(s==='thief'){if(p.role==='dieb'&&!this.thiefDone&&t==='thief'){const sp=this.spare,i=m.i;if(i===-1&&!sp.every(x=>x==='werwolf')){this.thiefDone=true;this.thiefId=p.id}else if(i===0||i===1){p.role=sp[i];p.origin='dieb';sp[i]='dieb';this.thiefDone=true;this.thiefId=p.id}}else if(this.thiefDone&&p.id===this.thiefId&&t==='next'&&p.role!=='wolfshund')this.next('thief');else if(this.thiefDone&&p.id===this.thiefId&&p.role==='wolfshund'&&t==='dog'&&(m.r==='werwolf'||m.r==='dorfbewohner'))p.role=m.r}
else if(s==='amor'&&p.role==='amor'&&t==='lv'){const[a,b]=m.ids||[];if(a&&b&&a!==b&&this.P.get(a)?.alive&&this.P.get(b)?.alive){this.lovers=[a,b];this.L({e:'love',ids:[a,b],d:0});this.next('amor')}}
else if(s==='lovers'&&this.lovers?.includes(p.id)&&t==='lok'){this.lk.add(p.id);if(this.lk.size>=2)this.next('lovers')}
else if(s==='raven'&&p.role==='rabe'&&t==='mark'&&(m.id===null||this.P.get(m.id)?.alive)){this.markId=m.id;if(m.id)this.L({e:'mark',id:m.id,d:0});this.next('raven')}
else if(s==='prot'&&p.role==='heiler'&&t==='prot'){const e=this.ef||{},two=e.id==='doppelschutz',ban=e.id==='sternen'?[]:[this.lastProt,this.lastProt2].filter(Boolean),el=this.A.filter(x=>!ban.includes(x.id)).length,need=Math.min(two?2:1,el),ids=(two?(Array.isArray(m.ids)?m.ids:[]):[m.id]).filter((x,i,a)=>a.indexOf(x)===i&&this.P.get(x)?.alive&&!ban.includes(x));if(need>0&&ids.length===need){this.protect=ids[0];this.protect2=ids[1]||null;this.next('prot')}}
else if(s==='wolves'&&p.role==='werwolf'){
if(t==='pick'&&this.P.get(m.id)?.alive&&this.P.get(m.id).role!=='werwolf'&&m.id!==this.away()&&!(this.wRound===2&&m.id===this.victim)){if(this.wp.get(p.id)!==m.id){this.wp.set(p.id,m.id);const c={};for(const t of this.wp.values())c[t]=(c[t]||0)+1;const mx=Math.max(...Object.values(c)),top=Object.keys(c).filter(k=>c[k]===mx);if(!(top.length===1&&[...this.wok].every(i=>this.wp.get(i)===top[0])))this.wok.clear()}}
if(t==='ok'&&(this.cfg.u?this.same():this.wp.has(p.id)))this.wok.add(p.id);
if(this.W.every(x=>this.idle(x.id)?this.sl.has(x.id):this.wok.has(x.id)))this.wolvesDone()}
else if(s==='seer'&&p.role==='seherin'){
if(t==='see'&&!this.seen){const klar=this.ef&&this.ef.id==='klaresicht',ids=(klar?(Array.isArray(m.ids)?m.ids:[]):[m.id]).filter((x,i,a)=>a.indexOf(x)===i),okp=i=>i!==p.id&&i!==this.away()&&this.P.get(i)?.alive,need=klar?Math.min(2,this.A.filter(x=>okp(x.id)).length):1,f=i=>{const q=this.P.get(i),rr=this.rv(q),sus=rr==='verdaechtiger';return{id:i,w:q.role==='werwolf'||sus,role:sus?'werwolf':['dieb','amor','wolfshund'].includes(rr)?'dorfbewohner':rr}};if(need>0&&ids.length===need&&ids.every(okp)){this.seen=f(ids[0]);if(ids[1])this.seen2=f(ids[1])}};
if(t==='next'&&this.seen){if(this.appId===p.id)this.appId=null;this.next('seer')}}
else if(s==='heal'&&p.role==='hexe'&&t==='mk'){if(this.mkc&&(m.k==='heal'||m.k==='poison')){this.pot[m.k]=true;this.mkc=false}}
else if(s==='heal'&&p.role==='hexe'&&t==='heal'&&!this.mkc){if(m.yes&&this.pot.heal){const c=this.vvs(),i=c.includes(m.id)?m.id:c[0];if(i){this.healed=true;this.healId=i;this.pot.heal=false}}this.next('heal')}
else if(s==='poison'&&p.role==='hexe'&&t==='poison'){const q=this.P.get(m.id);if(m.id&&this.pot.poison&&q?.alive&&q.id!==p.id&&q.id!==this.away()){this.poisoned=m.id;this.pot.poison=false}this.next('poison')}}
wolvesDone(){const c={};for(const v of this.wp.values())c[v]=(c[v]||0)+1;const e=Object.entries(c).sort((a,b)=>b[1]-a[1]),vic=e.length&&(e.length===1||e[0][1]>e[1][1])?e[0][0]:null;
if(this.ef&&this.ef.id==='blutmond'&&this.wRound===1){this.victim=vic;this.wRound=2;this.wp=new Map();this.wok=new Set();this.sl=new Set();return this.push()}
if(this.wRound===2)this.victim2=vic;else this.victim=vic;this.next('wolves')}
has(s){if(s==='thief')return false;if(this.still()&&s!=='wolves')return false;if(s==='wolves'&&((this.ef&&this.ef.id==='friedlich')||this.rest()))return false;if(s==='raven')return this.A.some(x=>x.role==='rabe')&&(this.cfg.rabeN!=='2'||this.nn%2===0);if(s==='amor')return this.nn===1&&this.A.some(x=>x.role==='amor');if(s==='lovers')return this.nn===1&&!!this.lovers;return this.A.some(x=>x.role===ROLE[s])}
go(s){if(s!=='thief')this.dogAuto();if(s==='end'){this.step='wait';return this.say('dorf-erwacht',()=>this.dawn(),800)}
if(!this.has(s))return this.go(NEXT[s]);
this.step=s;if(s!=='poison')this.say(CUE[s][0]);this.push()}
done(s){if(s==='heal')return this.go('poison');this.step='wait';this.nx=NEXT[s];this.say(CUE[s==='poison'?'heal':s][1],()=>this.go(NEXT[s]))}
next(s){if(this.step===s)this.done(s)}
say(id,cb,pz){const n=++this.cueN;this.cue={id,n};this.cb=cb||null;this.pz=pz??Math.round(this.cfg.pause*1000);clearTimeout(this.ct);if(cb)this.ct=setTimeout(()=>this.cd(n),9000);this.push()}
cd(n){if(n!==this.cueN||!this.cb)return;clearTimeout(this.ct);const f=this.cb;this.cb=null;setTimeout(()=>{f();this.push()},this.pz)}
night(){this.phase='night';this.nn++;this.nightReset();this.nightFx();this.dead=[];this.step='wait';this.nx='thief';this.say('nacht-beginnt',()=>this.go('thief'))}
die(id,how){const p=this.P.get(id);if(!p||!p.alive)return;if(this.tImm)return;/*TEST*/p.alive=false;this.dead.push({id,how});this.L({e:'d',id,how,r:p.role,d:this.phase==='night'?0:1});
if(this.lovers&&this.lovers.includes(id))this.die(this.lovers.find(x=>x!==id),'liebe');
if(p.role==='seherin'){const l=[...this.P.values()].find(x=>x.alive&&x.role==='lehrling');if(l){l.orig='lehrling';l.role='seherin';this.appId=l.id;this.appFrom=id;this.L({e:'app',id:l.id,d:this.phase==='night'?0:1})}}
if(how==='bock')this.pend.push({t:'bock',id});
if(p.role==='jaeger')this.pend.push({t:'jaeger',id});
if(this.captain===id){if(this.pn('fuehrungslos')){this.captain=null;this.capNew=null}else this.pend.push({t:'nachf',id})}this.pend.sort((a,b)=>(a.t==='jaeger'?0:1)-(b.t==='jaeger'?0:1));if(p.role==='alter'&&['vote','jaeger','gift'].includes(how))this.despair()}
dawn(){this.dead=[];this.bockId=null;this.desp=false;this.bitId=null;this.curseId=null;this.kind='n';this.sn=false;this.capNew=null;this.lot=false;for(const vi of [this.victim,this.victim2].filter(Boolean)){const hz=this.healId===vi,pr=this.protect===vi||this.protect2===vi;if(hz||pr)this.L({e:'saved',id:vi,by:hz?'hexe':'heiler',d:0});else{const q=this.P.get(vi);if(q&&q.role==='alter'&&!(q.bites>0)){q.bites=1;this.bitId=q.id;this.L({e:'bite',id:q.id,d:0})}else if(q&&q.role==='verfluchter'&&this.poisoned!==vi){q.orig='verfluchter';q.role='werwolf';this.curseId=q.id;this.L({e:'curse',id:q.id,d:0})}else this.die(vi,'wolf')}}if(this.poisoned)this.die(this.poisoned,'gift');
this.lastProt=this.protect||null;this.lastProt2=this.protect2||null;this.phase='day';this.cont=(this.cfg.cap&&!this.captain&&this.cfg.capWhen==='n1'&&this.nn===1)?'wahl':'talk';this.evMorning();this.settle()}
tally(){const e=this.ef||{},rd=this.rd||{m:null,r:1},r1=rd.r===1;this.vset=null;this.bockId=null;this.desp=false;this.fool=null;this.foolCap=false;this.cands=null;const c={};for(const[a,b]of this.votes)c[b]=(c[b]||0)+(a===this.captain?(e.id==='schwache'?1:this.pn('krone')?3:this.pn('richter')?1:2):1);
if(r1){if(this.markId&&this.P.get(this.markId)?.alive)c[this.markId]=(c[this.markId]||0)+1;if(e.id==='rufmord'&&this.P.get(e.a)?.alive)c[e.a]=(c[e.a]||0)+1;for(const i of this.alt||[])if(this.P.get(i)?.alive)c[i]=(c[i]||0)+1}
this.markId=null;this.res={k:'v',r:Object.entries(c).sort((a,b)=>b[1]-a[1])};if(r1){const vs=[...new Set(Object.values(c))].filter(x=>x>0).sort((a,b)=>b-a);this.alt=this.pn('altlasten')&&vs[1]?Object.keys(c).filter(k=>c[k]===vs[1]):[]}const mx=Math.max(0,...Object.values(c)),top=Object.keys(c).filter(k=>c[k]===mx);
this.dead=[];this.kind='v';this.sn=false;this.capNew=null;this.lot=false;this.cont='out';
if(rd.m){const gr=[];for(const[id,n]of this.res.r){if(n<=0)continue;const g=gr.find(x=>x.n===n);if(g)g.ids.push(id);else gr.push({n,ids:[id]})}return rd.m==='s'?this.tallyS(gr,rd):this.tallyF(gr,rd)}
const bk=top.length>1&&this.A.find(x=>x.role==='suendenbock');if(bk){this.bockId=bk.id;this.die(bk.id,'bock');this.rd=null;this.settle();return}
if(top.length>1&&this.pn('richter')&&this.captain&&this.P.get(this.captain)?.alive&&top.includes(this.votes.get(this.captain))){this.rd=null;this.vdie(this.votes.get(this.captain));return this.settle()}
if(top.length>1&&this.cfg.cap&&this.captain&&this.P.get(this.captain)?.alive){this.cands=top;this.tieN=1;this.tieSure=[];this.step='tie';this.actor=this.captain;this.rd=null;return}
this.rd=null;if(top.length===1)this.vdie(top[0]);this.settle()}
runoff(m,r,c,x){this.rd={m,r,...x};this.cands=c;this.votes=new Map();this.step='vote';this.vset=null}
finalTie(pool,n,sure){const bk=this.A.find(x=>x.role==='suendenbock');this.rd=null;
if(bk){this.bockId=bk.id;sure.forEach(i=>this.vdie(i));this.die(bk.id,'bock');return this.settle()}
if(this.cfg.cap&&this.captain&&this.P.get(this.captain)?.alive){this.cands=pool;this.tieN=n;this.tieSure=sure;this.step='tie';this.actor=this.captain;return}
this.lot=true;const a=[...pool],pick=[];while(pick.length<n&&a.length)pick.push(a.splice(Math.floor(Math.random()*a.length),1)[0]);[...sure,...pick].forEach(i=>this.vdie(i));this.settle()}
tallyS(gr,rd){if(!gr.length){this.rd=null;return this.settle()}
const top=gr[0].ids;
if(rd.r===1){const c=top.length===1&&gr[1]?[...top,...gr[1].ids]:top;if(c.length===1){this.rd=null;this.vdie(c[0]);return this.settle()}return this.runoff('s',2,c)}
if(top.length===1){this.rd=null;this.vdie(top[0]);return this.settle()}
if(rd.r===2)return this.runoff('s',3,top);
return this.finalTie(top,1,[])}
tallyF(gr,rd){let need=rd.need??2;const sure=rd.sure?[...rd.sure]:[];let pool=null;
for(const g of gr){if(need<=0)break;if(g.ids.length<=need){sure.push(...g.ids);need-=g.ids.length}else{pool=g.ids;break}}
if(!pool||need<=0){this.rd=null;sure.forEach(i=>this.vdie(i));return this.settle()}
if(rd.r===1)return this.runoff('f',2,pool,{sure,need});
return this.finalTie(pool,need,sure)}
vvs(){return[this.victim,this.victim2].filter(i=>{const q=i&&this.P.get(i);return i&&this.protect!==i&&this.protect2!==i&&!(q&&q.role==='alter'&&!(q.bites>0))})}
vv(){return this.vvs()[0]||null}
L(o){(this.log||(this.log=[])).push({n:this.nn,...o})}
evMorning(){const c=this.cfg;this.ef=null;this.noCap=null;if((!c.ev||c.ev==='aus')&&!this.tNext/*TEST*/){this.tf=null;return}
const tf=this.tf||(this.tf={seq:0,u:0,notes:[]});tf.notes=tf.notes.filter(n=>n.k==='perm');tf.fresh=[];const add=[],mk=this.markId&&this.P.get(this.markId);
if(mk&&mk.alive)add.push({id:'brief',k:'once',t:'Anonymer Brief',x:`Ein anonymer Brief ist im Dorf eingegangen: ${mk.name} ist verdächtig! (Abstimmung +1)`});
const d=this.nn,fr={selten:3,mittel:2,taeglich:1}[c.ev];
const fc=this.tNext&&EV.find(x=>x.id===this.tNext);this.tNext=null;/*TEST*/
if(fc||(d>=2&&fr&&(d-2)%fr===0)){const used=new Set(this.evDrawn||[]),perm=tf.notes.map(n=>n.id),KR=['krone','richter'],
ok=fc?[fc]:EV.filter(x=>(c.evOn||[]).includes(x.id)&&!used.has(x.id)&&!(x.g==='dauer'&&(perm.length>=2||(KR.includes(x.id)&&perm.some(i=>KR.includes(i))))));
if(ok.length){const x=ok[Math.floor(Math.random()*ok.length)];this.evDrawn=[...used,x.id];const n=this.evMake(x);this.ef={id:x.id,...(n.ef||{})};delete n.ef;add.push(n);if(x.id==='wunder')this.revive();this.L({e:'ev',card:x.id,t:x.t,x:n.x.replace('{z}',n.bell?n.bell.n:''),d:1})}}
for(const n of add){n.u=++tf.u;n.d=this.nn;const used=new Set(tf.notes.map(z=>z.z)),fr=[0,1,2,3,4,5].filter(i=>!used.has(i)),zi=fr.length?fr[Math.floor(Math.random()*fr.length)]:Math.floor(Math.random()*6),R=()=>Math.random()*2-1;n.z=zi;n.s=[+(32+(zi%3)*18+R()*2.5-22).toFixed(1),+(26+Math.floor(zi/3)*23+R()*2.5-20).toFixed(1),+(R()*6).toFixed(1)];tf.notes.push(n);tf.fresh.push(n.u)}if(add.length)tf.seq++}
evMake(x){const A=this.A,pk=a=>a[Math.floor(Math.random()*a.length)],nm=p=>p?p.name:'jemand';let t=x.x,priv=null,bell=null;
let ef=null;if(['verbannt','gnade','rufmord','beichtstuhl','stumme','schlaftrunk'].includes(x.id)){const q=pk(A);t=t.replace('{a}',nm(q));ef={a:q&&q.id}}
else if(x.id==='geruecht'){const wv=A.filter(y=>y.role==='werwolf'),f=pk(wv.length?wv:A),s=[f,pk(A.filter(y=>y!==f))].sort(()=>Math.random()-.5);t=t.replace('{a}',nm(s[0])).replace('{b}',nm(s[1]))}
else if(x.id==='wanderer'){const r=pk(A),o=A.filter(y=>y!==r&&y.role!=='werwolf');if(r&&o.length)priv={id:r.id,x:`Der Wanderer flüstert dir zu: ${pk(o).name} ist kein Werwolf.`}}
else if(x.id==='glocken')bell={n:this.W.length,t:Date.now()+6000};
else if(x.id==='wunder'){const w=(this.dead||[]).filter(q=>q.how==='wolf').map(q=>this.P.get(q.id)?.name).filter(Boolean);t=t.replace('{a}',w.length?': '+w.join(' und '):'')}
return{id:x.id,k:x.g==='dauer'?'perm':'once',t:x.t,x:t,priv,bell,ef}}
rv(x){return x.role==='schwester'&&![...this.P.values()].some(y=>y!==x&&y.role==='schwester')?'dorfbewohner':x.role}
despair(){this.L({e:'desp',d:this.phase==='night'?0:1});for(const x of this.P.values())if(x.alive&&['seherin','hexe','jaeger','heiler','dorfdepp','maedchen','amor','dieb','wolfshund','suendenbock','lehrling','rabe'].includes(x.role)){x.orig=x.role;x.role='dorfbewohner'};this.desp=true}
vdie(id){const p=this.P.get(id);if(p&&p.alive&&p.role==='dorfdepp'&&!p.fool){p.fool=true;this.fool=id;this.L({e:'fool',id,d:1});this.foolCap=this.captain===id;if(this.foolCap){this.captain=null;this.capNew=null}return}this.die(id,'vote')}
initW(){this.votes=new Map();this.retry=0;this.capNone=false;this.cands=null;this.rnd=1;this.lot=false}
tallyW(){const c={};for(const b of this.votes.values())c[b]=(c[b]||0)+1;this.res={k:'w',r:Object.entries(c).sort((a,b)=>b[1]-a[1])};const mx=Math.max(0,...Object.values(c));let top=Object.keys(c).filter(k=>c[k]===mx);if(!top.length)top=this.A.map(x=>x.id);
this.votes=new Map();if(top.length>1&&this.rnd<3){this.cands=top;this.rnd++;this.retry=1;return}
if(top.length>1&&this.cfg.capTie==='entfall'){this.retry=0;this.cands=null;this.captain=null;this.capNew=null;this.capNone=true;if(this.aw==='night'){this.aw=null;this.step='cap'}else{this.step='talk';this.startT()}return}
let o=top[0];if(top.length>1){o=top[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/2**32*top.length)];this.lot=true}
this.retry=0;this.cands=null;this.noCap=null;this.captain=o;this.capNew=o;this.capHow='wahl';if(this.aw==='night'){this.aw=null;this.step='cap'}else{this.step='talk';this.startT()}}
settle(){while(this.pend.length&&!this.A.length)this.pend.shift();
if(!this.pend.length){const x=this.check();if(x)return this.fin(x)}
const q=this.pend[0];if(q){this.sn=true;this.step=q.t;this.actor=q.id;return this.push()}
this.actor=null;if(this.cont==='talk'&&this.ef&&this.ef.id==='machtwechsel'&&!this.ef.done&&this.cfg.cap&&this.captain&&this.P.get(this.captain)?.alive){this.ef.done=1;this.noCap=this.captain;this.captain=null;this.capNew=null;this.cont='wahl'}
this.step=this.cont;if(this.step==='talk')this.startT();if(this.step==='wahl'){this.sn=true;this.initW()}this.push()}
check(){const A=this.A,w=A.filter(x=>x.role==='werwolf').length,o=A.length-w;
if(this.lovers&&A.length===2&&this.lovers.every(i=>this.P.get(i).alive))return w===2?'wolf':'liebe';
if(!w)return'dorf';if(!o)return'wolf';
if(w===1&&o===1){const c=this.cfg.cap&&this.captain&&this.P.get(this.captain);return c&&c.alive&&c.role!=='werwolf'?'dorf':'wolf'}
return null}
fin(w){const L=[...this.P.values()];if((w==='dorf'||w==='wolf')&&this.A.length===2&&this.W.length===1){const l=this.A.find(x=>(x.role==='werwolf')===(w==='dorf'));if(l)l.alive=false}this.win={w,ids:w==='dorf'?L.filter(x=>x.role!=='werwolf').map(x=>x.id):w==='wolf'?L.filter(x=>x.role==='werwolf').map(x=>x.id):[]};this.phase='over';this.step=null;this.push()}
start(){const ids=[...this.P.keys()],list=build(ids.length,this.cfg);if(!list)return;this.hr=[...new Set(list)];shuf(list);let sp=[];
if(list.includes('dieb')){list.splice(list.indexOf('dieb'),1);sp=[list.pop(),list.pop()];list.push('dieb');shuf(list)}
this.spare=sp;ids.forEach((id,i)=>this.P.get(id).role=list[i]);this.appId=null;this.markId=null;this.log=[];this.tf=null;this.evDrawn=[];this.ef=null;this.rd=null;this.noCap=null;this.tieN=1;this.tieSure=[];this.dieb=ids.find(id=>this.P.get(id).role==='dieb')||null;this.thiefDone=false;this.thiefId=null;this.redo=new Set();this.seenR=new Set();this.readyAt=0;this.phase='roles'}
thiefPick(p,i){const sp=this.spare,must=sp.every(x=>x==='werwolf');if(i===-1&&!must){}else if(i===0||i===1){p.role=sp[i];p.origin='dieb';sp[i]='dieb';if(p.role==='schwester'){const o=[...this.P.values()].find(x=>x!==p&&x.role==='schwester');if(o){this.seenR.delete(o.id);this.redo.add(o.id)}}}else return;this.L({e:'thief',id:p.id,r:i===-1?null:p.role,d:0});this.thiefDone=true;this.thiefId=p.id;this.seenR.add(p.id);this.chk();this.push()}
thiefAuto(){const p=this.dieb&&!this.thiefDone?this.P.get(this.dieb):null;if(p)this.thiefPick(p,this.spare.every(x=>x==='werwolf')?0:-1)}
chk(){if(this.seenR.size>=this.P.size&&!this.readyAt&&![...this.P.values()].some(x=>x.role==='wolfshund')){this.readyAt=Date.now()+this.cfg.rolePause*1000;setTimeout(()=>this.push(),this.cfg.rolePause*1000+150)}}
dogAuto(){for(const x of this.P.values())if(x.role==='wolfshund')x.role=Math.random()<.5?'werwolf':'dorfbewohner'}
ready(){return this.seenR.size>=this.P.size&&this.readyAt>0&&Date.now()>=this.readyAt}
startT(){this.tEnd=this.cfg.timer>0&&!(this.ef&&this.ef.id==='eilverfahren')?Date.now()+this.cfg.timer*1000:0}
push(){this.save();for(const p of this.P.values()){try{p.ws?.send(JSON.stringify(this.view(p)))}catch{}}}
view(p){const L=[...this.P.values()],s=this.step,ph=this.phase,v={phase:ph,step:s,host:this.host,cfg:this.cfg,win:this.win,dead:this.dead,kind:this.kind,captain:this.captain,actor:this.actor,locked:this.locked,res:this.res,capNone:this.capNone,vset:this.vset,bockId:this.bockId,desp:this.desp,bit:this.bitId===p.id,cur:this.curseId===p.id,letter:this.phase==='day'&&this.markId&&this.P.get(this.markId)?.alive?this.markId:null,app:this.appId===p.id&&this.dead.some(x=>x.id===this.appFrom),appS:this.appId===p.id,fool:this.fool,foolCap:this.foolCap,tEnd:this.tEnd,now:Date.now(),retry:this.retry,capHow:this.capHow,lot:this.lot,cands:this.cands,rnd:this.rnd,capNew:this.capNew,news:this.sn,pm:this.pend.some(q=>q.id===p.id),ef:this.ef?{id:this.ef.id,a:this.ef.a}:null,noCap:this.noCap,vr:this.rd?this.rd.r:1,vm:this.rd?this.rd.m:null,tieN:this.tieN||1,tn:this.tNext||null,ti:!!this.tImm,drawn:ph==='lobby'?undefined:(this.evDrawn||[]),alt:(this.alt||[]).filter(i=>this.P.get(i)?.alive),away:this.away(),still:ph==='night'&&this.still(),
me:{id:p.id,name:p.name,role:p.role,alive:p.alive,fool:!!p.fool},
players:L.map(x=>({id:x.id,name:x.name,alive:x.alive,on:!!x.ws,fool:!!x.fool,orig:ph==='over'?(x.role==='schwester'&&this.rv(x)!=='schwester'?'schwester':x.orig):undefined,role:((!x.alive&&this.cfg.reveal&&!this.pn('graeber'))||ph==='over'||x.id===p.id||x.fool)?this.rv(x):undefined}))};
if(this.lovers&&(ph==='over'||this.lovers.includes(p.id)))v.lovers=this.lovers;
if(ph!=='lobby')v.hr=this.hr;
if(ph==='over')v.log=this.log||[];
if(ph==='lobby')v.evc=EV.map(x=>({id:x.id,g:x.g,t:x.t}));
if(ph!=='lobby'&&this.cfg.ev&&this.cfg.ev!=='aus'&&this.tf)v.tf={seq:this.tf.seq,fresh:this.tf.fresh||[],notes:this.tf.notes.map(n=>({u:n.u,id:n.id,k:n.k,s:n.s,bell:n.bell||undefined,t:n.t,x:n.x+(n.priv&&n.priv.id===p.id?'\n\n'+n.priv.x:'')}))};
if(p.role==='schwester'&&ph!=='lobby'){const o=L.find(x=>x!==p&&x.role==='schwester');v.sis=o?o.id:null}
if(p.role==='werwolf'&&ph!=='lobby')v.mates=L.filter(x=>x.role==='werwolf').map(x=>x.id);
if(ph==='night'&&p.alive){
if(s==='wolves'&&p.role==='werwolf'){const c={};for(const t of this.wp.values())c[t]=(c[t]||0)+1;const cf={};for(const[wi,t]of this.wp)if(this.wok.has(wi))(cf[t]=cf[t]||[]).push(wi===p.id?'me':'o');Object.assign(v,{picks:c,confs:cf,mine:this.wp.get(p.id),ok:this.wok.has(p.id),can:this.cfg.u?this.same():this.wp.has(p.id)})}
if(s==='seer'&&p.role==='seherin'){v.seen=this.seen;v.seen2=this.seen2;v.klar=!!(this.ef&&this.ef.id==='klaresicht')}
if(this.idle(p.id)&&((s==='wolves'&&p.role==='werwolf')||(s!=='wolves'&&ROLE[s]===p.role&&['prot','seer','heal','poison','raven'].includes(s))))v.idle=p.id===this.away()?'v':'s';
if(s==='wolves'){v.wr=this.wRound;v.w1=this.wRound===2?this.victim:null}
if(s==='thief'&&(p.role==='dieb'||p.id===this.thiefId)){v.thiefDone=this.thiefDone;if(!this.thiefDone){v.spare=this.spare;v.must=this.spare.every(x=>x==='werwolf')}}
if(s==='prot'&&p.role==='heiler'){const e=this.ef||{};v.two=e.id==='doppelschutz';v.last=e.id==='sternen'?null:this.lastProt;v.lastL=e.id==='sternen'?[]:[this.lastProt,this.lastProt2].filter(Boolean)}
if(s==='lovers'&&this.lovers?.includes(p.id)){v.partner=this.lovers.find(x=>x!==p.id);v.lok=this.lk.has(p.id)}
if((s==='heal'||s==='poison')&&p.role==='hexe')Object.assign(v,{mk:this.mkc,victim:this.vv(),victims:this.vvs(),pot:this.pot})}
if(ph==='day'&&(s==='vote'||s==='wahl'))Object.assign(v,{voted:this.votes.has(p.id),n:this.votes.size,total:this.V.length,missing:this.V.filter(x=>!this.votes.has(x.id)).map(x=>x.id)});
if(ph==='lobby'){const e=this.cfg.auto?suggest(this.cfg.n||this.P.size):this.cfg.r,np=this.cfg.n||this.P.size;v.eff=e;v.vil=np+(e.dieb?2:0)-Object.values(e).reduce((a,b)=>a+b,0)-(e.schwestern||0);v.rolesOk=!!build(this.P.size,this.cfg)}
if(ph==='roles'&&p.id===this.dieb){v.thiefDone=this.thiefDone;if(!this.thiefDone){v.spare=this.spare;v.must=this.spare.every(x=>x==='werwolf')}}
if(ph==='roles'){v.again=!!this.redo?.has(p.id);v.seenN=this.seenR.size;v.total=this.P.size;v.ready=this.ready();if(p.id===this.host)v.dogW=L.filter(x=>x.role==='wolfshund').length}
if(p.id===this.host&&this.cue)v.cue=this.cue;return v}}
