/* =====================================================================
   Accord – shared core. Loaded by every page after data.js.
   Provides storage, accounts, location search, availability, pricing,
   bookings, notifications, header/footer and mount().
   Accounts and published accompanist profiles come from Supabase.
   Bookings, reviews, notifications and the shortlist are kept in the
   visitor's browser (localStorage).
   ===================================================================== */

var STATUS={requested:"Awaiting accompanist",proposed:"New time proposed",confirmed:"Confirmed",declined:"Declined",cancelled:"Cancelled",completed:"Completed"};
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
function visible(p) {
  if (p.hidden || p.suspended) return false;

  if (p.ownerId) {
    var u = userById(p.ownerId);

    // If the account is known locally, respect its suspension status.
    // Supabase accounts may not exist in the browser's local user list.
    if (u && u.suspended) return false;
  }

  return true;
}
function listed(){
  /* On the search page, never show cached public profiles until Supabase has
     successfully confirmed the current published directory. */
  if (typeof REMOTE !== "undefined" && (!REMOTE.done || REMOTE.failed)) return [];
  return DB.custom.filter(visible);
}
function getP(id){var a=DB.custom;for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null}
function minRate(p){var v=Object.keys(p.services).map(function(k){return p.services[k]});return v.length?Math.min.apply(null,v):0}
function revsFor(p){return DB.revs.filter(function(r){return r.pid===p.id&&!r.hidden})}
function stats(p){
  var r=revsFor(p);if(!r.length)return {rating:0,reviews:0,cats:null};
  var cats={};CATS.forEach(function(c){cats[c[0]]=r.reduce(function(s,x){return s+(x.scores[c[0]]||0)},0)/r.length});
  return {rating:cats.overall,reviews:r.length,cats:cats};
}
function completedCount(p){return DB.bookings.filter(function(b){return b.pid===p.id&&b.status==="completed"}).length}
function score(p){var s=stats(p);return s.rating*Math.log(s.reviews+2)}
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

/* ---------- accounts: Supabase ---------- */

function userById(id) {
  if (AUTH_USER && AUTH_USER.id === id) {
    return AUTH_USER;
  }

  return DB.users.find(function(user) {
    return user.id === id;
  }) || null;
}

function me() {
  return AUTH_USER;
}

function isAdmin() {
  return !!AUTH_USER && AUTH_USER.role === "admin";
}

function myProfile() {
  var user = me();

  if (!user) return null;

  return DB.custom.find(function(profile) {
    return profile.ownerId === user.id;
  }) || null;
}

async function loadSupabaseProfile(session) {
  if (!session || !session.user) {
    AUTH_USER = null;
    DB.session = null;
    return null;
  }

  var result = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (result.error) {
    console.error("Could not load profile:", result.error);
    throw result.error;
  }

  var profile = result.data;

  if (!profile) {
    console.warn(
      "No profile record exists for this account yet:",
      session.user.id
    );

    var metaName = session.user.user_metadata?.full_name || "";
    AUTH_USER = {
      id: session.user.id,
      email: session.user.email || "",
      name: metaName || (session.user.email || "Member").split("@")[0],
      full_name: metaName,
      role: session.user.user_metadata?.role === "pianist" ? "pianist" : "musician"
    };
  } else {
    AUTH_USER = {
      id: profile.id,
      email: session.user.email || "",
      name: profile.full_name || "",
      full_name: profile.full_name || "",
      role: profile.role || "musician",
      city: profile.city || "",
      state: profile.state || "",
      country: profile.country || "",
      bio: profile.bio || ""
    };
  }

  DB.session = AUTH_USER.id;

  return AUTH_USER;
}

async function signIn(credentials) {
  var result = await supabaseClient.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });

  if (result.error) throw result.error;

  await loadSupabaseProfile(result.data.session);

  renderHeader();

  return AUTH_USER;
}

async function signOut() {
  var result = await supabaseClient.auth.signOut();

  if (result.error) {
    console.error("Sign-out failed:", result.error);
    throw result.error;
  }

  AUTH_USER = null;
  DB.session = null;

  renderHeader();
}

function emailTaken(email, exceptId) {
  return DB.users.some(function(user) {
    return user.email.toLowerCase() === email.toLowerCase()
      && user.id !== exceptId;
  });
}

