const API=((window.APP_CONFIG&&APP_CONFIG.API_URL)||"").replace(/\/$/,"");
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safe=u=>/^https?:\/\//i.test(u||"")?u:"";
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),3600)};
const DS=[
{t:"Walking in Faith Together",c:"Sunday Service",d:"2026-11-02",l:"52 min"},
{t:"Psalm 23: The Shepherd’s Care",c:"Bible Study",d:"2026-10-29",l:"41 min"},
{t:"Hope for the Hungry",c:"Series",d:"2026-10-26",l:"47 min"},
{t:"Light for the Nations",c:"Sunday Service",d:"2026-10-19",l:"55 min"},
{t:"The Sabbath Rest",c:"Bible Study",d:"2026-10-15",l:"38 min"},
{t:"Serving with Open Hands",c:"Series",d:"2026-10-12",l:"44 min"}];
const DE=[
{t:"Saturday Food Distribution",d:"Sat, Nov 14 · 9:00 AM",n:"Pack and hand out weekly meals."},
{t:"Winter Clothing Drive",d:"Sat, Nov 21 · 10:00 AM",n:"Sort and distribute coats and blankets."},
{t:"Family Parcel Packing",d:"Wed, Nov 25 · 5:30 PM",n:"Prepare holiday food parcels."}];
const DM={meals:0,families:0,vols:0,drives:0,regions:0,countries:0,believers:0,helped:0,live:"",
services:"Sunday Service: 10:00 AM\nBible Study: Wednesday 7:00 PM\nFood distribution: Saturday 9:00 AM",
address:"Retzon Ha’el Messianic Congregation\n[Add street address]\n[City, Country]",email:"info@example.org",fb:"",yt:"",ig:""};
let M={...DM},dbS=[],dbE=[],live=true,filt="All",curEv="";
const SS=()=>live&&dbS?dbS:DS.map((s,i)=>({id:"d"+i,...s}));
const EE=()=>live&&dbE?dbE:DE.map((s,i)=>({id:"e"+i,...s}));
const withId=s=>s.docs.map(d=>({id:d.id,...d.data()}));
const fmtDate=d=>{const t=Date.parse(d);return t?new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):esc(d)};
const fail=()=>`We couldn’t save this online. Please email ${M.email||"us"} instead.`;
// nav: mobile menu, scroll state, scrollspy, sliding indicator
const nav=$("#nav"),menuBtn=$("#menu"),hdr=$("header"),prog=$("#prog"),ind=$("#navInd");
const navLinks=$$("#nav > a:not(.btn)"),spyIds=["home","sermons","outreach","involved","global","give","contact"];
$$("#nav > a").forEach((a,i)=>a.style.setProperty("--i",i));
const setMenu=o=>{nav.classList.toggle("open",o);document.body.classList.toggle("nav-open",o);menuBtn.setAttribute("aria-expanded",o);menuBtn.setAttribute("aria-label",o?"Close menu":"Open menu")};
menuBtn.onclick=()=>setMenu(!nav.classList.contains("open"));
$("#scrim").onclick=()=>setMenu(false);
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&nav.classList.contains("open")){setMenu(false);menuBtn.focus()}});
matchMedia("(min-width:1241px)").addEventListener("change",e=>{if(e.matches)setMenu(false)});
let cur=null,hov=null,lock=false,lt;
const activeLink=()=>navLinks.find(a=>a.classList.contains("active"));
function place(a){
 if(!a){ind.classList.remove("on");return}
 const first=!ind.classList.contains("on");
 if(first)ind.style.transition="none";
 ind.style.width=(a.offsetWidth-18)+"px";ind.style.transform=`translate(${a.offsetLeft+9}px,${a.offsetTop+a.offsetHeight-4}px)`;
 if(first){void ind.offsetWidth;ind.style.transition="";ind.classList.add("on")}
}
function setActive(id){
 cur=id;
 navLinks.forEach(a=>{const on=a.getAttribute("href")=="#"+id;a.classList.toggle("active",on);if(on)a.setAttribute("aria-current","true");else a.removeAttribute("aria-current")});
 place(hov||activeLink());
}
function spy(){
 if(lock)return;
 const y=hdr.offsetHeight+Math.min(160,innerHeight*.25);let id=null;
 for(const s of spyIds){const el=document.getElementById(s);if(el&&el.getBoundingClientRect().top<=y)id=s}
 if(innerHeight+scrollY>=document.documentElement.scrollHeight-4)id="contact";
 if(id!==cur)setActive(id);
}
let tick=false;
function onScroll(){
 if(lock){clearTimeout(lt);lt=setTimeout(()=>{lock=false;spy()},140)}
 if(tick)return;tick=true;
 requestAnimationFrame(()=>{tick=false;
  const max=document.documentElement.scrollHeight-innerHeight;
  prog.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;
  hdr.classList.toggle("scrolled",scrollY>24);spy()})}
