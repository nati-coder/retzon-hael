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
 sermons:{n:"Sermon",f:[["title","Title"],["category","Category (e.g. Sunday Service)"],["sermon_date","Date","date"],["length","Length (e.g. 45 min)"],["video_url","Video link (https://…)"],["audio_url","Audio notes link (https://…)"],["pdf_url","Transcript PDF link (https://…)"]],row:s=>`${esc(s.title)} <small>${esc(s.category)} · ${esc(s.sermon_date||"no date")}</small>`},
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
 $("#tabs").innerHTML=[["sermons","Sermons"],["events","Volunteer events"],["site","Site & stats"],["inbox","Inbox"],["account","Account"]].map(([k,l])=>`<button data-tab="${k}" aria-pressed="${k==tab}">${l}</button>`).join("");
 const v=$("#view");v.innerHTML="<p class='meta'>Loading…</p>";
 try{
  if(tab=="site"){const s=await api("settings");v.innerHTML=`<form id="siteForm" class="card">${MF.map(([k,l,t])=>fld(k,l,t,s[k])).join("")}<div class="row" style="margin-top:16px"><button class="btn">Save changes</button></div></form>`}
  else if(tab=="account"){v.innerHTML=`<form id="pwForm" class="card"><h2>Change password</h2><label for="p1">Current password</label><input id="p1" type="password" autocomplete="current-password" required><label for="p2">New password (10+ characters)</label><input id="p2" type="password" autocomplete="new-password" minlength="10" required><div class="row" style="margin-top:16px"><button class="btn">Update password</button></div></form>`}
  else if(tab=="inbox"){rows=await api("inbox");v.innerHTML=rows.length?`<div class="card" style="padding:0">`+rows.map(i=>`<div class="arow"><div><b>${i.kind=="volunteer"?"Volunteer":"Message"}</b> · ${esc(i.name)} · <a href="mailto:${esc(i.email)}">${esc(i.email)}</a>${i.phone?" · "+esc(i.phone):""}<br><small>${i.event_title?esc(i.event_title)+" · ":""}${esc(i.message||"")} ${new Date(i.created_at).toLocaleString()}</small></div><button class="btn o sm" data-idel="${i.id}">Delete</button></div>`).join("")+`</div>`:"<p class='meta'>No sign-ups or messages yet.</p>"}
  else{rows=await api(tab);const c=CFG[tab];v.innerHTML=`<div class="row" style="margin-bottom:12px"><button class="btn sm" data-add>Add ${c.n.toLowerCase()}</button></div><div class="card" style="padding:0">`+(rows.map(r=>`<div class="arow"><div>${c.row(r)}</div><div class="row"><button class="btn o sm" data-edit="${r.id}">Edit</button><button class="btn o sm" data-del="${r.id}">Delete</button></div></div>`).join("")||`<div class="arow"><small>Nothing here yet.</small></div>`)+`</div>`}
 }catch(x){if(x.message!=="Please sign in.")v.innerHTML=`<p class="err">${esc(x.message)}</p>`}
}
function openForm(id){edId=id;const c=CFG[tab],r=id?rows.find(x=>x.id==id)||{}:{};$("#dt").textContent=(id?"Edit ":"Add ")+c.n.toLowerCase();$("#derr").textContent="";$("#db").innerHTML=c.f.map(([k,l,t])=>fld(k,l,t,r[k]||"")).join("");$("#dlg").showModal()}
$("#dc").onclick=()=>$("#dlg").close();
$("#df").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 try{await api(tab+(edId?"/"+edId:""),edId?"PUT":"POST",d);$("#dlg").close();toast("Saved");draw()}catch(x){$("#derr").textContent=x.message}};
document.addEventListener("click",async e=>{const t=e.target;
 if(t.dataset.tab){tab=t.dataset.tab;draw()}
 else if("add" in t.dataset)openForm(null);
 else if(t.dataset.edit)openForm(t.dataset.edit);
 else if(t.dataset.del){if(confirm("Delete this item?"))try{await api(tab+"/"+t.dataset.del,"DELETE");draw()}catch(x){toast(x.message)}}
 else if(t.dataset.idel){if(confirm("Delete this entry?"))try{await api("inbox/"+t.dataset.idel,"DELETE");draw()}catch(x){toast(x.message)}}
});
document.addEventListener("submit",async e=>{
 if(e.target.id=="siteForm"){e.preventDefault();try{await api("settings","PUT",Object.fromEntries(new FormData(e.target)));toast("Site updated")}catch(x){toast(x.message)}}
 if(e.target.id=="pwForm"){e.preventDefault();try{await api("password","POST",{current:$("#p1").value,next:$("#p2").value});e.target.reset();toast("Password updated")}catch(x){toast(x.message)}}
});
sessionStorage.getItem(TOKEN_KEY)?api("me").then(d=>showApp(d.email)).catch(showLogin):showLogin();
