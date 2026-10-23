/* Page: find.html – simplified search with a fixed 50-mile location radius. */
var F={q:"",loc:""};
var FROM=null,LOCBAD=false,ZIP_QUERY="",ZIP_RESULT=null;
function parseF(p){F={q:p.get("q")||"",loc:p.get("loc")||""};}
function resolveF(){
  var raw=String(F.loc||"").trim();
  FROM=resolveLocation(raw);LOCBAD=!!raw&&!FROM;
  if(/^\d{5}$/.test(raw)){
    if(ZIP_RESULT&&ZIP_RESULT.zip===raw){FROM=ZIP_RESULT.location;LOCBAD=false;return;}
    if(FROM){ZIP_RESULT=null;}
    if(!FROM){LOCBAD=false;
    if(ZIP_QUERY!==raw){
      ZIP_QUERY=raw;
      fetch("https://api.zippopotam.us/us/"+raw).then(function(res){if(!res.ok)throw new Error("ZIP code not found");return res.json()}).then(function(data){
        if(ZIP_QUERY!==raw||String(F.loc||"").trim()!==raw)return;
        var place=data.places&&data.places[0];if(!place)throw new Error("ZIP code not found");
        var lat=Number(place.latitude),lng=Number(place.longitude);
        if(!isFinite(lat)||!isFinite(lng))throw new Error("ZIP code coordinates unavailable");
        FROM={name:place["place name"]+", "+place["state abbreviation"]+" "+raw,lat:lat,lng:lng};ZIP_RESULT={zip:raw,location:FROM};LOCBAD=false;renderResults();
      }).catch(function(){if(ZIP_QUERY===raw&&String(F.loc||"").trim()===raw){FROM=null;LOCBAD=true;renderResults()}});
    }
    }
  } else {ZIP_QUERY="";ZIP_RESULT=null;}
}
function syncUrl(){var p=[];["q","loc"].forEach(function(k){if(F[k])p.push(k+"="+encodeURIComponent(F[k]))});try{history.replaceState(null,"",location.pathname+(p.length?"?"+p.join("&"):""))}catch(e){}}
function fMatches(p){
  if(F.loc){if(!FROM||p.lat==null||p.lng==null||!isFinite(Number(p.lat))||!isFinite(Number(p.lng))||miles(FROM,p)>50)return false;}
  if(F.q){var h=[p.name,p.city,p.state,p.bio,p.rep.join(" "),p.inst.join(" "),p.specialties.join(" "),p.education].join(" ").toLowerCase(),w=words(F.q);for(var i=0;i<w.length;i++)if(h.indexOf(w[i])<0)return false;}
  return true;
}
function fList(){var r=listed().filter(fMatches);r.sort(function(a,b){var da=FROM&&a.lat!=null&&a.lng!=null?miles(FROM,a):0,db=FROM&&b.lat!=null&&b.lng!=null?miles(FROM,b):0;return (score(b)-(FROM?db/15:0))-(score(a)-(FROM?da/15:0));});return r;}
function viewFind(c){
  parseF(c.params);resolveF();
  var html='<div class="wrap page"><div class="page-head"><h1>Find an accompanist</h1><p>Discover collaborative pianists near you. Enter a city or ZIP code to find accompanists within 50 miles, or browse the nationwide directory.</p></div>'+ 
  '<div class="filters" role="search">'+
    '<div class="f-q"><label for="fq">Search names, pieces or composers</label><input id="fq" type="search" placeholder="e.g. Brahms Cello Sonata, Schubert" value="'+esc(F.q)+'"></div>'+
    '<div><label for="floc">City or ZIP code</label><input id="floc" type="search" placeholder="e.g. Los Angeles or 90024" value="'+esc(F.loc)+'" autocomplete="postal-code"><div id="locmsg"></div></div>'+
  '</div><div class="active" id="active" aria-label="Active filters"></div><div class="count" id="count" aria-live="polite"></div><div class="grid" id="grid"></div></div>';
  return {title:"Find an accompanist – Accord",html:html,after:renderResults};
}
function renderResults(){
  if(!$("#grid"))return;
  resolveF();var r=fList();
  var lm=$("#locmsg");if(lm){lm.innerHTML=LOCBAD?'<div class="loc-msg">We could not find that city or ZIP code. Try a major U.S. city or a valid 5-digit ZIP code.</div>':(F.loc?(FROM?'<div class="loc-ok">Showing accompanists within 50 miles of '+esc(FROM.name)+'</div>':'<div class="loc-ok">Looking up location…</div>'):'<div class="loc-ok">Browse all locations across the United States.</div>');}
  var chips=[],L={q:"Search: "+F.q,loc:F.loc};Object.keys(L).forEach(function(k){if(F[k]&&L[k])chips.push([k,L[k]])});
  $("#active").innerHTML=chips.length?chips.map(function(x){return '<button class="fchip" type="button" data-action="clear" data-k="'+x[0]+'" aria-label="Remove filter: '+esc(x[1])+'">'+esc(x[1])+' <span aria-hidden="true">✕</span></button>'}).join("")+(chips.length>1?'<button class="linkbtn" type="button" data-action="clear" data-k="all">Clear all</button>':''):"";
  $("#count").textContent=r.length+(r.length===1?" accompanist":" accompanists")+(F.loc&&FROM?" within 50 miles":"")+" match your search";
  if(!r.length){var msg=F.loc&&!FROM&&!LOCBAD?"Looking up your location…":"Try another city or ZIP code, or remove a filter.";$("#grid").innerHTML='<div class="empty"><h3>No accompanists match yet</h3><p>'+msg+'</p><button class="btn" type="button" data-action="clear" data-k="all">Clear all filters</button></div>';}
  else $("#grid").innerHTML=r.map(function(p){return cardHTML(p,F.q,FROM)}).join("");
  syncUrl();
}
function syncInputs(){var m={fq:F.q,floc:F.loc};Object.keys(m).forEach(function(id){var el=$("#"+id);if(el)el.value=m[id]});}
onSavedChange=renderResults;
ACTIONS.clear=function(b){var k=b.dataset.k;if(k==="all")F={q:"",loc:""};else F[k]="";ZIP_QUERY="";ZIP_RESULT=null;FROM=null;syncInputs();renderResults()};
var MAPID={fq:"q",floc:"loc"};
var locTimer=null;
function onField(e){var k=MAPID[e.target.id];if(!k)return;F[k]=e.target.value.trim();if(k==="loc"){if(locTimer)clearTimeout(locTimer);locTimer=setTimeout(function(){ZIP_QUERY="";ZIP_RESULT=null;resolveF();renderResults()},250);return;}renderResults()}
document.addEventListener("input",function(e){if(e.target.id==="fq"||e.target.id==="floc")onField(e)});
document.addEventListener("change",function(e){if(e.target.id!=="fq"&&e.target.id!=="floc")onField(e)});
mount(viewFind,"find");
async function loadRemoteAccompanists(){
  try{
    await AUTH_READY;
    if(typeof supabaseClient==="undefined"||!supabaseClient)return;
    var result=await supabaseClient.from("profiles").select("id, first_name, last_name, role, city, state, bio, pianist_profiles!inner(hourly_rate, years_experience, instruments, specialties, available_for_hire, is_published, profile_details)").in("role",["pianist","both"]).eq("pianist_profiles.is_published",true).eq("pianist_profiles.available_for_hire",true).gt("pianist_profiles.hourly_rate",0);
    if(result.error)throw result.error;
    (result.data||[]).forEach(function(row){var pp=Array.isArray(row.pianist_profiles)?row.pianist_profiles[0]:row.pianist_profiles;if(!pp)return;var details=pp.profile_details||{},city=row.city||"",place=placeOf(city),services=details.services||{};if(!Object.keys(services).length&&pp.hourly_rate!=null)services={"Rehearsal":Number(pp.hourly_rate)};
      var profile={id:row.id,ownerId:row.id,name:[row.first_name,row.last_name].filter(Boolean).join(" ")||"Accompanist",city:city,state:row.state||"",lat:place?place.lat:null,lng:place?place.lng:null,bio:row.bio||"",level:details.level||"Accompanist",exp:Number(pp.years_experience||0),inst:pp.instruments||[],specialties:pp.specialties||[],purposes:details.purposes||[],services:services,languages:details.languages||[],education:details.education||"",rep:details.repertoire||[],avail:details.availability||{},travelFee:Number(details.travelFee||0),travelRadius:Number(details.travelRadius||0),studio:!!details.studio,photo:"",sample:false,hidden:false,suspended:false,rating:0,reviews:0,completed:0};
      var index=DB.custom.findIndex(function(p){return p.id===profile.id});if(index>=0)DB.custom[index]=profile;else DB.custom.push(profile);
    });persist("custom");if(typeof renderResults==="function")renderResults();
  }catch(error){console.error("Could not load accompanists from Supabase:",error)}
}
loadRemoteAccompanists();