addEventListener("scroll",onScroll,{passive:true});
addEventListener("resize",()=>{onScroll();place(hov||activeLink())});
navLinks.forEach(a=>{a.addEventListener("mouseenter",()=>{hov=a;place(a)});a.addEventListener("focus",()=>{hov=a;place(a)})});
nav.addEventListener("mouseleave",()=>{hov=null;place(activeLink())});
nav.addEventListener("focusout",e=>{if(!nav.contains(e.relatedTarget)){hov=null;place(activeLink())}});
$$("#nav a").forEach(a=>a.addEventListener("click",()=>{
 if(navLinks.includes(a)){lock=true;setActive(a.getAttribute("href").slice(1));clearTimeout(lt);lt=setTimeout(()=>{lock=false;spy()},700)}
 setMenu(false)}));
onScroll();
if(document.fonts)document.fonts.ready.then(()=>place(hov||activeLink()));
// public rendering
const dl=(u,t)=>safe(u)?`<a href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`:`<button data-dl>${t}</button>`;
const dlBtn=(u,t)=>safe(u)?`<a class="btn line" href="${esc(u)}" target="_blank" rel="noopener">${t}</a>`:`<button class="btn line" data-dl>${t}</button>`;
function drawSermons(){
 const all=SS(),cats=["All",...new Set(all.map(s=>s.c).filter(Boolean))];
 if(!cats.includes(filt))filt="All";
 $("#filters").innerHTML=cats.map(c=>`<button class="tag" aria-pressed="${c==filt}">${esc(c)}</button>`).join("");
 $("#sermonGrid").innerHTML=all.filter(s=>filt=="All"||s.c==filt).map(s=>`<article class="card"><button class="thumb" data-play="${esc(s.id)}" aria-label="Play ${esc(s.t)}">▶</button><div class="body"><span class="pill">${esc(s.c)}</span><h3>${esc(s.t)}</h3><p class="meta">${fmtDate(s.d)}${s.l?" · "+esc(s.l):""}</p><div class="mini">${dl(s.a,"Audio notes")}${dl(s.p,"Transcript")}</div></div></article>`).join("")||"<p class='lead'>No sermons yet. Please check back soon.</p>";
}
function drawEvents(){
 $("#eventGrid").innerHTML=EE().map(v=>`<article class="card"><div class="body"><span class="date">${esc(v.d)}</span><h3>${esc(v.t)}</h3><p class="meta">${esc(v.n)}</p><button class="btn gold" style="margin-top:auto" data-vol="${esc(v.id)}">Sign up to volunteer</button></div></article>`).join("")||"<p class='lead'>No volunteer events right now. Please check back soon.</p>";
}
function applyMain(){
 $$("[data-k]").forEach(el=>{const n=+M[el.dataset.k]||0;el.dataset.n=n;if(live)el.textContent=n.toLocaleString()+(n>=1000?"+":"")});
 const br=s=>esc(s).replace(/\n/g,"<br>");
 $("#fSvc").innerHTML=br(M.services);$("#fAddr").innerHTML=br(M.address);
 const l=[["Facebook",M.fb],["YouTube",M.yt],["Instagram",M.ig]].filter(x=>safe(x[1])).map(([n,u])=>`<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`);
 $("#fSoc").innerHTML=(l.length?l.join(" · "):"Social links coming soon")+"<br>"+(M.email?`<a href="mailto:${esc(M.email)}">${esc(M.email)}</a>`:"");
}
$("#filters").onclick=e=>{const b=e.target.closest(".tag");if(!b)return;filt=b.textContent;drawSermons()};
document.addEventListener("click",e=>{
 const p=e.target.closest("[data-play]");
 if(p){const s=SS().find(x=>x.id==p.dataset.play);if(s){$("#pTitle").textContent=s.t;$("#pMeta").textContent=s.c+" · "+s.d;
  $("#pActs").innerHTML=(safe(s.v)?`<a class="btn gold" href="${esc(s.v)}" target="_blank" rel="noopener">Watch video</a>`:"")+dlBtn(s.a,"Download audio notes")+dlBtn(s.p,"Download transcript (PDF)")+`<button class="btn line" data-close>Close</button>`;
  $("#playDlg").showModal()}}
 if(e.target.closest("[data-dl]"))toast("This file has not been added yet.");
 if(e.target.closest("[data-close]"))e.target.closest("dialog").close();
 if(e.target.matches("dialog"))e.target.close();
});
$("#eventGrid").onclick=e=>{const b=e.target.closest("[data-vol]");if(!b)return;const v=EE().find(x=>x.id==b.dataset.vol);if(!v)return;curEv=v.t+" · "+v.d;$("#vEvent").textContent=curEv;$("#volDlg").showModal()};
async function submit(url,body){try{const r=await fetch(API+url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return r.ok}catch(e){return false}}
const cut=v=>String(v||"").slice(0,500);
$("#volForm").onsubmit=async e=>{e.preventDefault();const ok=await submit("/api/volunteer",{name:cut($("#vn").value),email:cut($("#ve").value),phone:cut($("#vp").value),event:curEv});$("#volDlg").close();e.target.reset();toast(ok?"Thank you! We will confirm your spot by email.":fail())};
$("#contactForm").onsubmit=async e=>{e.preventDefault();const ok=await submit("/api/contact",{name:cut($("#cn").value),email:cut($("#ce").value),message:cut($("#cm").value)});if(ok)e.target.reset();toast(ok?"Message sent. Thank you for reaching out.":fail())};
// counters
const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);const el=en.target,n=+el.dataset.n,t0=performance.now();
 (function f(t){const k=Math.min(1,(t-t0)/1400);el.textContent=Math.round(n*(1-Math.pow(1-k,3))).toLocaleString()+(k==1&&n>=1000?"+":"");if(k<1)requestAnimationFrame(f)})(t0)}),{threshold:.4});
