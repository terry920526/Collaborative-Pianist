/* =====================================================================
   Accord – shared core. Loaded by every page after data.js.
   Provides storage, accounts, location search, availability, pricing,
   bookings, notifications, header/footer and mount().
   PROTOTYPE: all data lives in this browser's localStorage. Emails are
   simulated (see the notifications page and the admin "Emails" tab).
   ===================================================================== */

var STATUS={requested:"Awaiting accompanist",proposed:"New time proposed",confirmed:"Confirmed",declined:"Declined",cancelled:"Cancelled",completed:"Completed",demo:"Sent (sample accompanist)"};
var RESPONSES=["Under 2 hours","Under 6 hours","Under 24 hours","Within 2 days"];
var TIMES=[];(function(){for(var h=8;h<=21;h++){["00","30"].forEach(function(m){if(!(h===21&&m==="30"))TIMES.push((h<10?"0"+h:""+h)+":"+m)})}})();
var CATS=[["prep","Musical preparation"],["rel","Reliability"],["comm","Communication"],["prof","Professionalism"],["overall","Overall experience"]];
/* ---------- Supabase authentication initialization ---------- */

var AUTH_USER = null;
var AUTH_READY = null;

function loadScript(src) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = function() {
      reject(new Error("Could not load " + src));
    };
    document.head.appendChild(script);
  });
}

async function initializeSupabaseAuth() {
  try {
    if (typeof supabaseClient === "undefined") {
      if (!window.supabase) {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
        );
      }

      await loadScript("assets/supabase.js");
    }

    var result = await supabaseClient.auth.getSession();

    if (result.error) {
      throw result.error;
    }

    if (result.data.session) {
      await loadSupabaseProfile(result.data.session);
    }

    supabaseClient.auth.onAuthStateChange(function(event, session) {
      setTimeout(async function() {
        try {
          if (session) {
            await loadSupabaseProfile(session);
          } else {
            AUTH_USER = null;
            DB.session = null;
          }

          renderHeader();
        } catch (error) {
          console.error("Authentication update failed:", error);
        }
      }, 0);
    });

    return true;
  } catch (error) {
    console.error("Supabase initialization failed:", error);
    return false;
  }
}

AUTH_READY = initializeSupabaseAuth();
var REPORT_REASONS=["Inappropriate behavior","Misrepresentation of credentials","Repeated cancellations","Payment dispute","Suspicious account","Other"];

