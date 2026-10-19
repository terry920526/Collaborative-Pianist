/* Page: find.html – location, radius, instrument, specialty, price, availability search. */
var F={q:"",loc:"",r:25,inst:"",spec:"",purpose:"",level:"",price:"",lang:"",date:"",slot:"",sort:"relevance"};
var FROM=null,LOCBAD=false;
var REMOTE={done:false,failed:false};
function parseF(p){
  F={q:p.get("q")||"",loc:p.get("loc")||"",r:+p.get("r")||25,inst:p.get("inst")||"",spec:p.get("spec")||"",purpose:p.get("purpose")||"",
     level:p.get("level")||"",price:p.get("price")||"",lang:p.get("lang")||"",date:p.get("date")||"",slot:p.get("slot")||"",sort:p.get("sort")||"relevance"};
}
function resolveF(){FROM=resolveLocation(F.loc);LOCBAD=!!F.loc&&!FROM}
function syncUrl(){
  var p=[];["q","loc","inst","spec","purpose","level","price","lang","date","slot"].forEach(function(k){if(F[k])p.push(k+"="+encodeURIComponent(F[k]))});
  if(F.loc&&F.r!==25)p.push("r="+F.r);if(F.sort!=="relevance")p.push("sort="+F.sort);
  try{history.replaceState(null,"",location.pathname+(p.length?"?"+p.join("&"):""))}catch(e){}
}
function fMatches(p){
  if(FROM&&miles(FROM,p)>F.r)return false;
  if(F.inst&&p.inst.indexOf(F.inst)<0)return false;
  if(F.spec&&p.specialties.indexOf(F.spec)<0)return false;
  if(F.purpose&&p.purposes.indexOf(F.purpose)<0)return false;
  if(F.level&&p.level!==F.level)return false;
  if(F.lang&&p.languages.indexOf(F.lang)<0)return false;
  var m=minRate(p);
  if(F.price==="lt50"&&!(m<50))return false;
  if(F.price==="50-100"&&!(m>=50&&m<=100))return false;
  if(F.price==="100+"&&!(m>=100))return false;
  if(F.date){var s=slotsFor(p,F.date).open;if(!s.length||(F.slot&&s.indexOf(F.slot)<0))return false}
  if(F.q){
    var h=[p.name,p.city,p.bio,p.rep.join(" "),p.inst.join(" "),p.specialties.join(" "),p.education].join(" ").toLowerCase(),w=words(F.q);
    for(var i=0;i<w.length;i++)if(h.indexOf(w[i])<0)return false;
  }
  return true;
}
function fList(){
  var r=listed().filter(fMatches);
  function d(p){return FROM?miles(FROM,p):0}
  r.sort(function(a,b){
    var sa=stats(a),sb=stats(b);
    if(F.sort==="distance"&&FROM)return d(a)-d(b);
    if(F.sort==="price")return minRate(a)-minRate(b);
    if(F.sort==="rating")return sb.rating-sa.rating||sb.reviews-sa.reviews;
    if(F.sort==="experience")return b.exp-a.exp;
    if(F.sort==="availability")return nextOpen(a)-nextOpen(b);
    return (score(b)-(FROM?d(b)/15:0))-(score(a)-(FROM?d(a)/15:0));
  });
  return r;
}
function viewFind(c){
  parseF(c.params);resolveF();
  var sorts=[["relevance","Relevance (recommended)"],["distance","Distance"],["price","Price: low to high"],["rating","Rating"],["experience","Experience"],["availability","Soonest availability"]];
  var html='<div class="wrap page"><div class="page-head"><h1>Find an accompanist</h1><p>Search by location, instrument, specialty, price and the pieces they already know. Results are ranked by relevance, never by paid placement.</p></div>'+
  '<div class="filters" role="search">'+
    '<div class="f-q"><label for="fq">Search names, pieces or composers</label><input id="fq" type="search" placeholder="e.g. Brahms Cello Sonata, Schubert" value="'+esc(F.q)+'"></div>'+
    '<div><label for="floc">City or ZIP code</label><input id="floc" type="search" placeholder="e.g. Irvine or 92618" value="'+esc(F.loc)+'"><div id="locmsg"></div></div>'+
    '<div><label for="fr">Distance</label><select id="fr">'+opts(RADII.map(function(r){return [r,"Within "+r+" miles"]}),F.r)+'</select></div>'+
    '<div><label for="fi">Instrument or voice</label><select id="fi">'+opts(INSTRUMENTS,F.inst,"Any")+'</select></div>'+
    '<div><label for="fsp">Musical specialty</label><select id="fsp">'+opts(SPECIALTIES,F.spec,"Any")+'</select></div>'+
    '<div><label for="fle">Experience</label><select id="fle">'+opts(LEVELS,F.level,"Any")+'</select></div>'+
    '<div><label for="fpr">Price (per hour)</label><select id="fpr">'+opts([["lt50","Under $50"],["50-100","$50 to $100"],["100+","$100 and up"]],F.price,"Any")+'</select></div>'+
    '<div><label for="fla">Language</label><select id="fla">'+opts(LANGUAGES,F.lang,"Any")+'</select></div>'+
    '<div><label for="fd">Available on</label><input id="fd" type="date" min="'+today()+'" value="'+esc(F.date)+'"></div>'+
    '<div><label for="fsl">Time of day</label><select id="fsl">'+opts(SLOTS,F.slot,"Any time")+'</select></div>'+
    '<div><label for="fs">Sort by</label><select id="fs">'+opts(sorts,F.sort)+'</select></div>'+
  '</div>'+
  '<div class="pills" id="pills" role="group" aria-label="Purpose"></div><div class="active" id="active" aria-label="Active filters"></div><div class="count" id="count" aria-live="polite"></div><div class="grid" id="grid"></div></div>';
  return {title:"Find an accompanist – Accord",html:html,after:renderResults};
}
function renderResults(){
  if(!$("#grid"))return;
  resolveF();
  var r=fList();
  $("#pills").innerHTML=[["","Any purpose"]].concat(PURPOSES.map(function(p){return [p,p+"s".replace("Recordings","Recordings")]})).map(function(p,i){
    var label=i===0?p[1]:({Audition:"Auditions",Competition:"Competitions",Recital:"Recitals",Rehearsal:"Rehearsals",Recording:"Recordings"})[p[0]];
    return '<button class="pill" type="button" data-action="pill" data-v="'+p[0]+'" aria-pressed="'+(F.purpose===p[0])+'">'+label+'</button>'}).join("");
  var lm=$("#locmsg");
  lm.innerHTML=LOCBAD?'<div class="loc-msg">We do not recognise that place yet. Try a Southern California city or a ZIP code from a major city.</div>':(FROM?'<div class="loc-ok">Showing near '+esc(FROM.name)+'</div>':'');
  var chips=[],L={q:"Search: "+F.q,loc:F.loc?F.loc+" · "+F.r+" mi":"",inst:F.inst,spec:F.spec,purpose:F.purpose,level:F.level,price:({"lt50":"Under $50","50-100":"$50 to $100","100+":"$100 and up"})[F.price],lang:F.lang,date:F.date?fmtShort(F.date)+(F.slot?" · "+F.slot:""):""};
  Object.keys(L).forEach(function(k){if(F[k]&&L[k])chips.push([k,L[k]])});
  $("#active").innerHTML=chips.length?chips.map(function(x){return '<button class="fchip" type="button" data-action="clear" data-k="'+x[0]+'" aria-label="Remove filter: '+esc(x[1])+'">'+esc(x[1])+' <span aria-hidden="true">✕</span></button>'}).join("")+(chips.length>1?'<button class="linkbtn" type="button" data-action="clear" data-k="all">Clear all</button>':''):"";
  var note=(F.sort==="distance"&&!FROM)?" (enter a city or ZIP to sort by distance)":"";
  var waiting=remoteLive()&&!REMOTE.done;   /* do not show saved copies until the database has answered */
  $("#count").textContent=waiting?"":r.length+(r.length===1?" accompanist":" accompanists")+" match your search"+note;
  if(waiting||(!r.length&&!listed().length&&!REMOTE.done))$("#grid").innerHTML='<div class="empty"><h3>Loading accompanists…</h3><p>One moment.</p></div>';
  else if(!r.length&&!listed().length&&REMOTE.failed)$("#grid").innerHTML='<div class="empty"><h3>We couldn’t load accompanists</h3><p>Please check your connection and refresh the page.</p></div>';
  else if(!r.length&&!listed().length)$("#grid").innerHTML='<div class="empty"><h3>Our first accompanists are joining now</h3><p>Check back soon, or create your own profile if you are a collaborative pianist.</p><a class="btn primary" href="signup.html?role=pianist">Create your profile</a></div>';
  else if(!r.length)$("#grid").innerHTML='<div class="empty"><h3>No accompanists match yet</h3><p>Try a wider distance, a different date, or fewer filters. Southern California is our launch area.</p><button class="btn" type="button" data-action="clear" data-k="all">Clear all filters</button></div>';
  else $("#grid").innerHTML=r.map(function(p){return cardHTML(p,F.q,FROM)}).join("");
  syncUrl();
}
function syncInputs(){
  var m={fq:F.q,floc:F.loc,fr:F.r,fi:F.inst,fsp:F.spec,fle:F.level,fpr:F.price,fla:F.lang,fd:F.date,fsl:F.slot,fs:F.sort};
  Object.keys(m).forEach(function(id){var el=$("#"+id);if(el)el.value=m[id]});
}
onSavedChange=renderResults;
ACTIONS.pill=function(b){F.purpose=b.dataset.v;renderResults()};
ACTIONS.clear=function(b){
  var k=b.dataset.k;
  if(k==="all")F={q:"",loc:"",r:25,inst:"",spec:"",purpose:"",level:"",price:"",lang:"",date:"",slot:"",sort:"relevance"};
  else if(k==="loc"){F.loc="";F.r=25}else if(k==="date"){F.date="";F.slot=""}else F[k]="";
  syncInputs();renderResults();
};
var MAPID={fq:"q",floc:"loc",fr:"r",fi:"inst",fsp:"spec",fle:"level",fpr:"price",fla:"lang",fd:"date",fsl:"slot",fs:"sort"};
function onField(e){var k=MAPID[e.target.id];if(!k)return;F[k]=k==="r"?+e.target.value:e.target.value.trim();renderResults()}
document.addEventListener("input",function(e){if(e.target.id==="fq"||e.target.id==="floc")onField(e)});
document.addEventListener("change",onField);
mount(viewFind,"find");
async function loadRemoteAccompanists() {
  try {
    await AUTH_READY;

    if (!remoteLive()) {
      REMOTE.failed = true;
      return;
    }

    // The database is the source of truth: replace the saved copy with what it returns now.
    var fresh = await fetchPublishedAccompanists();
    syncProfileCache(fresh, true);

  } catch (error) {
    console.error("Could not load accompanists from Supabase:", error);
    REMOTE.failed = true;
  } finally {
    REMOTE.done = true;
    if (typeof renderResults === "function") renderResults();
  }
}

loadRemoteAccompanists();
