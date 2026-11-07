const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toast=m=>{const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),2800)};
const API=((window.APP_CONFIG&&APP_CONFIG.API_URL)||"").replace(/\/$/,"");
const TOKEN_KEY="rh_token";
async function api(path,method="GET",body){
 const t=sessionStorage.getItem(TOKEN_KEY);
 const r=await fetch(API+"/api/admin/"+path,{method,headers:{"Content-Type":"application/json",...(t?{Authorization:"Bearer "+t}:{})},body:body?JSON.stringify(body):undefined});
 const d=await r.json().catch(()=>({}));
 if(r.status===401&&path!=="login"){sessionStorage.removeItem(TOKEN_KEY);showLogin();throw new Error("Please sign in.")}
 if(!r.ok)throw new Error(d.error||"Request failed");
 return d;
}
const CFG={
 sermons:{n:"Sermon",f:[["title","Title"],["speaker","Speaker / Pastor"],["category","Topic tag (e.g. Sunday Service)"],["scripture","Scripture reference (e.g. Psalm 23:1-6)"],["sermon_date","Date","date"],["length","Length (e.g. 45 min)"],["video_url","Video link: YouTube or .mp4 (https://…)"],["thumb_url","Thumbnail image link (optional; YouTube uses its own)"],["audio_url","Audio notes link (https://…)"],["pdf_url","Transcript PDF link (https://…)"]],row:s=>`${esc(s.title)} <small>${esc(s.category)} · ${esc(s.sermon_date||"no date")}</small>`},
 gallery:{n:"Activity",f:[["title","Title (e.g. Saturday Food Distribution)"],["activity_date","Date","date"],["description","Short description (optional)","area"]],row:a=>`${esc(a.title)} <small>${esc(a.activity_date)} · ${a.photos} photo${a.photos==1?"":"s"} · ${a.videos} video${a.videos==1?"":"s"}</small>`,extra:a=>`<button class="btn sm" data-media="${a.id}">Photos &amp; videos</button>`},
 events:{n:"Volunteer event",f:[["title","Title"],["when_text","When (e.g. Sat, Nov 14 · 9:00 AM)"],["note","Short description","area"]],row:e=>`${esc(e.title)} <small>${esc(e.when_text)}</small>`}};
const MF=[["meals","Meals served weekly","number"],["families","Families supported","number"],["vols","Active volunteers","number"],["drives","Open volunteer drives","number"],["regions","Regions supported","number"],["countries","Countries reached","number"],["believers","Believers in our network","number"],["helped","People helped to date","number"],["live","Live stream link (https://…)"],["services","Service times","area"],["address","Address","area"],["email","Contact email","email"],["fb","Facebook link"],["yt","YouTube link"],["ig","Instagram link"]];
const fld=(k,l,t,v)=>`<label for="f_${k}">${l}</label>`+(t=="area"?`<textarea id="f_${k}" name="${k}" rows="3">${esc(v)}</textarea>`:`<input id="f_${k}" name="${k}" type="${t||"text"}" value="${esc(v)}"${t=="number"?' min="0"':""}>`);
let tab="sermons",rows=[],edId=null;
function showLogin(){$("#login").hidden=false;$("#app").hidden=true;$("#out").hidden=true;$("#who").textContent=""}
function showApp(email){$("#login").hidden=true;$("#app").hidden=false;$("#out").hidden=false;$("#who").textContent=email;draw()}
$("#login").onsubmit=async e=>{e.preventDefault();$("#lerr").textContent="";
 try{const d=await api("login","POST",{email:$("#em").value,password:$("#pw").value});sessionStorage.setItem(TOKEN_KEY,d.token);$("#pw").value="";showApp(d.email)}
 catch(x){$("#lerr").textContent=x.message}};