/* ---------- storage ---------- */
var KEYS={users:"accord-users",session:"accord-session",custom:"accord-accompanists",bookings:"accord-bookings",revs:"accord-reviews",saved:"accord-saved",notifs:"accord-notifications",reports:"accord-reports",admin:"accord-admin"};
function load(k,fb){try{var v=localStorage.getItem(k);return v?JSON.parse(v):fb}catch(e){return fb}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var DB={
  users:load(KEYS.users,[])||[],session:load(KEYS.session,null),custom:load(KEYS.custom,[])||[],
  bookings:load(KEYS.bookings,[])||[],revs:load(KEYS.revs,[])||[],saved:load(KEYS.saved,{})||{},
  notifs:load(KEYS.notifs,[])||[],reports:load(KEYS.reports,[])||[],admin:load(KEYS.admin,{spend:0})||{spend:0}
};
function persist(k){store(KEYS[k],DB[k])}
try{var _th=localStorage.getItem("accord-theme");if(_th)document.documentElement.setAttribute("data-theme",_th)}catch(e){}

/* ---------- helpers ---------- */
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function pad(n){return n<10?"0"+n:""+n}
function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
function parseDay(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2])}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function hash(s){var h=0;s=String(s);for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function fmtDay(s){try{return parseDay(s).toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}catch(e){return s}}
function fmtShort(s){try{return parseDay(s).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}catch(e){return s}}
function fmtTime(t){var p=t.split(":"),h=+p[0],ap=h>=12?"pm":"am";h=h%12||12;return h+":"+p[1]+" "+ap}
function when(ts){var m=Math.round((Date.now()-ts)/60000);if(m<1)return "just now";if(m<60)return m+" min ago";var h=Math.round(m/60);if(h<24)return h+" h ago";return new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function money(n){n=Math.round(n*100)/100;return "$"+n.toLocaleString(undefined,{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
function opts(list,sel,any){return (any!=null?'<option value="">'+any+'</option>':'')+list.map(function(x){var v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x;return '<option value="'+esc(v)+'"'+(String(v)===String(sel)?' selected':'')+'>'+esc(l)+'</option>'}).join("")}
function checks(name,list,sel){return list.map(function(x){return '<label><input type="checkbox" name="'+name+'" value="'+esc(x)+'"'+(sel&&sel.indexOf(x)>=0?' checked':'')+'> '+esc(x)+'</label>'}).join("")}
function vals(f,name){return [].slice.call(f.querySelectorAll('input[name="'+name+'"]:checked')).map(function(i){return i.value})}
function fail(f,msg){var e=f.querySelector("[data-err]");if(e){e.textContent=msg;e.hidden=false;e.scrollIntoView({block:"nearest"})}}
function words(q){return q.toLowerCase().split(/\s+/).filter(Boolean)}
function hl(t,w){
  if(!w||!w.length)return esc(t);
  var re=new RegExp("("+w.map(function(x){return x.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("|")+")","gi");
  return t.split(re).map(function(s,i){return i%2?'<mark>'+esc(s)+'</mark>':esc(s)}).join("");
}
var _tt;function toast(m){var t=$("#toast");if(!t)return;t.textContent=m;t.classList.add("on");clearTimeout(_tt);_tt=setTimeout(function(){t.classList.remove("on")},3200)}
function go(url){location.href=url}
function pianistUrl(id){return "pianist.html?id="+encodeURIComponent(id)}
function bookingUrl(id){return "booking.html?id="+encodeURIComponent(id)}
function thisPage(){return (location.pathname.split("/").pop()||"index.html")+location.search}
function safeNext(n){return /^[\w.-]+\.html(\?[\w%&=.\-]*)?$/.test(n||"")?n:""}
function today(){return iso(new Date())}

/* ---------- location ---------- */
function placeOf(city){for(var i=0;i<PLACES.length;i++)if(PLACES[i].city.toLowerCase()===String(city).toLowerCase())return PLACES[i];return null}
function resolveLocation(text){
  text=String(text||"").trim();if(!text)return null;
  if(/^\d{5}$/.test(text)){
    for(var i=0;i<PLACES.length;i++)if(PLACES[i].zips.indexOf(text)>=0)return {name:PLACES[i].city+" "+text,lat:PLACES[i].lat,lng:PLACES[i].lng};
    return null;
  }
  var c=text.split(",")[0].trim().toLowerCase(),pl=placeOf(c);
  return pl?{name:pl.city,lat:pl.lat,lng:pl.lng}:null;
}
function miles(a,b){
  var R=3958.8,rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad;
  var x=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)*Math.sin(dLng/2);
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}

/* ---------- accompanist data ---------- */
function visible(p){
  if(p.hidden||p.suspended)return false;
  if(p.ownerId){var u=userById(p.ownerId);if(!u||u.suspended)return false}
  return true;
}
function listed(){return SAMPLE.concat(DB.custom).filter(visible)}
function getP(id){var a=SAMPLE.concat(DB.custom);for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function minRate(p){var v=Object.keys(p.services).map(function(k){return p.services[k]});return v.length?Math.min.apply(null,v):0}
function revsFor(p){return DB.revs.filter(function(r){return r.pid===p.id&&!r.hidden})}
function stats(p){
  if(p.sample)return {rating:p.rating,reviews:p.reviews,cats:null};
  var r=revsFor(p);if(!r.length)return {rating:0,reviews:0,cats:null};
  var cats={};CATS.forEach(function(c){cats[c[0]]=r.reduce(function(s,x){return s+(x.scores[c[0]]||0)},0)/r.length});
  return {rating:cats.overall,reviews:r.length,cats:cats};
}
function completedCount(p){return p.sample?p.completed:DB.bookings.filter(function(b){return b.pid===p.id&&b.status==="completed"}).length}
function score(p){var s=stats(p);return s.rating*Math.log(s.reviews+2)+(p.sample?0:2)}
function slotOf(start){var h=+start.split(":")[0];return h<12?"Morning":h<17?"Afternoon":"Evening"}
function slotsFor(p,dateIso){
  var key=DAYS[(parseDay(dateIso).getDay()+6)%7],base=(p.avail&&p.avail[key])||[];
  var booked=DB.bookings.filter(function(b){return b.pid===p.id&&b.date===dateIso&&b.status==="confirmed"}).map(function(b){return slotOf(b.start)});
  return {open:base.filter(function(s){return booked.indexOf(s)<0}),booked:base.filter(function(s){return booked.indexOf(s)>=0})};
}
function nextOpen(p){
  var t=new Date();
  for(var i=1;i<=30;i++){var d=new Date(t.getFullYear(),t.getMonth(),t.getDate()+i);if(slotsFor(p,iso(d)).open.length)return i}
  return 99;
}
function estimate(p,service,duration,locType){
  var rate=p.services[service]||0,sub=rate*duration,travel=locType==="travel"?(p.travelFee||0):0,total=sub+travel;
  return {rate:rate,subtotal:sub,travel:travel,total:total,commission:total*COMMISSION,net:total*(1-COMMISSION)};
}

/* ---------- accounts ---------- */
function userById(id){for(var i=0;i<DB.users.length;i++)if(DB.users[i].id===id)return DB.users[i];return null}
function me(){var u=userById(DB.session);return u&&!u.suspended?u:null}
function isAdmin(){var u=me();return !!u&&u.role==="admin"}
function myProfile(){var u=me();if(!u)return null;return DB.custom.filter(function(p){return p.ownerId===u.id})[0]||null}
function signIn(u){DB.session=u.id;persist("session");renderHeader()}
function signOut(){DB.session=null;persist("session");renderHeader()}
function emailTaken(email,exceptId){return DB.users.some(function(u){return u.email.toLowerCase()===email.toLowerCase()&&u.id!==exceptId})}

/* ---------- notifications (simulated email) ---------- */
function notify(userId,email,subject,body,link){
  DB.notifs.unshift({id:uid("n"),to:userId||null,email:email||"(sample accompanist)",subject:subject,body:body,link:link||"",ts:Date.now(),read:false});
  DB.notifs=DB.notifs.slice(0,300);persist("notifs");
}
function myNotifs(){var u=me();return u?DB.notifs.filter(function(n){return n.to===u.id}):[]}
function unread(){return myNotifs().filter(function(n){return !n.read}).length}

/* ---------- bookings ---------- */
function getB(id){for(var i=0;i<DB.bookings.length;i++)if(DB.bookings[i].id===id)return DB.bookings[i];return null}
function lastTs(b){return b.history.length?b.history[b.history.length-1].ts:b.ts}
function myBookings(){var u=me();if(!u)return [];return DB.bookings.filter(function(b){return b.fromId===u.id||b.ownerId===u.id}).sort(function(a,b){return lastTs(b)-lastTs(a)})}
function roleIn(b){var u=me();if(!u)return "";return b.ownerId===u.id?"pianist":b.fromId===u.id?"musician":""}
function needsMe(b){var r=roleIn(b);return (r==="pianist"&&b.status==="requested")||(r==="musician"&&b.status==="proposed")||(r==="musician"&&b.status==="completed"&&!b.reviewed&&!!getP(b.pid)&&!getP(b.pid).sample)}
function attention(){return myBookings().filter(needsMe).length}
function addHistory(b,text){b.history.push({ts:Date.now(),text:text})}
function savedList(){return listed().filter(function(p){return DB.saved[p.id]})}

/* ---------- shared UI pieces ---------- */
function avatar(p,cls){
  var h=hash(p.id)%360;
  if(p.photo)return '<div class="avatar'+(cls?' '+cls:'')+'" aria-hidden="true"><img src="'+esc(p.photo)+'" alt=""></div>';
  return '<div class="avatar'+(cls?' '+cls:'')+'" style="background:hsl('+h+' 55% 87%);color:hsl('+h+' 45% 24%)" aria-hidden="true">'+esc((p.name||"?").split(/\s+/).map(function(w){return w[0]}).slice(0,2).join("").toUpperCase())+'</div>';
}
function ratingHTML(p){var s=stats(p);return s.reviews?('<span class="stars">★ '+s.rating.toFixed(1)+'</span> ('+s.reviews+' review'+(s.reviews===1?'':'s')+')'):'<span class="tag new">New</span>'}
function statusChip(s){return '<span class="status '+esc(s)+'">'+esc(STATUS[s]||s)+'</span>'}
function cardHTML(p,q,from){
  var w=q?words(q):[],u=me(),own=u&&p.ownerId===u.id;
  var tags=p.inst.slice(0,4).map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+(p.inst.length>4?'<span class="tag">+'+(p.inst.length-4)+'</span>':'');
  var match="";
  if(w.length){var hit=p.rep.filter(function(r){var l=r.toLowerCase();return w.some(function(x){return l.indexOf(x)>=0})})[0];if(hit)match='<p class="match">Knows: '+hl(hit,w)+'</p>'}
  var where=esc(p.city)+(from?(Math.round(miles(from,p))<1?' · <b>same city</b>':' · <b>'+Math.round(miles(from,p))+' mi</b> away'):'');
  return '<article class="card">'+
    '<div class="card-top">'+avatar(p)+
      '<div><h3><a href="'+pianistUrl(p.id)+'">'+esc(p.name)+'</a></h3><div class="meta">'+where+'</div><div class="meta">'+ratingHTML(p)+'</div><div class="meta">'+esc(p.level)+(p.exp?' · '+p.exp+' yrs':'')+'</div></div>'+
      '<div class="rate"><span>from</span><b>'+money(minRate(p))+'</b><span>per hour</span></div></div>'+
    '<p class="bio">'+hl(p.bio,w)+'</p>'+match+
    '<div class="tags">'+(own?'<span class="tag new">Your listing</span>':'')+tags+'</div>'+
    '<div class="card-actions"><a class="btn" href="'+pianistUrl(p.id)+'">View profile</a><a class="btn primary" href="book.html?pianist='+encodeURIComponent(p.id)+'">Request booking</a>'+
    '<button class="save" type="button" data-action="save" data-id="'+esc(p.id)+'" aria-pressed="'+(!!DB.saved[p.id])+'" aria-label="Save '+esc(p.name)+' to shortlist" title="Save to shortlist">'+(DB.saved[p.id]?"♥":"♡")+'</button></div>'+
  '</article>';
}
function stepsHTML(){
  return '<div class="steps">'+
    '<div class="step"><div class="n">1</div><h3>Search</h3><p>Find accompanists by city or ZIP code, instrument, specialty, price and the pieces they already know.</p></div>'+
    '<div class="step"><div class="n">2</div><h3>Request a booking</h3><p>Choose a service, date and time, and tell them your repertoire. They can accept, decline, or propose another time.</p></div>'+
    '<div class="step"><div class="n">3</div><h3>Rehearse and review</h3><p>Once confirmed, you both get the booking details. After your session, leave a review to help the next musician.</p></div></div>';
}
function notFound(msg){return '<div class="wrap page"><div class="empty"><h3>Page not found</h3><p>'+esc(msg||"That page does not exist.")+'</p><a class="btn primary" href="find.html">Find an accompanist</a></div></div>'}
function bookingRow(b){
  var r=roleIn(b),who=r==="pianist"?('From '+esc(b.fromName)):('With '+esc(b.pname));
  return '<a class="row-item" href="'+bookingUrl(b.id)+'">'+(needsMe(b)?'<span class="unread" aria-label="Needs your action"></span>':'')+'<div class="grow"><b>'+who+'</b><div class="meta">'+esc(b.service)+' · '+esc(fmtShort(b.date))+' at '+esc(fmtTime(b.start))+' · '+money(b.total)+'</div></div>'+statusChip(b.status)+'<span class="meta">'+when(lastTs(b))+'</span></a>';
}
function dashShell(tab,inner){
  var u=me(),n=attention(),nu=unread(),mp=myProfile(),pian=u.role==="pianist"||mp;
  var links=[["","Overview","dashboard.html"],["bookings","Bookings","bookings.html"]];
  if(pian)links.push(["profile","My profile","my-profile.html"]);
  links.push(["reviews","Reviews","reviews.html"],["payments","Payments","payments.html"]);
  if(!pian)links.push(["saved","Shortlist","saved.html"]);
  links.push(["notifications","Notifications","notifications.html"],["settings","Settings","settings.html"]);
  return '<div class="wrap page"><div class="dash"><nav class="tabs" aria-label="Account">'+links.map(function(l){
    var b=l[0]==="bookings"&&n?'<span class="badge">'+n+'</span>':l[0]==="notifications"&&nu?'<span class="badge">'+nu+'</span>':'';
    return '<a href="'+l[2]+'"'+(l[0]===tab?' aria-current="page"':'')+'>'+l[1]+b+'</a>';
  }).join("")+'</nav><div>'+inner+'</div></div></div>';
}
function guard(){if(!me())return {redirect:"login.html?next="+encodeURIComponent(thisPage())};return null}
function guardAdmin(){var g=guard();if(g)return g;if(!isAdmin())return {title:"Not allowed – Accord",html:notFound("This area is for administrators.")};return null}

/* ---------- header and footer (edit nav links here, once) ---------- */
var HEADER_HTML=
'<header class="top"><div class="wrap">'+
  '<a class="logo" href="index.html"><i aria-hidden="true"></i>Accord</a>'+
  '<nav class="main" aria-label="Main" id="nav">'+
    '<a href="find.html" data-nav="find">Find an accompanist</a>'+
    '<a href="how-it-works.html" data-nav="how">How it works</a>'+
    '<a href="become-accompanist.html" data-nav="for">Become an accompanist</a>'+
    '<a href="help.html" data-nav="help">Help</a>'+
  '</nav><div class="spacer"></div>'+
  '<div class="hdr-right">'+
    '<button class="icon-btn" id="themeBtn" type="button" aria-label="Switch light or dark theme" title="Switch theme">◐</button>'+
    '<a class="btn small hide-s" href="saved.html" id="savedLink">♥ <span class="badge" id="savedCount">0</span></a>'+
    '<span id="auth" class="hdr-right"></span>'+
  '</div></div></header>';
var FOOTER_HTML=
'<footer><div class="wrap"><div class="fcols">'+
  '<div><b style="font-family:var(--serif);font-size:22px;color:var(--ink)">Accord</b><p style="margin-top:8px;max-width:32ch">Find, evaluate and book a collaborative pianist. Prototype with sample profiles.</p></div>'+
  '<div><h4>Musicians</h4><a href="find.html">Find an accompanist</a><a href="how-it-works.html">How it works</a><a href="saved.html">Your shortlist</a><a href="bookings.html">My bookings</a></div>'+
  '<div><h4>Accompanists</h4><a href="become-accompanist.html">Why list on Accord</a><a href="signup.html?role=pianist">Create a profile</a><a href="my-profile.html">My profile</a></div>'+
  '<div><h4>Support</h4><a href="help.html">Help center</a><a href="help.html#policies">Policies</a><a href="login.html">Log in</a><a href="signup.html">Sign up</a></div>'+
'</div><p class="fine">Names, reviews and rates of sample accompanists are fictional. Accounts and data are stored in this browser only. Emails are simulated.</p></div></footer>';

function renderHeader(){
  var u=me();
  var sc=$("#savedCount");if(sc)sc.textContent=Object.keys(DB.saved).length;
  var a=$("#auth");if(!a)return;
  if(u){
    var n=attention(),nu=unread(),first=esc(u.name.split(" ")[0]);
    a.innerHTML=(u.role==="admin"?'<a class="btn small" href="admin.html">Admin</a>':'')+
      '<a class="icon-btn" href="notifications.html" aria-label="Notifications'+(nu?', '+nu+' unread':'')+'" title="Notifications" style="text-decoration:none;position:relative">🔔'+(nu?'<span class="badge" style="position:absolute;top:-6px;right:-6px">'+nu+'</span>':'')+'</a>'+
      '<a class="btn small primary" href="dashboard.html">'+first+(n?' <span class="badge" aria-label="'+n+' need your action">'+n+'</span>':'')+'</a><button class="btn small quiet hide-s" type="button" data-action="logout">Log out</button>';
  }else{
    a.innerHTML='<a class="btn small hide-s" href="login.html">Log in</a><a class="btn small primary" href="signup.html">Sign up</a>';
  }
}

/* ---------- page mounting ---------- */
var PARAMS=new URLSearchParams(location.search);
var CUR=null;
var ACTIONS={};   /* data-action handlers; pages add their own */
var FORMS={};     /* data-form submit handlers; pages add their own */
var onSavedChange=null;

function mount(viewFn,route){
  CUR={fn:viewFn,route:route||""};
  document.body.insertAdjacentHTML("afterbegin",'<a class="skip" href="#main">Skip to content</a>'+HEADER_HTML);
  $("#main").insertAdjacentHTML("afterend",FOOTER_HTML);
  [].forEach.call(document.querySelectorAll("#nav a"),function(a){if(a.dataset.nav===CUR.route)a.setAttribute("aria-current","page")});
  $("#themeBtn").addEventListener("click",function(){
    var root=document.documentElement,cur=root.getAttribute("data-theme");
    var dark=cur?cur==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next=dark?"light":"dark";root.setAttribute("data-theme",next);
    try{localStorage.setItem("accord-theme",next)}catch(e){}
  });
  renderHeader();
  draw(false);
}
function draw(keepScroll){
  var y=window.scrollY,out=CUR.fn({params:PARAMS});
  if(out.redirect){location.replace(out.redirect);return}
  $("#view").innerHTML=out.html;
  document.title=out.title;
  if(out.after)out.after();
  if(keepScroll)window.scrollTo(0,y);
  else{window.scrollTo(0,0);try{$("#main").focus({preventScroll:true})}catch(e){}}
}
function rerender(){draw(true)}

/* ---------- shared events ---------- */
document.addEventListener("click",function(e){
  var b=e.target.closest("[data-action]");if(!b)return;
  var fn=ACTIONS[b.dataset.action];if(fn)fn(b,e);
});
document.addEventListener("submit",function(e){
  var f=e.target.closest("form[data-form]");if(!f)return;
  e.preventDefault();
  var er=f.querySelector("[data-err]");if(er)er.hidden=true;
  var fn=FORMS[f.dataset.form];if(fn)fn(f);
});
ACTIONS.logout=function(){signOut();toast("Logged out");setTimeout(function(){go("index.html")},400)};
ACTIONS.save=function(b){
  var id=b.dataset.id,p=getP(id);
  if(DB.saved[id]){delete DB.saved[id];toast("Removed from shortlist")}else{DB.saved[id]=1;toast((p?p.name+" saved":"Saved")+" to your shortlist")}
  persist("saved");renderHeader();
  if(onSavedChange)onSavedChange();else rerender();
};
/* Two-click confirmation for destructive buttons: add data-arm="Label" and handle after calling armed(b). */
var _armT;
function armed(b,label){
  if(b.dataset.armed)return true;
  b.dataset.armed="1";var old=b.textContent;b.textContent=label||"Click again to confirm";clearTimeout(_armT);
  _armT=setTimeout(function(){b.removeAttribute("data-armed");b.textContent=old},3000);return false;
}

/* ---------- booking text used in notifications ---------- */
function bookingSummary(b){
  return b.service+"\n"+fmtDay(b.date)+" at "+fmtTime(b.start)+" ("+b.duration+" hour"+(b.duration===1?"":"s")+")\nInstrument: "+b.inst+"\nRepertoire: "+b.repertoire+
    "\nLocation: "+(b.locType==="travel"?"At the musician's location, "+(b.address||""):"At the accompanist's studio")+"\nTotal: "+money(b.total);
}
/* Notify the other party in a booking. fromRole is who did the action. */
function notifyOther(b,fromRole,subject,body){
  var link=bookingUrl(b.id);
  if(fromRole==="pianist"){var m=userById(b.fromId);notify(m?m.id:null,m?m.email:b.fromEmail,subject,body,link)}
  else{var o=b.ownerId?userById(b.ownerId):null;notify(o?o.id:null,o?o.email:"(sample accompanist)",subject,body,link)}
}

/* ---------- FAQ (used by how-it-works and help) ---------- */
function faqHTML(){
  var q=[["How many rehearsals will I need?","For a jury or short audition, one rehearsal plus a warm-up on the day is common. Recitals, concertos and competitions often benefit from two or three sessions. Ask the accompanist what they recommend."],
   ["What should I send the accompanist?","The exact edition of your music as a PDF or link, the tempo you want, any cuts or repeats, and your date. Send it early, because a difficult piano part takes time to learn."],
   ["Why do requests need to be confirmed?","Accompanists often need to check that they know the repertoire, have enough preparation time, and can travel to your location. That is why Accord uses booking requests rather than instant booking."],
   ["Can I search by the piece I am playing?","Yes. Accompanists list works they have performed or prepared. Search a composer or piece, such as Brahms Cello Sonata No. 1, to find people who already know it."],
   ["How should I compare rates?","Rates are per hour in US dollars and vary by service. Travel fees are listed on each profile. Unfamiliar pieces may involve extra preparation fees, so ask before you confirm."]];
  return '<div class="faq">'+q.map(function(x){return '<details><summary>'+esc(x[0])+'</summary><p>'+esc(x[1])+'</p></details>'}).join("")+'</div>';
}