$$("[data-n]").forEach(el=>io.observe(el));
// giving
let mode="once",amt=50;
$("#amts").innerHTML=[25,50,100,250].map(a=>`<button aria-pressed="${a==50}" data-a="${a}">$${a}</button>`).join("");
const upd=()=>$("#giveBtn").textContent=amt>0?`Give $${amt}${mode=="monthly"?" every month":""}`:"Enter an amount";
$("#amts").onclick=e=>{const b=e.target.closest("button");if(!b)return;amt=+b.dataset.a;$("#custom").value="";$$("#amts button").forEach(x=>x.setAttribute("aria-pressed",x==b));upd()};
$("#custom").oninput=e=>{amt=+e.target.value;$$("#amts button").forEach(x=>x.setAttribute("aria-pressed","false"));upd()};
$$(".seg button").forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$(".seg button").forEach(x=>x.setAttribute("aria-pressed",x==b));upd()});
$("#giveBtn").onclick=()=>toast(amt>0?"Online giving is not connected yet. Add your payment provider to go live.":"Please enter an amount.");
$("[data-live]").addEventListener("click",e=>{if(safe(M.live)){e.preventDefault();window.open(M.live,"_blank","noopener")}else toast("No live service right now. Latest sermons are below.")});
$("#yr").textContent=new Date().getFullYear();
// ---------- data from the server ----------
fetch(API+"/api/public").then(r=>r.json()).then(d=>{dbS=d.sermons;dbE=d.events;M={...DM,...d.settings}}).catch(()=>{}).finally(()=>{applyMain();drawSermons();drawEvents()});