/* ---------- notifications ---------- */
function notify(userId,email,subject,body,link){
  DB.notifs.unshift({id:uid("n"),to:userId||null,email:email||"(no email on file)",subject:subject,body:body,link:link||"",ts:Date.now(),read:false});
  DB.notifs=DB.notifs.slice(0,300);persist("notifs");
}
function myNotifs(){var u=me();return u?DB.notifs.filter(function(n){return n.to===u.id}):[]}
function unread(){return myNotifs().filter(function(n){return !n.read}).length}

/* ---------- bookings ---------- */
function getB(id){for(var i=0;i<DB.bookings.length;i++)if(DB.bookings[i].id===id)return DB.bookings[i];return null}
function lastTs(b){return b.history.length?b.history[b.history.length-1].ts:b.ts}
function myBookings(){var u=me();if(!u)return [];return DB.bookings.filter(function(b){return b.fromId===u.id||b.ownerId===u.id}).sort(function(a,b){return lastTs(b)-lastTs(a)})}
function roleIn(b){var u=me();if(!u)return "";return b.ownerId===u.id?"pianist":b.fromId===u.id?"musician":""}
function needsMe(b){var r=roleIn(b);return (r==="pianist"&&b.status==="requested")||(r==="musician"&&b.status==="proposed")||(r==="musician"&&b.status==="completed"&&!b.reviewed&&!!getP(b.pid))}
function attention(){return myBookings().filter(needsMe).length}
function addHistory(b,text){b.history.push({ts:Date.now(),text:text})}
function savedList(){return listed().filter(function(p){return DB.saved[p.id]})}

/* =====================================================================
   Accompanist profiles from Supabase
   The database is the source of truth. The copy kept in the browser
   (DB.custom) only makes pages feel quick, and it is refreshed or pruned
   every time the database is read, so a profile that was deleted or
   unpublished stops appearing.
   ===================================================================== */
var PROFILE_SELECT =
  "id, full_name, role, city, state, bio, " +
  "pianist_profiles!inner(hourly_rate, years_experience, instruments, " +
  "specialties, available_for_hire, is_published, profile_details, created_at)";
var PROFILE_CHECKED = {};   /* profile ids already checked against the database during this page view */

function remoteLive() {
  return typeof supabaseClient !== "undefined" && !!supabaseClient && typeof supabaseClient.from === "function";
}

/* Turn one database row into the profile object the pages use. */
function profileFromRow(row) {
  var pp = row.pianist_profiles;
  if (Array.isArray(pp)) pp = pp[0];
  if (!pp) return null;

  var d = pp.profile_details || {};
  var city = row.city || "";
  var place = placeOf(city);
  var exp = Number(pp.years_experience || 0);

  var services = d.services || {};
  if (!Object.keys(services).length && pp.hourly_rate != null) {
    services = { "Rehearsal": Number(pp.hourly_rate) };
  }

  return {
    id: row.id,
    ownerId: row.id,
    name: row.full_name || "Accompanist",
    city: city,
    state: row.state || "",
    zip: d.zip || "",
    lat: place ? place.lat : null,
    lng: place ? place.lng : null,
    bio: row.bio || "",
    level: d.level || (exp >= 7 ? "Established professional" : exp >= 3 ? "Emerging professional" : "Student"),
    exp: exp,
    inst: pp.instruments || [],
    specialties: pp.specialties || [],
    purposes: d.purposes || [],
    services: services,
    languages: d.languages || [],
    education: d.education || "",
    rep: d.repertoire || [],
    avail: d.availability || {},
    videos: d.videos || [],
    travelFee: Number(d.travelFee || 0),
    travelRadius: Number(d.travelRadius || 0),
    studio: !!d.studio,
    photo: "",
    hidden: false,
    suspended: false,
    rating: 0,
    reviews: 0,
    completed: 0
  };
}

function publishedAccompanistsQuery() {
  return supabaseClient
    .from("profiles")
    .select(PROFILE_SELECT)
    .in("role", ["pianist", "both"])
    .eq("pianist_profiles.is_published", true)
    .eq("pianist_profiles.available_for_hire", true)
    .gt("pianist_profiles.hourly_rate", 0);
}

