/* Page: my-profile.html – create or edit the accompanist profile. */
var PHOTO="";
function viewMyProfile(){
  var g=guard();if(g)return g;
  var u=me(),existing=myProfile();
  var p=existing||{name:u.name,city:"",zip:"",level:"Emerging professional",exp:3,specialties:[],inst:[],purposes:[],services:{"Rehearsal":60},travelFee:0,travelRadius:15,studio:true,languages:["English"],education:"",bio:"",rep:[],avail:{},videos:[],photo:"",hidden:false};
  PHOTO=p.photo||"";
  var fields=[p.city,p.photo,(p.bio||"").length>=80,p.rep.length>=4,p.inst.length,p.specialties.length,p.purposes.length,Object.keys(p.services).length,p.education,p.videos.length,Object.keys(p.avail||{}).length,p.languages.length];
  var pct=Math.round(fields.filter(Boolean).length/fields.length*100);
  var svc=SERVICES.map(function(s,i){var on=p.services[s]!=null;return '<div class="svc-edit"><label><input type="checkbox" name="svc" value="'+esc(s)+'"'+(on?' checked':'')+'> '+esc(s)+'</label><input type="number" name="rate-'+i+'" min="20" max="500" value="'+(on?p.services[s]:Math.max(20,Math.round((p.services.Rehearsal||60)*(1+i*.1)/5)*5))+'" aria-label="Hourly rate for '+esc(s)+'"></div>'}).join("");
  var av='<table class="availgrid"><thead><tr><th></th>'+SLOTS.map(function(s){return '<th>'+s+'</th>'}).join("")+'</tr></thead><tbody>'+DAYS.map(function(d){return '<tr><th scope="row">'+d+'</th>'+SLOTS.map(function(s){return '<td><input type="checkbox" name="av" value="'+d+'|'+s+'"'+((p.avail[d]||[]).indexOf(s)>=0?' checked':'')+' aria-label="'+d+' '+s+'"></td>'}).join("")+'</tr>'}).join("")+'</tbody></table>';
  var inner='<h1>'+(existing?'My profile':'Create your profile')+'</h1><p class="lede">'+(existing?'Keep it current so musicians know what you offer.':'This is what musicians see when they search. Open to students and professional accompanists.')+'</p>'+
   (existing?'<div class="box" style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:8px"><b>Profile strength</b><span>'+pct+'%</span></div><div class="bar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div><p style="margin-top:12px"><a href="'+pianistUrl(p.id)+'">View public profile</a>'+(p.suspended?' · <b style="color:var(--err)">Suspended by Accord</b>':'')+'</p></div>':'')+
   '<form class="box form" data-form="profile" novalidate>'+
    '<div class="fsec"><h3>Photo and basics</h3><div class="photo-up"><div id="photoPrev">'+avatar(Object.assign({},p,{id:p.id||"new",photo:PHOTO}),"xl")+'</div><div><label class="btn small" for="photo" style="cursor:pointer">Upload headshot</label><input id="photo" type="file" accept="image/*" style="position:absolute;opacity:0;width:1px;height:1px"> <button class="linkbtn" type="button" data-action="photo-clear">Remove</button><div class="hint">A clear, professional headshot. It is resized to fit.</div></div></div>'+
    '<div class="two" style="margin-top:14px"><div class="field"><label for="pn">Display name</label><input id="pn" name="pn" maxlength="40" value="'+esc(p.name)+'"></div><div class="field"><label for="pl">Experience level</label><select id="pl" name="pl">'+opts(LEVELS,p.level)+'</select></div></div>'+
    '<div class="two" style="margin-top:12px"><div class="field"><label for="py">Years of experience</label><input id="py" name="py" type="number" min="0" max="70" value="'+p.exp+'"></div><div></div></div></div>'+
    '<div class="fsec"><h3>Location and service area</h3><div class="two"><div class="field"><label for="pc">Base city</label><select id="pc" name="pc">'+opts(PLACES.map(function(x){return x.city}),p.city,"Choose a city")+'</select></div><div class="field"><label for="pz">ZIP code <small style="display:inline">(optional)</small></label><input id="pz" name="pz" maxlength="5" inputmode="numeric" value="'+esc(p.zip||"")+'"></div></div>'+
    '<div class="checks" style="margin-top:12px"><label><input type="checkbox" name="studio"'+(p.studio?' checked':'')+'> I teach at a studio or home</label></div>'+
    '<div class="two" style="margin-top:12px"><div class="field"><label for="pr">I will travel up to (miles)</label><input id="pr" name="pr" type="number" min="0" max="100" value="'+p.travelRadius+'"><small>Enter 0 if you do not travel.</small></div><div class="field"><label for="pt">Travel fee ($)</label><input id="pt" name="pt" type="number" min="0" max="200" value="'+p.travelFee+'"></div></div></div>'+
    '<div class="fsec"><h3>Services and rates</h3><p class="hint" style="margin-bottom:10px">Select the services you offer and set your hourly rate for each.</p>'+svc+'</div>'+
    '<div class="fsec"><h3>What you accompany</h3><div class="field"><span class="lab">Instruments and voice types</span><div class="checks">'+checks("pi",INSTRUMENTS,p.inst)+'</div></div>'+
    '<div class="field" style="margin-top:12px"><span class="lab">Musical specialties</span><div class="checks">'+checks("ps",SPECIALTIES,p.specialties)+'</div></div>'+
    '<div class="field" style="margin-top:12px"><span class="lab">Good for</span><div class="checks">'+checks("pp",PURPOSES,p.purposes)+'</div></div>'+
    '<div class="field" style="margin-top:12px"><span class="lab">Languages</span><div class="checks">'+checks("pg",LANGUAGES,p.languages)+'</div></div></div>'+
    '<div class="fsec"><h3>About you</h3><div class="field"><label for="pe">Education</label><input id="pe" name="pe" maxlength="160" value="'+esc(p.education)+'" placeholder="Degrees and institutions"></div>'+
    '<div class="field" style="margin-top:12px"><label for="pb">Biography</label><textarea id="pb" name="pb" rows="4" maxlength="500" placeholder="Your musical background and specialties">'+esc(p.bio)+'</textarea></div>'+
    '<div class="field" style="margin-top:12px"><label for="prp">Repertoire you already know <small style="display:inline">(one work per line)</small></label><textarea id="prp" name="prp" rows="5" placeholder="Brahms Cello Sonata No. 1&#10;Schubert Erlkönig">'+esc(p.rep.join("\n"))+'</textarea><small>Musicians search for these by composer and piece.</small></div>'+
    '<div class="field" style="margin-top:12px"><label for="pv">Performance videos <small style="display:inline">(one per line: Title | link)</small></label><textarea id="pv" name="pv" rows="3" placeholder="Brahms Sonata, recital 2025 | https://www.youtube.com/watch?v=…">'+esc((p.videos||[]).map(function(v){return v.title+" | "+v.url}).join("\n"))+'</textarea></div></div>'+
    '<div class="fsec"><h3>Weekly availability</h3><p class="hint" style="margin-bottom:8px">Morning is before noon, afternoon is noon to 5 pm, evening is after 5 pm.</p>'+av+'</div>'+
    '<div class="checks"><label><input type="checkbox" name="phid"'+(p.hidden?' checked':'')+'> Hide my profile from search</label></div>'+
    '<p class="err" data-err role="alert" hidden></p><div><button class="btn primary lg" type="submit">'+(existing?'Save changes':'Publish profile')+'</button></div></form>';
  return {title:"My profile – Accord",html:dashShell("profile",inner)};
}
document.addEventListener("change",function(e){
  if(e.target.id!=="photo"||!e.target.files[0])return;
  var fr=new FileReader();
  fr.onload=function(){
    var img=new Image();
    img.onload=function(){
      var s=Math.min(img.width,img.height),c=document.createElement("canvas");c.width=c.height=320;
      c.getContext("2d").drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,320,320);
      PHOTO=c.toDataURL("image/jpeg",0.82);$("#photoPrev").innerHTML=avatar({id:"new",name:"?",photo:PHOTO},"xl");
    };img.src=fr.result;
  };fr.readAsDataURL(e.target.files[0]);
});
ACTIONS["photo-clear"]=function(){PHOTO="";var n=$("#pn").value||"?";$("#photoPrev").innerHTML=avatar({id:"new",name:n,photo:""},"xl")};
FORMS.profile=function(f){
  var u=me(),g=function(n){return f.elements[n].value.trim()},lines=function(n){return g(n).split("\n").map(function(x){return x.trim()}).filter(Boolean)};
  var name=g("pn"),city=g("pc"),zip=g("pz"),bio=g("pb");
  var services={},bad=false;
  vals(f,"svc").forEach(function(s){var rate=+f.elements["rate-"+SERVICES.indexOf(s)].value;if(!(rate>=20&&rate<=500))bad=true;services[s]=rate});
  var inst=vals(f,"pi"),spec=vals(f,"ps"),purp=vals(f,"pp"),langs=vals(f,"pg"),rep=lines("prp").slice(0,30),studio=f.elements.studio.checked,radius=+g("pr")||0,fee=+g("pt")||0;
  if(!name)return fail(f,"Enter the name musicians will see.");
  if(!city)return fail(f,"Choose your base city.");
  if(zip&&!/^\d{5}$/.test(zip))return fail(f,"Enter a 5-digit ZIP code, or leave it blank.");
  if(!Object.keys(services).length)return fail(f,"Select at least one service you offer.");
  if(bad)return fail(f,"Enter an hourly rate between $20 and $500 for each service you offer.");
  if(!studio&&radius<=0)return fail(f,"Choose a studio option, or enter how far you will travel.");
  if(!inst.length)return fail(f,"Choose at least one instrument or voice type.");
  if(!spec.length)return fail(f,"Choose at least one musical specialty.");
  if(!purp.length)return fail(f,"Choose at least one purpose you are good for.");
  if(!langs.length)return fail(f,"Choose at least one language.");
  if(!rep.length)return fail(f,"Add at least one work you already know, so musicians can find you by repertoire.");
  if(bio.length<40)return fail(f,"Write a short biography of at least 40 characters.");
  var videos=[];
  var vl=lines("pv");for(var i=0;i<vl.length;i++){var parts=vl[i].split("|");var url=(parts[parts.length-1]||"").trim(),title=parts.length>1?parts.slice(0,-1).join("|").trim():"Performance video";if(!/^https?:\/\/\S+$/i.test(url))return fail(f,"Video line "+(i+1)+" needs a link starting with https://");videos.push({title:title||"Performance video",url:url})}
  var avail={};vals(f,"av").forEach(function(v){var a=v.split("|");(avail[a[0]]=avail[a[0]]||[]).push(a[1])});
  var pl=placeOf(city),p=myProfile(),isNew=!p;
  if(isNew){p={id:uid("p"),ownerId:u.id,created:Date.now()};DB.custom.push(p)}
  Object.assign(p,{name:name,city:city,zip:zip,lat:pl.lat,lng:pl.lng,level:g("pl"),exp:+g("py")||0,specialties:spec,inst:inst,purposes:purp,services:services,travelFee:fee,travelRadius:radius,studio:studio,languages:langs,education:g("pe"),bio:bio,rep:rep,avail:avail,videos:videos,photo:PHOTO,hidden:f.elements.phid.checked});
  if(u.role!=="pianist"){u.role="pianist";persist("users")}
  persist("custom");
  try{}catch(e){}
  toast(isNew?"Your profile is live":"Profile saved");
  if(isNew)setTimeout(function(){go(pianistUrl(p.id))},400);else rerender();
};
mount(viewMyProfile,"");
