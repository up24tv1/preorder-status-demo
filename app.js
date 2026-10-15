const KEY='preorderPulse.v1',DAY=864e5;
const STAGES=['Preorder confirmed','In production','Quality check','Shipped to warehouse','Shipping to you','Delivered'];
const load=()=>JSON.parse(localStorage.getItem(KEY)||'[]'),save=a=>localStorage.setItem(KEY,JSON.stringify(a));
function health(b,now=Date.now()){const since=Math.floor((now-b.updates[b.updates.length-1].t)/DAY),late=b.eta&&now>new Date(b.eta).getTime()+DAY&&b.stage<5;
 return{since,late,flag:late?'red':since>=7?'amber':'green',msg:late?'Past estimated date. Post an honest delay note now.':since>=7?`No update in ${since} days. Customers start worrying around here.`:'Customers are up to date.'}}
function find(q,a=load()){q=String(q).trim();return a.find(b=>b.orders.includes(q))}
function esc(s){return String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]))}
function bar(st){return `<div class="bar">${STAGES.map((s,i)=>`<div class="${i<st?'on':i===st?'now':''}">${s}</div>`).join('')}</div>`}
function render(){const a=load();document.getElementById('batches').innerHTML=a.length?a.map(b=>{const h=health(b);
 return `<div class="card"><b>${esc(b.name)}</b> <span class="tag">${b.orders.length} orders</span><span class="tag">ETA ${b.eta||'—'}</span><span class="tag ${h.flag}">${h.flag==='red'?'Late':h.flag==='amber'?'Needs update':'Fresh'}</span>
 ${bar(b.stage)}<p style="font-size:13px">${h.msg}</p>
 <input id="u${b.id}" placeholder="Update note customers will see"><button onclick="adv(${b.id},1)">Next stage + post note</button><button class="ghost" onclick="adv(${b.id},0)">Post note only</button>
 <ol class="tl" reversed>${b.updates.slice().reverse().map(u=>`<li>${new Date(u.t).toLocaleDateString()}: ${esc(u.note)}</li>`).join('')}</ol></div>`}).join(''):'<div class="card" style="color:#9aa6bf">No batches yet. Create one or load the sample.</div>'}
function adv(id,step){const a=load(),b=a.find(x=>x.id===id),n=document.getElementById('u'+id).value.trim();
 if(step)b.stage=Math.min(5,b.stage+1);b.updates.push({t:Date.now(),note:n||(step?'Moved to: '+STAGES[b.stage]:'Still on track, thanks for your patience.')});save(a);render()}
function add(b){const a=load();a.push({id:Date.now()+Math.floor(Math.random()*1e3),stage:0,updates:[{t:Date.now(),note:'Preorder batch opened.'}],...b});save(a);render()}
const v=i=>document.getElementById(i).value;
document.getElementById('addB').onclick=()=>{if(!v('bn'))return;add({name:v('bn'),orders:v('orders').split(',').map(s=>s.trim()).filter(Boolean),eta:v('eta')})};
document.getElementById('look').onclick=()=>{const b=find(v('q')),r=document.getElementById('res');
 if(!b){r.innerHTML='<p>Order not found. Check the number on your confirmation email.</p>';return}
 const h=health(b),u=b.updates[b.updates.length-1];
 r.innerHTML=`<p><b>${esc(b.name)}</b>: ${STAGES[b.stage]}</p>${bar(b.stage)}<p style="font-size:13px">Latest (${new Date(u.t).toLocaleDateString()}): ${esc(u.note)}<br>Estimated ship: ${b.eta||'TBA'}${h.late?' (running late, the shop has been alerted)':''}</p>`};
document.getElementById('sample').onclick=()=>{const t=Date.now(); // illustrative sample written for this demo
 add({name:'Example Controller: Batch 1',orders:['1001','1002','1003'],eta:new Date(t+10*DAY).toISOString().slice(0,10),stage:2,updates:[{t:t-30*DAY,note:'Preorder batch opened.'},{t:t-20*DAY,note:'Moved to: In production'},{t:t-9*DAY,note:'Moved to: Quality check'}]});
 add({name:'Example Hoodie Drop',orders:['2001','2002'],eta:new Date(t-5*DAY).toISOString().slice(0,10),stage:1,updates:[{t:t-40*DAY,note:'Preorder batch opened.'},{t:t-25*DAY,note:'Moved to: In production'}]})};
render();
if(typeof module!=='undefined')module.exports={health,find};