/* All published accompanists (or the newest few when a limit is given). */
async function fetchPublishedAccompanists(limit) {
  var q = publishedAccompanistsQuery();
  if (limit) {
    q = q.order("created_at", { foreignTable: "pianist_profiles", ascending: false }).limit(limit);
  }
  var result = await q;
  if (result.error) throw result.error;
  return (result.data || []).map(profileFromRow).filter(Boolean);
}

/* One published accompanist, or null when they do not exist or are not public. */
async function fetchAccompanistById(id) {
  var result = await publishedAccompanistsQuery().eq("id", id).maybeSingle();
  if (result.error) throw result.error;
  return result.data ? profileFromRow(result.data) : null;
}

/*
 * Update the saved copy from a fresh database read.
 *   complete = true  : `fresh` is the whole published list, so every other
 *                      saved profile is removed.
 *   complete = false : `fresh` is only part of the list, so others are left alone.
 * The signed-in user's own profile is always kept, so they can still edit it
 * while it is hidden. (My profile page checks that one against the database.)
 */
function syncProfileCache(fresh, complete) {
  var u = me(), seen = {}, out = [];
  fresh.forEach(function(p) { seen[p.id] = true; out.push(p); });
  DB.custom.forEach(function(p) {
    if (seen[p.id]) return;
    if (u && p.ownerId === u.id) {
      /* Keep an owner's private profile available for editing, but never let
         an old cached copy masquerade as a currently published listing. */
      p.hidden = true;
      out.push(p);
    } else if (!complete) {
      out.push(p);
    }
  });
  DB.custom = out;
  persist("custom");
}

/* Check one profile against the database and fix the saved copy. Resolves true when it is public. */
async function refreshAccompanist(id) {
  var p = await fetchAccompanistById(id);
  var u = me();
  if (p) {
    var i = DB.custom.findIndex(function(x) { return x.id === id; });
    if (i >= 0) DB.custom[i] = p; else DB.custom.push(p);
  } else if (u && u.id === id) {
    /* A profile absent from the public query is unpublished or unavailable.
       Retain it for its owner to edit, but hide it from public listings. */
    var ownIndex = DB.custom.findIndex(function(x) { return x.id === id; });
    if (ownIndex >= 0) DB.custom[ownIndex].hidden = true;
  } else {
    /* Remove cached copies when Supabase confirms the profile is not public. */
    DB.custom = DB.custom.filter(function(x) { return x.id !== id; });
  }
  persist("custom");
  return !!p;
}

/* For a page that shows one profile: is a database check still needed before drawing it? */
function needsProfileCheck(id) { return remoteLive() && !PROFILE_CHECKED[id]; }
function checkProfile(id) {
  return refreshAccompanist(id)
    .catch(function(e) {
      console.error("Could not check the accompanist profile:", e);
      /* If verification fails, fail closed for visitors: do not display an old
         cached profile. The signed-in owner may retain their copy for editing. */
      var u = me();
      if (!(u && u.id === id)) {
        DB.custom = DB.custom.filter(function(p) { return p.id !== id; });
        persist("custom");
      }
    })
    .then(function() { PROFILE_CHECKED[id] = true; rerender(); });
}
function profileLoadingShell(title) {
  return { title: title, html: '<div class="wrap page"><div class="empty"><h3>Loading…</h3><p>One moment.</p></div></div>' };
}

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
    '<div class="card-actions"><a class="btn" href="'+pianistUrl(p.id)+'">View profile</a><a class="btn primary" href="book.html?pianist='+encodeURIComponent(p.id)+'">Connect</a>'+
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
function guard(){if(!me())return {redirect:"index.html?auth=login&next="+encodeURIComponent(thisPage())};return null}
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
  '<div><b style="font-family:var(--serif);font-size:22px;color:var(--ink)">Accord</b><p style="margin-top:8px;max-width:32ch">Find, evaluate and book a collaborative pianist in Southern California.</p></div>'+
  '<div><h4>Musicians</h4><a href="find.html">Find an accompanist</a><a href="how-it-works.html">How it works</a><a href="saved.html">Your shortlist</a><a href="bookings.html">My bookings</a></div>'+
  '<div><h4>Accompanists</h4><a href="become-accompanist.html">Why list on Accord</a><a href="signup.html?role=pianist">Create a profile</a><a href="my-profile.html">My profile</a></div>'+
  '<div><h4>Support</h4><a href="help.html">Help center</a><a href="help.html#cancellations">Policies</a><a href="login.html">Log in</a><a href="signup.html">Sign up</a></div>'+