$("#out").onclick=()=>{sessionStorage.removeItem(TOKEN_KEY);showLogin()};
async function draw(){
 $("#tabs").innerHTML=[["sermons","Sermons"],["events","Volunteer events"],["gallery","Gallery"],["site","Site & stats"],["inbox","Inbox"],["account","Account"]].map(([k,l])=>`<button data-tab="${k}" aria-pressed="${k==tab}">${l}</button>`).join("");
 const v=$("#view");v.innerHTML="<p class='meta'>Loading…</p>";
 try{
  if(tab=="site"){const s=await api("settings");v.innerHTML=`<form id="siteForm" class="card">${MF.map(([k,l,t])=>fld(k,l,t,s[k])).join("")}<div class="row" style="margin-top:16px"><button class="btn">Save changes</button></div></form>`}
  else if(tab=="account"){v.innerHTML=`<form id="pwForm" class="card"><h2>Change password</h2><label for="p1">Current password</label><input id="p1" type="password" autocomplete="current-password" required><label for="p2">New password (10+ characters)</label><input id="p2" type="password" autocomplete="new-password" minlength="10" required><div class="row" style="margin-top:16px"><button class="btn">Update password</button></div></form>`}
  else if(tab=="inbox"){rows=await api("inbox");v.innerHTML=rows.length?`<div class="card" style="padding:0">`+rows.map(i=>`<div class="arow"><div><b>${i.kind=="volunteer"?"Volunteer":"Message"}</b> · ${esc(i.name)} · <a href="mailto:${esc(i.email)}">${esc(i.email)}</a>${i.phone?" · "+esc(i.phone):""}<br><small>${i.event_title?esc(i.event_title)+" · ":""}${esc(i.message||"")} ${new Date(i.created_at).toLocaleString()}</small></div><button class="btn o sm" data-idel="${i.id}">Delete</button></div>`).join("")+`</div>`:"<p class='meta'>No sign-ups or messages yet.</p>"}
  else{rows=await api(tab);const c=CFG[tab];v.innerHTML=`<div class="row" style="margin-bottom:12px"><button class="btn sm" data-add>Add ${c.n.toLowerCase()}</button></div><div class="card" style="padding:0">`+(rows.map(r=>`<div class="arow"><div>${c.row(r)}</div><div class="row">${c.extra?c.extra(r):""}<button class="btn o sm" data-edit="${r.id}">Edit</button><button class="btn o sm" data-del="${r.id}">Delete</button></div></div>`).join("")||`<div class="arow"><small>Nothing here yet.</small></div>`)+`</div>`}
 }catch(x){if(x.message!=="Please sign in.")v.innerHTML=`<p class="err">${esc(x.message)}</p>`}
}
function openForm(id){edId=id;const c=CFG[tab],r=id?rows.find(x=>x.id==id)||{}:{};$("#dt").textContent=(id?"Edit ":"Add ")+c.n.toLowerCase();$("#derr").textContent="";$("#db").innerHTML=c.f.map(([k,l,t])=>fld(k,l,t,r[k]||(t=="date"&&!id&&tab=="gallery"?new Date().toLocaleDateString("en-CA"):""))).join("");$("#dlg").showModal()}
$("#dc").onclick=()=>$("#dlg").close();
$("#df").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 try{await api(tab+(edId?"/"+edId:""),edId?"PUT":"POST",d);$("#dlg").close();toast("Saved");draw()}catch(x){$("#derr").textContent=x.message}};
document.addEventListener("click",async e=>{const t=e.target;
 if(t.dataset.tab){tab=t.dataset.tab;draw()}
 else if("add" in t.dataset)openForm(null);
 else if(t.dataset.edit)openForm(t.dataset.edit);
 else if(t.dataset.media)openMedia(t.dataset.media);
 else if(t.dataset.cap){const m=mrows.find(x=>x.id==t.dataset.cap),c=prompt("Caption for this item",m?m.caption:"");if(c!==null)try{await api("media/"+t.dataset.cap,"PUT",{caption:c});drawMedia()}catch(x){toast(x.message)}}
 else if(t.dataset.mdel){if(confirm("Remove this item?"))try{await api("media/"+t.dataset.mdel,"DELETE");drawMedia()}catch(x){toast(x.message)}}
 else if(t.dataset.del){if(confirm(tab=="gallery"?"Delete this activity and all of its photos and videos?":"Delete this item?"))try{await api(tab+"/"+t.dataset.del,"DELETE");draw()}catch(x){toast(x.message)}}
 else if(t.dataset.idel){if(confirm("Delete this entry?"))try{await api("inbox/"+t.dataset.idel,"DELETE");draw()}catch(x){toast(x.message)}}
});
document.addEventListener("submit",async e=>{
 if(e.target.id=="siteForm"){e.preventDefault();try{await api("settings","PUT",Object.fromEntries(new FormData(e.target)));toast("Site updated")}catch(x){toast(x.message)}}
 if(e.target.id=="pwForm"){e.preventDefault();try{await api("password","POST",{current:$("#p1").value,next:$("#p2").value});e.target.reset();toast("Password updated")}catch(x){toast(x.message)}}
});

