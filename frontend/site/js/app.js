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
const navLinks=$$("#nav > a:not(.btn)"),spyIds=["home","sermons","outreach","involved","gallery","global","give","contact"];
$$("#nav > a").forEach((a,i)=>a.style.setProperty("--i",i));
const setMenu=o=>{nav.classList.toggle("open",o);document.body.classList.toggle("nav-open",o);menuBtn.setAttribute("aria-expanded",o);menuBtn.setAttribute("aria-label",o?"Close menu":"Open menu")};
menuBtn.onclick=()=>setMenu(!nav.classList.contains("open"));
$("#scrim").onclick=()=>setMenu(false);
document.addEventListener("keydown",e=>{if(e.key=="Escape"&&nav.classList.contains("open")){setMenu(false);menuBtn.focus()}});
matchMedia("(min-width:1301px)").addEventListener("change",e=>{if(e.matches)setMenu(false)});
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
function drawSermons(){
 const all=SS(),cats=["All",...new Set(all.map(s=>s.c).filter(Boolean))];
 if(!cats.includes(filt))filt="All";
 $("#filters").innerHTML=cats.map(c=>`<button class="tag" aria-pressed="${c==filt}">${esc(c)}</button>`).join("");
 const items=all.filter(s=>filt=="All"||s.c==filt).map(sermonItem),v=$("#sermonView");
 v.innerHTML=items.length?deckHtml("sermons",items,"More sermons"):"<p class='lead'>No sermons yet. Please check back soon.</p>";
 initCars(v);
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
// ---------- shared media UI: cards, 3-up deck + carousel, lightbox ----------
const IC={
 prev:'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
 next:'<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
 play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
 zoom:'<svg class="o" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'};
const SETS={};                       // lightbox sets: key -> normalized items (cards point at them by key + index)
const YT_ID=/^[\w-]{11}$/;
const ymd=d=>{const[y,m,x]=d.split("-").map(Number);return new Date(y,m-1,x)};
const isoOk=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||"");
const dLong=d=>ymd(d).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const dShort=d=>isoOk(d)?ymd(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):String(d||"");
const plural=(n,w)=>n+" "+w+(n==1?"":"s");
const imgUrl=(id,thumb)=>`${API}/api/media/${encodeURIComponent(id)}${thumb?"?size=thumb":""}`;
// YouTube: watch?v=, youtu.be/, /shorts/, /live/, /embed/ or a bare 11-char id -> video id ("" if not YouTube)
function ytIdFrom(u){
 const s=String(u||"").trim();if(YT_ID.test(s))return s;
 try{
  const x=new URL(s),h=x.hostname.replace(/^(www|m|music)\./,"");let id="";
  if(h==="youtu.be")id=x.pathname.slice(1).split("/")[0];
  else if(h==="youtube.com"||h==="youtube-nocookie.com"){
   if(x.pathname==="/watch")id=x.searchParams.get("v")||"";
   else{const m=x.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/);if(m)id=m[2]}}
  return YT_ID.test(id)?id:"";
 }catch(e){return""}
}
const isFile=u=>/\.(mp4|m4v|webm|ogv|mov)(?:[?#]|$)/i.test(u||"");
const ytThumb=id=>`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,ytThumbFb=id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
// maxresdefault does not exist for every video: fall back once to hqdefault
document.addEventListener("error",e=>{const t=e.target;if(t.tagName=="IMG"&&t.dataset.fb){const f=t.dataset.fb;delete t.dataset.fb;t.src=f}},true);

// Normalized item: {type:"video"|"image", kind:"yt"|"file"|"link"|"none", title, speaker, date, tags[], dur, badge, thumb, fb, full, w, h, yt, src, desc, audio, pdf}
function sermonItem(s){
 const yt=ytIdFrom(s.v),file=!yt&&safe(s.v)&&isFile(s.v),link=!yt&&!file&&safe(s.v),custom=safe(s.th);
 return{type:"video",kind:yt?"yt":file?"file":link?"link":"none",yt,src:safe(s.v),title:s.t,speaker:s.sp||"",date:dShort(s.d),
  tags:[s.c,s.sc].filter(Boolean),dur:s.l||"",thumb:custom||(yt?ytThumb(yt):""),fb:!custom&&yt?ytThumbFb(yt):"",audio:safe(s.a),pdf:safe(s.p)};
}
function mediaItems(a){
 return a.media.filter(m=>m.k=="p"||YT_ID.test(m.y)).map(m=>{
  const base={title:m.c||a.t,speaker:"",date:dShort(a.d),tags:m.c?[a.t]:[],desc:a.n||""};
  return m.k=="p"?{...base,type:"image",kind:"img",badge:"Photo",thumb:imgUrl(m.id,1),full:imgUrl(m.id),w:m.w,h:m.h}
   :{...base,type:"video",kind:"yt",yt:m.y,badge:"Video",thumb:ytThumb(m.y),fb:ytThumbFb(m.y)};
 });
}
function cardHtml(key,i,it){
 const media=it.thumb?`<img src="${esc(it.thumb)}" alt="" loading="lazy" decoding="async"${it.fb?` data-fb="${esc(it.fb)}"`:""}>`
  :it.kind=="file"?`<video src="${esc(it.src)}#t=0.6" preload="metadata" muted playsinline tabindex="-1"></video>`
  :`<span class="mc-ph" aria-hidden="true"><img src="assets/logo.webp" alt=""></span>`;
 const verb=it.type=="image"?"View photo":it.kind=="none"?"Open sermon":"Play";
 const meta=[it.speaker,it.date].filter(Boolean).map(esc).join('<i aria-hidden="true">•</i>');
 return `<button type="button" class="mc" data-set="${esc(key)}" data-i="${i}" aria-label="${esc(verb+": "+it.title)}">`+
  `<span class="mc-media">${media}</span><span class="mc-shade"></span>`+
  ((it.dur||it.badge)?`<span class="mc-badge">${esc(it.dur||it.badge)}</span>`:"")+
  `<span class="mc-play" aria-hidden="true">${it.type=="image"?IC.zoom:IC.play}</span>`+
  `<span class="mc-foot">${it.tags.length?`<span class="mc-tags">${it.tags.map(t=>`<span class="mc-tag">${esc(t)}</span>`).join("")}</span>`:""}`+
  `<span class="mc-title">${esc(it.title)}</span>${meta?`<span class="mc-meta">${meta}</span>`:""}</span></button>`;
}
// first 3 cards in a grid, everything else in a carousel underneath
function deckHtml(key,items,more){
 SETS[key]=items;
 const rest=items.slice(3);
 return `<div class="mgrid">${items.slice(0,3).map((it,i)=>cardHtml(key,i,it)).join("")}</div>`+
  (rest.length?`<div class="mcar" data-car><div class="mcar-head"><h4 class="sub">${esc(more)}</h4><div class="mcar-ctl"><button type="button" class="mcar-b" data-dir="-1" aria-label="Previous">${IC.prev}</button><button type="button" class="mcar-b" data-dir="1" aria-label="Next">${IC.next}</button></div></div>`+
   `<div class="mcar-track" role="group" aria-roledescription="carousel" aria-label="${esc(more)}">${rest.map((it,i)=>cardHtml(key,i+3,it)).join("")}</div><div class="mcar-dots" role="group" aria-label="Carousel pages"></div></div>`:"");
}
function initCars(root){
 $$("[data-car]",root).forEach(car=>{
  const tr=$(".mcar-track",car),dots=$(".mcar-dots",car),ctl=$(".mcar-ctl",car),n=tr.children.length;
  let pages=1;
  const pv=()=>+getComputedStyle(car).getPropertyValue("--pv")||1,gap=()=>parseFloat(getComputedStyle(tr).columnGap)||0;
  const pageW=()=>tr.clientWidth+gap(),maxS=()=>tr.scrollWidth-tr.clientWidth;
  const behavior=()=>matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth";
  function mark(){
   const m=maxS(),cur=m>0&&tr.scrollLeft>=m-2?pages-1:Math.min(pages-1,Math.round(tr.scrollLeft/pageW()));
   $$("button",dots).forEach((b,i)=>{b.classList.toggle("on",i==cur);if(i==cur)b.setAttribute("aria-current","true");else b.removeAttribute("aria-current")});
   return cur;
  }
  function build(){
   pages=Math.max(1,Math.ceil(n/pv()));
   dots.hidden=ctl.hidden=pages<2;
   dots.innerHTML=Array.from({length:pages},(_,i)=>`<button type="button" data-p="${i}" aria-label="Go to page ${i+1} of ${pages}"></button>`).join("");
   mark();
  }
  const go=p=>{p=(p+pages)%pages;tr.scrollTo({left:Math.min(p*pageW(),maxS()),behavior:behavior()})};   // wraps around at both ends
  car.addEventListener("click",e=>{
   const b=e.target.closest("[data-dir]"),d=e.target.closest("[data-p]");
   if(b)go(mark()+ +b.dataset.dir);else if(d)go(+d.dataset.p);
  });
  let raf=0;tr.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;mark()})},{passive:true});
  new ResizeObserver(build).observe(tr);
  build();
 });
}

// ---------- lightbox (videos + photos) ----------
const LB=(()=>{
 const el=$("#lb"),panel=$("#lbPanel"),stage=$("#lbStage"),info=$("#lbInfo"),cnt=$("#lbCount"),prev=$("#lbPrev"),next=$("#lbNext"),xb=$("#lbX");
 let key="",i=0,opener=null,tok=0,hideT=0;
 const list=()=>SETS[key]||[];
 const killMedia=()=>$$("iframe,video",stage).forEach(m=>{if(m.pause)m.pause();m.removeAttribute("src");m.remove()});
 function render(){
  const L=list(),it=L[i];if(!it)return;
  const t=++tok;killMedia();stage.innerHTML="";
  panel.dataset.t=it.type;stage.className="lb-stage "+(it.type=="image"?"is-img":"is-vid");
  if(it.type=="image"){
   const im=document.createElement("img");im.className="lb-img lo";im.alt=it.title;im.src=it.thumb;
   if(it.w&&it.h){panel.style.setProperty("--iw",it.w+"px");panel.style.setProperty("--ir",it.w/it.h)}   // box sized from the known aspect ratio, so nothing jumps when the sharp version loads
   else{panel.style.removeProperty("--iw");panel.style.removeProperty("--ir")}
   stage.append(im);
   const hi=new Image();hi.onload=()=>{if(t==tok){im.src=hi.src;im.classList.remove("lo")}};hi.onerror=()=>{if(t==tok)im.classList.remove("lo")};hi.src=it.full;
  }else if(it.kind=="yt"){
   const f=document.createElement("iframe");
   f.src=`https://www.youtube.com/embed/${it.yt}?autoplay=1&enablejsapi=1&rel=0&playsinline=1`+(/^https?:$/.test(location.protocol)?`&origin=${encodeURIComponent(location.origin)}`:"");
   f.title=it.title;f.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen";
   f.allowFullscreen=true;f.referrerPolicy="strict-origin-when-cross-origin";stage.append(f);
  }else if(it.kind=="file"){
   const v=document.createElement("video");v.controls=true;v.autoplay=true;v.playsInline=true;v.preload="metadata";v.setAttribute("controlsList","nodownload");
   if(safe(it.thumb))v.poster=it.thumb;v.src=it.src;stage.append(v);v.play&&v.play().catch(()=>{});
  }else{
   stage.innerHTML=it.kind=="link"
    ?`<div class="lb-none"><p>This video is hosted on another site.</p><a class="btn gold" href="${esc(it.src)}" target="_blank" rel="noopener">Watch video</a></div>`
    :`<div class="lb-none"><p>No video has been added for this sermon yet.</p></div>`;
  }
  const meta=[it.speaker,it.date,it.dur].filter(Boolean).map(esc).join("<i aria-hidden=\"true\">•</i>");
  info.innerHTML=(it.tags.length?`<div class="lb-tags">${it.tags.map(x=>`<span class="mc-tag">${esc(x)}</span>`).join("")}</div>`:"")+
   `<h3 id="lbTitle">${esc(it.title)}</h3>`+(meta?`<p class="lb-meta">${meta}</p>`:"")+(it.desc?`<p class="lb-desc">${esc(it.desc)}</p>`:"")+
   `<div class="lb-acts">${it.audio?`<a class="btn ghost sm" href="${esc(it.audio)}" target="_blank" rel="noopener">Audio notes</a>`:""}${it.pdf?`<a class="btn ghost sm" href="${esc(it.pdf)}" target="_blank" rel="noopener">Transcript (PDF)</a>`:""}</div>`;
  const many=L.length>1;prev.hidden=next.hidden=!many;cnt.textContent=many?`${i+1} / ${L.length}`:"";
 }
 const step=d=>{const n=list().length;if(n<2)return;i=(i+d+n)%n;render()};
 function lock(on){
  const de=document.documentElement;
  if(on){de.style.setProperty("--sb",Math.max(0,innerWidth-de.clientWidth)+"px");de.classList.add("lb-open")}else de.classList.remove("lb-open");
  $$("main,header,footer").forEach(n=>n.inert=on);
 }
 function open(k,idx,from){
  if(!SETS[k]||!SETS[k][idx])return;
  key=k;i=idx;opener=from||document.activeElement;clearTimeout(hideT);
  el.hidden=false;lock(true);render();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add("on");xb.focus({preventScroll:true})}));
 }
 function close(){
  if(el.hidden||!el.classList.contains("on"))return;
  el.classList.remove("on");tok++;killMedia();                       // stop playback immediately, then fade out
  hideT=setTimeout(()=>{el.hidden=true;stage.innerHTML="";info.innerHTML="";lock(false);if(opener&&opener.isConnected)opener.focus({preventScroll:true});opener=null},260);
 }
 xb.onclick=close;prev.onclick=()=>step(-1);next.onclick=()=>step(1);
 el.addEventListener("click",e=>{if(!e.target.closest(".lb-panel,.lb-x,.lb-nav"))close()});    // click on the dimmed backdrop
 document.addEventListener("keydown",e=>{
  if(el.hidden)return;
  if(e.key=="Escape"){e.preventDefault();close()}
  else if((e.key=="ArrowLeft"||e.key=="ArrowRight")&&!/^(VIDEO|AUDIO|INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)){step(e.key=="ArrowRight"?1:-1)}
  else if(e.key=="Tab"){
   const f=$$("button,a[href],iframe,video[controls]",el).filter(n=>n.getClientRects().length&&!n.hidden);
   if(!f.length)return;const a=document.activeElement;
   if(e.shiftKey&&(a==f[0]||!el.contains(a))){e.preventDefault();f[f.length-1].focus()}
   else if(!e.shiftKey&&(a==f[f.length-1]||!el.contains(a))){e.preventDefault();f[0].focus()}
  }
 });
 let x0=null;                                                         // swipe between photos
 stage.addEventListener("pointerdown",e=>{x0=e.clientX});stage.addEventListener("pointercancel",()=>{x0=null});
 stage.addEventListener("pointerup",e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50&&stage.classList.contains("is-img"))step(dx<0?1:-1)});
 return{open,close};
})();
document.addEventListener("click",e=>{const c=e.target.closest(".mc[data-set]");if(c)LB.open(c.dataset.set,+c.dataset.i,c)});