'</div><p class="fine">© '+new Date().getFullYear()+' Accord</p></div></footer>';

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
   AUTH_READY.then(function() {
    renderHeader();
    draw(false);
    openAuthFromUrl();
  });
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
  if(fromRole==="pianist"){var m=userById(b.fromId);notify(b.fromId||null,m?m.email:b.fromEmail,subject,body,link)}
  else{var o=b.ownerId?userById(b.ownerId):null;notify(b.ownerId||null,o?o.email:"",subject,body,link)}
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

/* =====================================================================
   Log in / Create account popup
   Works on every page. Opens from the header, footer, any "Request
   booking" button, or a URL like index.html?auth=login&next=dashboard.html
   ===================================================================== */
var AUTH_DLG = null;
var AUTH_OPTS = {};
var AUTH_DOWN_ON_BACKDROP = false;

function authDialog() {
  if (AUTH_DLG) return AUTH_DLG;

  var d = document.createElement("dialog");
  d.id = "authDlg";
  d.className = "auth-dlg";
  d.setAttribute("aria-labelledby", "authTitle");

  d.innerHTML =
    '<div class="auth-box">' +
      '<button class="icon-btn auth-x" type="button" data-auth-close aria-label="Close">✕</button>' +
      '<h2 id="authTitle"></h2>' +
      '<p class="auth-note" id="authNote" hidden></p>' +

      '<div class="auth-tabs" role="tablist" aria-label="Log in or create an account">' +
        '<button type="button" role="tab" id="authTabLogin" aria-controls="authLogin" data-auth-mode="login">Log in</button>' +
        '<button type="button" role="tab" id="authTabSignup" aria-controls="authSignup" data-auth-mode="signup">Create account</button>' +
      '</div>' +

      /* ---- log in ---- */
      '<form class="form" id="authLogin" role="tabpanel" aria-labelledby="authTabLogin" data-form="login" novalidate>' +
        '<div class="field"><label for="le">Email address</label>' +
          '<input id="le" name="le" type="email" autocomplete="email"></div>' +
        '<div class="field"><label for="lp">Password</label>' +
          '<input id="lp" name="lp" type="password" autocomplete="current-password"></div>' +
        '<p class="err" data-err role="alert" hidden></p>' +
        '<button class="btn primary block" type="submit">Log in</button>' +
        '<p class="note auth-switch">New to Accord? <button type="button" class="linkbtn" data-auth-mode="signup">Create an account</button></p>' +
      '</form>' +

      /* ---- create account ---- */
      '<form class="form" id="authSignup" role="tabpanel" aria-labelledby="authTabSignup" data-form="signup" novalidate hidden>' +
        '<div class="roles" role="radiogroup" aria-label="I am a">' +
          '<label class="role"><input type="radio" name="role" value="musician" checked>' +
            '<span><b>Musician</b><small>I need an accompanist</small></span></label>' +
          '<label class="role"><input type="radio" name="role" value="pianist">' +
            '<span><b>Accompanist</b><small>I am an accompanist</small></span></label>' +
        '</div>' +
        '<div class="field"><label for="firstName">First name</label>' +
          '<input id="firstName" name="firstName" maxlength="80" autocomplete="given-name" required></div>' +
        '<div class="field"><label for="lastName">Last name</label>' +
          '<input id="lastName" name="lastName" maxlength="80" autocomplete="family-name" required></div>' +
        '<div class="field"><label for="se">Email address</label>' +
          '<input id="se" name="se" type="email" autocomplete="email"></div>' +
        '<div class="field"><label for="sp">Password</label>' +
          '<input id="sp" name="sp" type="password" autocomplete="new-password" minlength="8">' +
          '<small class="password-hint">Your password must contain:</small>' +
          '<small class="password-hint">• At least 8 characters</small>' +
          '<small class="password-hint">• At least one uppercase letter (A–Z)</small>' +
          '<small class="password-hint">• At least one lowercase letter (a–z)</small>' +
          '<small class="password-hint">• At least one digit (0–9)</small></div>' +


        '<div class="field"><label for="sc">Confirm password</label>' +
          '<input id="sc" name="sc" type="password" autocomplete="new-password" minlength="8"></div>' +
        '<p class="err" data-err role="alert" hidden></p>' +
        '<button class="btn primary block" type="submit">Create account</button>' +
        '<p class="note auth-switch">Already have an account? <button type="button" class="linkbtn" data-auth-mode="login">Log in</button></p>' +
      '</form>' +

      /* ---- "check your email" message ---- */
      '<div id="authDone" hidden>' +
        '<div class="done"><div class="tick" aria-hidden="true">✓</div>' +
        '<h3 style="font-size:24px;font-weight:600">Check your email</h3>' +
        '<p class="note" style="margin:8px 0 18px" id="authDoneMsg"></p>' +
        '<button class="btn block" type="button" data-auth-mode="login">Back to log in</button></div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(d);

  /* close on the backdrop, but not when a text selection merely ends there */
  d.addEventListener("pointerdown", function (e) { AUTH_DOWN_ON_BACKDROP = (e.target === d); });
  d.addEventListener("click", function (e) {
    if (e.target === d && AUTH_DOWN_ON_BACKDROP) { closeAuth(); return; }
    if (e.target.closest("[data-auth-close]")) { closeAuth(); return; }
    var m = e.target.closest("[data-auth-mode]");
    if (m) setAuthMode(m.dataset.authMode, true);
  });

  /* left and right arrow keys move between the two tabs */
  d.addEventListener("keydown", function (e) {
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && e.target.closest(".auth-tabs")) {
      setAuthMode(e.target.id === "authTabLogin" ? "signup" : "login", true);
      $(e.target.id === "authTabLogin" ? "#authTabSignup" : "#authTabLogin").focus();
    }
  });

  AUTH_DLG = d;
  return d;
}

