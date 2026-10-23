/* Page: find.html – nationwide accompanist search with a fixed 50-mile radius. */
var F={q:"",loc:""};
var FROM=null,LOCBAD=false,LOCLOOKING=false,LOC_DRAFT="";
var LOCATION_CACHE=Object.create(null);
var LOCERROR="";
// Restore search terms from the URL before the page renders.
function parseF(params){
  F.q=params.get("q")||"";
  F.loc=params.get("loc")||"";
  LOC_DRAFT=F.loc;
  FROM=null;
  LOCBAD=false;
  LOCLOOKING=false;
}
function cacheKey(s){return String(s||"").trim().toLowerCase().replace(/\s+/g," ");}
async function geocodeLocation(raw){
  raw=String(raw||"").trim();if(!raw)return null;
  var key=cacheKey(raw);if(LOCATION_CACHE[key])return LOCATION_CACHE[key];
  await AUTH_READY;
  if(typeof supabaseClient==="undefined"||!supabaseClient)throw new Error("Location service unavailable");
  var result=await supabaseClient.functions.invoke("geocode-location",{body:{query:raw}});
  if(result.error){
    var message=result.error.message||"Location lookup failed";
    try{
      if(result.error.context&&typeof result.error.context.json==="function"){
        var body=await result.error.context.json();
        if(body&&body.error)message=body.error;
      }
    }catch(ignore){}
    throw new Error(message);
  }
  var data=result.data||{},lat=Number(data.lat),lng=Number(data.lng);
  if(!isFinite(lat)||!isFinite(lng))throw new Error("Location not found");
  var location={name:data.name||raw,lat:lat,lng:lng};
  LOCATION_CACHE[key]=location;return location;
}
function syncUrl(){var p=[];["q","loc"].forEach(function(k){if(F[k])p.push(k+"="+encodeURIComponent(F[k]))});try{history.replaceState(null,"",location.pathname+(p.length?"?"+p.join("&"):""))}catch(e){}}
async function commitLocation(raw){
  raw=String(raw==null?LOC_DRAFT:raw).trim();LOC_DRAFT=raw;F.loc=raw;FROM=null;LOCBAD=false;LOCERROR="";LOCLOOKING=!!raw;syncUrl();renderResults();
  if(!raw)return;
  var thisQuery=raw;
  try{
    FROM=await geocodeLocation(raw);
    if(String(F.loc||"").trim()!==thisQuery)return;
    LOCBAD=!FROM;LOCLOOKING=false;
  }catch(error){
    if(String(F.loc||"").trim()!==thisQuery)return;
    FROM=null;LOCBAD=true;LOCLOOKING=false;LOCERROR=String(error&&error.message||"Location service failed");
    console.error("Accord location search failed:",error);
  }
  renderResults();
}
function fMatches(p){
  if(F.loc){if(!FROM||p.lat==null||p.lng==null||!isFinite(Number(p.lat))||!isFinite(Number(p.lng))||miles(FROM,p)>50)return false;}
  if(F.q){var h=[p.name,p.city,p.state,p.bio,p.rep.join(" "),p.inst.join(" "),p.specialties.join(" "),p.education].join(" ").toLowerCase(),w=words(F.q);for(var i=0;i<w.length;i++)if(h.indexOf(w[i])<0)return false;}
  return true;
}
function fList(){var r=listed().filter(fMatches);r.sort(function(a,b){var da=FROM&&a.lat!=null&&a.lng!=null?miles(FROM,a):0,db=FROM&&b.lat!=null&&b.lng!=null?miles(FROM,b):0;return (score(b)-(FROM?db/15:0))-(score(a)-(FROM?da/15:0));});return r;}
function viewFind(c){
  parseF(c.params);
  var html='<div class="wrap page"><div class="page-head"><h1>Find an accompanist</h1><p>Discover collaborative pianists across the United States. Enter a city, state, or ZIP code to find accompanists within 50 miles, or browse the nationwide directory.</p></div>'+ 
  '<div class="filters" role="search">'+
    '<div class="f-q"><label for="fq">Search names, pieces or composers</label><input id="fq" type="search" placeholder="e.g. Brahms Cello Sonata, Schubert" value="'+esc(F.q)+'"></div>'+
    '<div><label for="floc">City, state, or ZIP code</label><input id="floc" type="search" placeholder="e.g. Boston, MA or 02108" value="'+esc(F.loc)+'" autocomplete="postal-code"><div class="hint">Press Enter or leave this field to apply the location search.</div><div id="locmsg" aria-live="polite"></div><div class="hint">Location data powered by <a href="https://www.geoapify.com/" target="_blank" rel="noopener">Geoapify</a> · © OpenStreetMap contributors.</div></div>'+
  '</div><div class="active" id="active" aria-label="Active filters"></div><div class="count" id="count" aria-live="polite"></div><div class="grid" id="grid"></div></div>';
  return {title:"Find an accompanist – Accord",html:html,after:function(){LOC_DRAFT=F.loc;renderResults();if(F.loc&&!FROM&&!LOCBAD)commitLocation(F.loc);}};
}
function renderResults(){
  if(!$("#grid"))return;
  var r=fList();
  var lm=$("#locmsg");if(lm){lm.innerHTML=LOCLOOKING?'<div class="loc-ok">Looking up location…</div>':LOCBAD?'<div class="loc-msg">Location lookup failed: '+esc(LOCERROR||"Please try City, State or a valid 5-digit ZIP code.")+'</div>':(F.loc?(FROM?'<div class="loc-ok">Showing accompanists within 50 miles of '+esc(FROM.name)+'</div>':'<div class="loc-ok">Enter a city or ZIP code, then press Enter.</div>'):'<div class="loc-ok">Browse all locations across the United States.</div>');}
  var chips=[],L={q:"Search: "+F.q,loc:F.loc};Object.keys(L).forEach(function(k){if(F[k]&&L[k])chips.push([k,L[k]])});
  $("#active").innerHTML=chips.length?chips.map(function(x){return '<button class="fchip" type="button" data-action="clear" data-k="'+x[0]+'" aria-label="Remove filter: '+esc(x[1])+'">'+esc(x[1])+' <span aria-hidden="true">✕</span></button>'}).join("")+(chips.length>1?'<button class="linkbtn" type="button" data-action="clear" data-k="all">Clear all</button>':''):"";
  $("#count").textContent=r.length+(r.length===1?" accompanist":" accompanists")+(F.loc&&FROM?" within 50 miles":"")+" match your search";
  if(!r.length){var msg=LOCLOOKING?"Looking up your location…":F.loc&&!FROM&&!LOCBAD?"Enter a city or ZIP code and press Enter.":LOCBAD?"Try another city or ZIP code.":"Try another search or remove a filter.";$("#grid").innerHTML='<div class="empty"><h3>No accompanists match yet</h3><p>'+msg+'</p><button class="btn" type="button" data-action="clear" data-k="all">Clear all filters</button></div>';}
  else $("#grid").innerHTML=r.map(function(p){return cardHTML(p,F.q,FROM)}).join("");
  syncUrl();
}
function syncInputs(){var m={fq:F.q,floc:F.loc};Object.keys(m).forEach(function(id){var el=$("#"+id);if(el)el.value=m[id]});LOC_DRAFT=F.loc;}
onSavedChange=renderResults;
ACTIONS.clear=function(b){var k=b.dataset.k;if(k==="all"){F={q:"",loc:""};LOC_DRAFT="";FROM=null;LOCBAD=false;LOCLOOKING=false;}else if(k==="loc"){F.loc="";LOC_DRAFT="";FROM=null;LOCBAD=false;LOCLOOKING=false;}else F[k]="";syncInputs();renderResults()};
document.addEventListener("input",function(e){if(e.target.id==="fq"){F.q=e.target.value.trim();renderResults()}else if(e.target.id==="floc"){LOC_DRAFT=e.target.value;}});
document.addEventListener("keydown",function(e){if(e.target.id==="floc"&&e.key==="Enter"){e.preventDefault();commitLocation(e.target.value)}});
document.addEventListener("change",function(e){if(e.target.id==="floc"&&String(e.target.value).trim()!==String(F.loc).trim())commitLocation(e.target.value)});
mount(viewFind,"find");
async function loadRemoteAccompanists(){
  try{
    await AUTH_READY;
    if(typeof supabaseClient==="undefined"||!supabaseClient)return;
    var result=await supabaseClient.from("profiles").select("id, first_name, last_name, role, city, state, bio, pianist_profiles!inner(hourly_rate, years_experience, instruments, specialties, available_for_hire, is_published, profile_details)").in("role",["pianist","both"]).eq("pianist_profiles.is_published",true).eq("pianist_profiles.available_for_hire",true).gt("pianist_profiles.hourly_rate",0);
    if(result.error)throw result.error;
    (result.data||[]).forEach(function(row){
      var pp=Array.isArray(row.pianist_profiles)?row.pianist_profiles[0]:row.pianist_profiles;if(!pp)return;
      var details=pp.profile_details||{},city=row.city||"",state=row.state||"",place=placeOf(city),services=details.services||{};
      if(!Object.keys(services).length&&pp.hourly_rate!=null)services={"Rehearsal":Number(pp.hourly_rate)};
      var lat=Number(details.latitude!=null?details.latitude:details.lat),lng=Number(details.longitude!=null?details.longitude:details.lng);
      if(!isFinite(lat)||!isFinite(lng)){lat=place&&(!state||/^(CA|California)$/i.test(state))?place.lat:null;lng=place&&(!state||/^(CA|California)$/i.test(state))?place.lng:null;}
      var profile={id:row.id,ownerId:row.id,name:[row.first_name,row.last_name].filter(Boolean).join(" ")||"Accompanist",city:city,state:state,zip:details.zip||"",lat:lat,lng:lng,bio:row.bio||"",level:details.level||"Accompanist",exp:Number(pp.years_experience||0),inst:pp.instruments||[],specialties:pp.specialties||[],purposes:details.purposes||[],services:services,languages:details.languages||[],education:details.education||"",rep:details.repertoire||[],avail:details.availability||{},travelFee:Number(details.travelFee||0),travelRadius:Number(details.travelRadius||0),studio:!!details.studio,photo:"",sample:false,hidden:false,suspended:false,rating:0,reviews:0,completed:0};
      var index=DB.custom.findIndex(function(p){return p.id===profile.id});if(index>=0)DB.custom[index]=profile;else DB.custom.push(profile);
    });
    persist("custom");if(typeof renderResults==="function")renderResults();
  }catch(error){console.error("Could not load accompanists from Supabase:",error)}
}
loadRemoteAccompanists();