// ---------- activity gallery: date picker + card deck per activity ----------
let GA=[],gSel="";
function actHtml(a){
 const items=mediaItems(a),np=items.filter(x=>x.type=="image").length,nv=items.length-np;
 const bits=[np&&plural(np,"photo"),nv&&plural(nv,"video")].filter(Boolean);
 return `<article class="act"><div class="ahead"><h3>${esc(a.t)}</h3><p class="meta">${esc(dLong(a.d))}${bits.length?" · "+bits.join(" · "):""}</p>${a.n?`<p>${esc(a.n)}</p>`:""}</div>`+
  (items.length?deckHtml("g"+a.id,items,"More from this day"):"<p class='meta'>Photos and videos are coming soon.</p>")+`</article>`;
}
function drawGallery(){
 const dates=[...new Set(GA.map(a=>a.d))].sort().reverse(),bar=$("#gBar"),view=$("#gView");
 if(!dates.length){bar.hidden=true;view.innerHTML="<p class='lead'>Photos and videos from our next volunteer activity will be posted here.</p>";return}
 bar.hidden=false;if(!gSel)gSel=dates[0];
 const inp=$("#gDate");inp.min=dates[dates.length-1];inp.max=dates[0];inp.value=gSel;
 const count=d=>GA.filter(a=>a.d==d).reduce((s,a)=>s+a.media.length,0);
 $("#gChips").innerHTML=dates.slice(0,10).map(d=>`<button class="tag" data-d="${d}" aria-pressed="${d==gSel}">${esc(dShort(d))}<small>${count(d)}</small></button>`).join("");
 const acts=GA.filter(a=>a.d==gSel);
 if(acts.length){view.innerHTML=acts.map(actHtml).join("");initCars(view)}
 else{
  const before=dates.find(d=>d<gSel),after=[...dates].reverse().find(d=>d>gSel);
  view.innerHTML=`<div class="gempty"><p>No photos or videos were posted for <b>${esc(dLong(gSel))}</b>.</p><div class="row" style="margin:0">`+
   (before?`<button class="btn line sm" data-d="${before}">← ${esc(dShort(before))}</button>`:"")+(after?`<button class="btn line sm" data-d="${after}">${esc(dShort(after))} →</button>`:"")+`</div></div>`;
 }
}
$("#gDate").onchange=e=>{if(e.target.value){gSel=e.target.value;drawGallery()}};
$("#gBar").addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(b){gSel=b.dataset.d;drawGallery()}});
$("#gView").addEventListener("click",e=>{const d=e.target.closest("[data-d]");if(d){gSel=d.dataset.d;drawGallery()}});
fetch(API+"/api/gallery").then(r=>r.json()).then(d=>{GA=Array.isArray(d.activities)?d.activities:[]}).catch(()=>{}).finally(drawGallery);
// ---------- data from the server ----------
fetch(API+"/api/public").then(r=>r.json()).then(d=>{dbS=d.sermons;dbE=d.events;M={...DM,...d.settings}}).catch(()=>{}).finally(()=>{applyMain();drawSermons();drawEvents()});