function setAuthMode(mode, focusField) {
  var d = authDialog(), login = mode !== "signup";
  $("#authLogin").hidden = !login;
  $("#authSignup").hidden = login;
  $("#authDone").hidden = true;
  $(".auth-tabs").hidden = false;
  $("#authTabLogin").setAttribute("aria-selected", login);
  $("#authTabSignup").setAttribute("aria-selected", !login);
  $("#authTabLogin").tabIndex = login ? 0 : -1;
  $("#authTabSignup").tabIndex = login ? -1 : 0;
  $("#authTitle").textContent = login ? "Welcome back" : "Create your account";
  [].forEach.call(d.querySelectorAll("[data-err]"), function (e) { e.hidden = true; });
  if (focusField) $(login ? "#le" : "#sn", d).focus();
}

function openAuth(mode, opts) {
  AUTH_OPTS = opts || {};
  var d = authDialog();
  setAuthMode(mode === "signup" ? "signup" : "login", false);

  var note = $("#authNote");
  note.textContent = AUTH_OPTS.note || "";
  note.hidden = !AUTH_OPTS.note;

  if (AUTH_OPTS.role === "pianist" || AUTH_OPTS.role === "musician") {
    var r = $('#authSignup input[name="role"][value="' + AUTH_OPTS.role + '"]');
    if (r) r.checked = true;
  }

  if (!d.open) {
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  }
  $(mode === "signup" ? "#sn" : "#le", d).focus();
}

function closeAuth() {
  if (!AUTH_DLG) return;
  if (typeof AUTH_DLG.close === "function") AUTH_DLG.close();
  else AUTH_DLG.removeAttribute("open");
}

/* Open the popup when the URL asks for it, then tidy the address bar. */
function openAuthFromUrl() {
  var mode = PARAMS.get("auth");
  if (!mode) return;

  var next = PARAMS.get("next"), role = PARAMS.get("role");
  var rest = new URLSearchParams(location.search);
  ["auth", "next", "role"].forEach(function (k) { rest.delete(k); });
  try {
    var q = rest.toString();
    history.replaceState(null, "", location.pathname + (q ? "?" + q : ""));
  } catch (e) {}

  if (me()) {                       /* already logged in: just continue */
    go(safeNext(next) || "dashboard.html");
    return;
  }
  openAuth(mode === "signup" ? "signup" : "login", {
    role: role,
    next: next,
    note: safeNext(next) ? "Log in or create an account to continue." : ""
  });
}

