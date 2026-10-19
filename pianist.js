/* Page: pianist.html?id=… – full accompanist profile and booking entry points. */
function calendarHTML(p){
  var out="",t=new Date();
  for(var i=1;i<=14;i++){
    var d=new Date(t.getFullYear(),t.getMonth(),t.getDate()+i),k=iso(d),s=slotsFor(p,k);
    var slots=SLOTS.map(function(n){
      var cls=s.open.indexOf(n)>=0?"open":s.booked.indexOf(n)>=0?"booked":"none";
      return '<span class="slot '+cls+'">'+n.slice(0,3)+'</span>';
    }).join("");
    var label=d.toLocaleDateString(undefined,{weekday:"short"});
    var inner=label+'<b>'+d.getDate()+'</b>'+slots;
    out+=s.open.length?'<a class="calday" href="book.html?pianist='+encodeURIComponent(p.id)+'&date='+k+'" aria-label="'+esc(fmtShort(k))+', open: '+s.open.join(", ")+'">'+inner+'</a>':'<div class="calday" aria-label="'+esc(fmtShort(k))+', not available">'+inner+'</div>';
  }
  return '<div class="cal">'+out+'</div>';
}
function videoIcon(u){return /youtu/.test(u)?"▶":/vimeo/.test(u)?"▶":"🎬"}
function viewProfile(c){
  var id=c.params.get("id")||"";
  if(needsProfileCheck(id)){var shell=profileLoadingShell("Accompanist – Accord");shell.after=function(){checkProfile(id)};return shell}
  var p=getP(id),u=me();
  if(!p||((p.hidden||p.suspended)&&!(u&&p.ownerId===u.id)&&!(u&&u.role==="admin")))return {title:"Not found – Accord",html:notFound("This accompanist profile is not available.")};
  var s=stats(p),own=u&&p.ownerId===u.id;
  var reviews=revsFor(p).map(function(r){return '<blockquote>'+esc(r.text)+'<cite>'+esc(r.name)+' · ★ '+r.scores.overall+' · '+when(r.ts)+'</cite></blockquote>'}).join("");
  var q=p.quote?'<blockquote>'+esc(p.quote)+'<cite>'+esc(p.by)+'</cite></blockquote>':"";
  var cats=s.cats?CATS.map(function(c){return '<div class="catbar"><span>'+c[1]+'</span><div class="bar"><i style="width:'+(s.cats[c[0]]/5*100)+'%"></i></div><b>'+s.cats[c[0]].toFixed(1)+'</b></div>'}).join(""):"";
  var svcs=Object.keys(p.services).map(function(k){return '<div class="row-item" style="padding:12px 16px"><div class="grow">'+esc(k)+'</div><b>'+money(p.services[k])+' <span class="meta" style="font-weight:400">/ hour</span></b></div>'}).join("");
  var videos=(p.videos&&p.videos.length)?p.videos.map(function(v){return '<a class="vid" href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">'+videoIcon(v.url)+'</span><div><b>'+esc(v.title)+'</b><div class="meta">Opens in a new tab</div></div></a>'}).join(""):'<p class="note">This accompanist has not added performance videos yet.</p>';
  var area=(p.studio?'Studio sessions in '+esc(p.city)+'. ':'')+(p.travelRadius?'Travels up to '+p.travelRadius+' miles'+(p.travelFee?' (travel fee '+money(p.travelFee)+')':' (no travel fee)')+'.':'');
  var html='<div class="wrap page"><a class="crumbs" href="find.html">← All accompanists</a>'+
   (p.suspended?'<div class="banner warn">This profile is suspended and hidden from search.</div>':'')+
   (p.hidden&&!p.suspended?'<div class="banner">Your profile is hidden from search. Only you can see this page. <a href="my-profile.html">Show it in search</a></div>':'')+
   '<div class="playout"><div>'+
    '<div class="phead">'+avatar(p,"xl")+'<div><h1>'+esc(p.name)+'</h1><div class="meta" style="font-size:16px">'+esc(p.level)+' · '+esc(p.city)+', CA</div><div class="meta" style="font-size:16px">'+ratingHTML(p)+' · '+completedCount(p)+' completed bookings</div></div>'+
    '<div class="phead-tools"><button class="icon-btn" type="button" data-action="save" data-id="'+esc(p.id)+'" aria-pressed="'+(!!DB.saved[p.id])+'" aria-label="Save to shortlist" title="Save to shortlist">'+(DB.saved[p.id]?"♥":"♡")+'</button></div></div>'+
    '<div class="facts"><div class="fact"><b>'+money(minRate(p))+'</b><span>from, per hour</span></div><div class="fact"><b>'+(s.reviews?s.rating.toFixed(1)+' ★':'New')+'</b><span>'+(s.reviews?s.reviews+' reviews':'no reviews yet')+'</span></div><div class="fact"><b>'+p.exp+' years</b><span>experience</span></div><div class="fact"><b>'+p.languages.length+'</b><span>'+esc(p.languages.join(", "))+'</span></div></div>'+
    '<div class="pblock"><h2>About</h2><p>'+esc(p.bio)+'</p>'+
    '<h2>Education</h2><p>'+esc(p.education||"Not listed")+'</p>'+
    '<h2>Services and rates</h2><div class="rows">'+svcs+'</div>'+
    '<h2>Location and service area</h2><p>'+esc(p.city)+', California. '+area+'</p>'+
    '<h2>Instruments and voice types</h2><div class="tags">'+p.inst.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+'</div>'+
    '<h2>Specialties</h2><div class="tags">'+p.specialties.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+'</div>'+
    '<h2>Good for</h2><div class="tags">'+p.purposes.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join("")+'</div>'+
    '<h2>Repertoire experience</h2><ul class="rep">'+p.rep.map(function(r){return '<li>'+esc(r)+'</li>'}).join("")+'</ul>'+
    '<h2>Performance videos</h2>'+videos+
    '<h2>Availability, next 14 days</h2><p class="note" style="margin-bottom:10px">Mor, Aft and Eve show typical open times. Select a day to start a request. The accompanist confirms every booking.</p>'+calendarHTML(p)+
    '<h2>Reviews</h2>'+(cats?'<div class="box" style="margin-bottom:14px">'+cats+'</div>':'')+((q||reviews)?(reviews+q):'<p class="note">No reviews yet. Reviews appear after a musician completes a booking with this accompanist.</p>')+
    '<h2>Report a concern</h2><details class="inline"><summary>Report this profile</summary><form class="form" data-form="report" data-id="'+esc(p.id)+'" novalidate>'+
      '<div class="field"><label for="rr">Reason</label><select id="rr" name="rr">'+opts(REPORT_REASONS,"")+'</select></div>'+
      '<div class="field"><label for="rd">Details</label><textarea id="rd" name="rd" rows="3" maxlength="500" placeholder="Tell us what happened"></textarea></div>'+
      '<p class="err" data-err role="alert" hidden></p><div><button class="btn small" type="submit">Send report</button></div></form></details>'+
    '</div></div>'+
   '<aside class="panel" aria-label="Request a booking">'+
     (own?'<h2>This is your profile</h2><p class="note" style="margin:6px 0 16px">Musicians see a booking button here.</p><a class="btn primary block" href="my-profile.html">Edit your profile</a><a class="btn block" style="margin-top:10px" href="bookings.html">See your bookings</a>':
     '<div class="price">'+money(minRate(p))+' <small>per hour, from</small></div><div class="meta" style="margin:2px 0 14px">'+esc(p.level)+' · '+esc(p.city)+'</div>'+
     '<a class="btn primary block lg" href="book.html?pianist='+encodeURIComponent(p.id)+'">Request a booking</a>'+
     '<p class="note" style="margin-top:12px">'+'The accompanist will accept, decline, or propose another time. You will not be charged by Accord when you send a request.'+'</p>')+
   '</aside></div></div>'+
   (own?'':'<div class="mobile-cta"><a class="btn primary" href="book.html?pianist='+encodeURIComponent(p.id)+'">Request a booking</a></div>');
  return {title:p.name+" – Accord",html:html,after:function(){if(!own)document.body.classList.add("has-cta")}};
}
FORMS.report=function(f){
  var p=getP(f.dataset.id),u=me(),d=f.elements.rd.value.trim();
  if(d.length<10)return fail(f,"Add a few details so we can look into it.");
  DB.reports.unshift({id:uid("rp"),pid:p.id,pname:p.name,fromId:u?u.id:null,fromEmail:u?u.email:"",reason:f.elements.rr.value,details:d,ts:Date.now(),status:"open"});
  persist("reports");f.closest("details").innerHTML='<div class="banner good">Thank you. Your report was sent to the Accord team.</div>';
};
mount(viewProfile,"find");