// ---------- gallery media manager ----------
let curAct=null,mrows=[];
const MS=$("#mstat"),MS_DEF=MS.textContent;
async function drawMedia(){
 mrows=await api(`gallery/${curAct}/media`);
 $("#mlist").innerHTML=mrows.map(x=>x.kind=="photo"
  ?`<figure><img src="${API}/api/media/${x.id}?size=thumb" alt="" loading="lazy"><figcaption>${esc(x.caption)||"<small>No caption</small>"}<br><small>${x.w>x.h?"landscape":x.h>x.w?"portrait":"square"} · ${x.w}×${x.h}</small></figcaption><div class="row"><button class="btn o sm" data-cap="${x.id}">Caption</button><button class="btn o sm" data-mdel="${x.id}">Delete</button></div></figure>`
  :`<figure><img src="https://i.ytimg.com/vi/${esc(x.yt)}/hqdefault.jpg" alt=""><figcaption><span class="vtag">VIDEO</span>${esc(x.caption)}</figcaption><div class="row"><button class="btn o sm" data-cap="${x.id}">Caption</button><button class="btn o sm" data-mdel="${x.id}">Delete</button></div></figure>`).join("")||"<small>No photos or videos yet.</small>";
}
async function openMedia(id){
 curAct=id;const a=rows.find(x=>x.id==id)||{};
 $("#mt").textContent=`Photos & videos: ${a.title||""} (${a.activity_date||""})`;MS.textContent=MS_DEF;$("#mlist").innerHTML="";
 $("#mdlg").showModal();
 try{await drawMedia()}catch(x){toast(x.message)}
}
$("#mdlg").addEventListener("close",()=>{if(!$("#app").hidden)draw()});
$("#mclose").onclick=()=>$("#mdlg").close();
// Photos are resized in the browser: the long edge is capped (1600 px for display, 420 px for thumbnails), so landscape and portrait keep their shape.
async function decode(file){try{return await createImageBitmap(file,{imageOrientation:"from-image"})}catch{return await createImageBitmap(file)}}
function shrink(bmp,max,q){
 const s=Math.min(1,max/Math.max(bmp.width,bmp.height)),w=Math.max(1,Math.round(bmp.width*s)),h=Math.max(1,Math.round(bmp.height*s));
 const c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,w,h);x.imageSmoothingQuality="high";x.drawImage(bmp,0,0,w,h);
 return new Promise((res,rej)=>c.toBlob(b=>b?res({blob:b,w,h}):rej(new Error("Could not process this image")),"image/jpeg",q));
}
const b64=blob=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(String(f.result).split(",")[1]);f.onerror=rej;f.readAsDataURL(blob)});
$("#mfiles").onchange=async e=>{
 const files=[...e.target.files].filter(f=>f.type.startsWith("image/"));e.target.value="";
 let ok=0,bad=0,why="";
 for(let i=0;i<files.length;i++){
  MS.textContent=`Uploading ${i+1} of ${files.length}…`;
  try{
   const bmp=await decode(files[i]),full=await shrink(bmp,1600,.85),th=await shrink(bmp,420,.78);if(bmp.close)bmp.close();
   await api(`gallery/${curAct}/photos`,"POST",{w:full.w,h:full.h,full:await b64(full.blob),thumb:await b64(th.blob)});ok++;
  }catch(x){bad++;why=x.message}
 }
 MS.textContent=`${ok} photo${ok==1?"":"s"} added`+(bad?`, ${bad} failed (${why||"unsupported file"})`:"")+".";
 try{await drawMedia()}catch(x){toast(x.message)}
};
$("#myadd").onclick=async()=>{
 const url=$("#myt").value.trim();if(!url)return;
 try{await api(`gallery/${curAct}/videos`,"POST",{url,caption:$("#mcap").value});$("#myt").value="";$("#mcap").value="";await drawMedia();toast("Video added")}catch(x){toast(x.message)}
};
sessionStorage.getItem(TOKEN_KEY)?api("me").then(d=>showApp(d.email)).catch(showLogin):showLogin();