/* Any link to login.html, signup.html or book.html opens the popup in place when logged out. */
document.addEventListener("click", function (e) {
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  var a = e.target.closest("a[href]");
  if (!a || me()) return;

  var href = a.getAttribute("href");
  var m = /^(login|signup)\.html(\?.*)?$/.exec(href);

  if (m) {
    e.preventDefault();
    var q = new URLSearchParams(m[2] || "");
    openAuth(m[1], { role: q.get("role"), next: q.get("next") });
  } else if (/^book\.html\?/.test(href)) {
    e.preventDefault();
    openAuth("login", { next: href, note: "Log in or create an account to request a booking." });
  }
});

function authBusy(f, busy, label) {
  var b = f.querySelector('button[type="submit"]');
  b.disabled = busy;
  if (label) b.textContent = label;
}

/* ---------- Log in ---------- */
FORMS.login = async function (f) {
  var email = f.elements.le.value.trim().toLowerCase();
  var password = f.elements.lp.value;

  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(f, "Please enter a valid email address.");
  if (!password) return fail(f, "Please enter your password.");
  if (typeof supabaseClient === "undefined" || !supabaseClient.auth) {
    return fail(f, "The account service could not load. Please refresh the page and try again.");
  }

  authBusy(f, true, "Logging in…");
  try {
    var user = await signIn({ email: email, password: password });
    var next = safeNext(AUTH_OPTS.next);
    f.reset();
    closeAuth();
    toast("Welcome back, " + (user.name || "friend").split(" ")[0]);
    if (next) go(next); else rerender();
  } catch (error) {
    console.error("Login error:", error);
    var msg = String((error && error.message) || "");
    fail(f, /not confirmed/i.test(msg)
      ? "Please confirm your email first. Check your inbox for the confirmation link."
      : "We couldn't log you in. Check your email and password and try again.");
  } finally {
    authBusy(f, false, "Log in");
  }
};

/* ---------- Create account ---------- */
FORMS.signup = async function (f) {
  var firstName = f.elements.firstName.value.trim();
  var lastName = f.elements.lastName.value.trim();
  var email = f.elements.se.value.trim().toLowerCase();
  var password = f.elements.sp.value;
  var roleInput = f.querySelector('input[name="role"]:checked');
  var role = roleInput && roleInput.value === "pianist" ? "pianist" : "musician";

  if (!firstName) return fail(f, "Please enter your first name.");
  if (!lastName) return fail(f, "Please enter your last name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return fail(f, "Please enter a valid email address.");
  if (password.length < 8) return fail(f, "Your password must contain at least 8 characters.");
  if (password !== f.elements.sc.value) return fail(f, "Your passwords do not match.");
  if (typeof supabaseClient === "undefined" || !supabaseClient.auth) {
    return fail(f, "The account service could not load. Please refresh the page and try again.");
  }

  authBusy(f, true, "Creating account…");
  try {
    var result = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { first_name: firstName, last_name: lastName, role: role},
        emailRedirectTo: location.origin + location.pathname.replace(/[^\/]*$/, "") + "index.html"
      }
    });
    if (result.error) throw result.error;

    /* Supabase hides duplicate emails by returning a user with no identities. */
    var u = result.data && result.data.user;
    if (u && Array.isArray(u.identities) && u.identities.length === 0) {
      return fail(f, "An account with this email already exists. Try logging in instead.");
    }

    if (result.data.session) {          /* email confirmation is switched off: logged in now */
      await loadSupabaseProfile(result.data.session);
      renderHeader();
      var next = safeNext(AUTH_OPTS.next);
      f.reset();
      closeAuth();
      toast("Welcome to Accord, " + firstName);
      if (role === "pianist") go("my-profile.html");
      else if (next) go(next);
      else rerender();
    } else {                            /* email confirmation is on: ask them to check their inbox */
      f.reset();
      $("#authSignup").hidden = true;
      $(".auth-tabs").hidden = true;
      $("#authTitle").textContent = "Almost there";
      $("#authDoneMsg").textContent = "We sent a confirmation link to " + email + ". Open it, then come back and log in.";
      $("#authDone").hidden = false;
    }
  } catch (error) {
    console.error("Signup error:", error);
    var m = String((error && error.message) || "We couldn't create your account. Please try again.");
    if (/already registered|already exists|user already/i.test(m)) {
      m = "An account with this email already exists. Try logging in instead.";
    }
    fail(f, m);
  } finally {
    authBusy(f, false, "Create account");
  }
};
