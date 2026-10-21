/* Page: book.html?pianist=ID – booking request form (login required). */
function viewBook(c){
  var g=guard();if(g)return g;
  var p=getP(c.params.get("pianist")||""),u=me();
  if(!p||!visible(p))return {title:"Not found – Accord",html:notFound("This accompanist is not available for booking.")};
  if(p.ownerId===u.id)return {title:"Booking – Accord",html:'<div class="wrap page"><div class="empty"><h3>This is your own profile</h3><p>You cannot book yourself.</p><a class="btn primary" href="my-profile.html">Edit your profile</a></div></div>'};
  var date=c.params.get("date")||"",svcNames=Object.keys(p.services);
  var svcs=svcNames.map(function(k,i){return '<label class="svc"><input type="radio" name="service" value="'+esc(k)+'"'+(i===0?' checked':'')+'><span><b>'+esc(k)+'</b></span><span><b>'+money(p.services[k])+'</b> <span class="meta">/ hour</span></span></label>'}).join("");
  var loc=(p.studio?'<label class="svc"><input type="radio" name="locType" value="studio" checked><span><b>At the accompanist’s studio</b><div class="meta">'+esc(p.city)+', CA</div></span><span class="meta">No travel fee</span></label>':'')+
          (p.travelRadius>0?'<label class="svc"><input type="radio" name="locType" value="travel"'+(p.studio?'':' checked')+'><span><b>At my location</b><div class="meta">Up to '+p.travelRadius+' miles from '+esc(p.city)+'</div></span><span class="meta">'+(p.travelFee?'+ '+money(p.travelFee):'No travel fee')+'</span></label>':'');
  var html='<div class="wrap page"><a class="crumbs" href="'+pianistUrl(p.id)+'">← Back to profile</a><div class="page-head"><h1>Request a booking</h1><p>with '+esc(p.name)+'. Nothing is charged when you send a request.</p></div>'+
  '<div class="book-layout"><form class="box form" id="bookForm" data-form="book" data-id="'+esc(p.id)+'" novalidate>'+
   '<div class="fsec"><h3>1. Choose a service</h3><div class="svcs" role="radiogroup" aria-label="Service">'+svcs+'</div></div>'+
   '<div class="fsec"><h3>2. When</h3><div class="two"><div class="field"><label for="bdate">Date</label><input id="bdate" name="date" type="date" min="'+today()+'" value="'+esc(date)+'"></div>'+
     '<div class="field"><label for="bstart">Start time</label><select id="bstart" name="start">'+opts(TIMES.map(function(t){return [t,fmtTime(t)]}),"16:00")+'</select></div></div>'+
     '<div class="two" style="margin-top:12px"><div class="field"><label for="bdur">Session length</label><select id="bdur" name="duration">'+opts(DURATIONS,1)+'</select></div>'+
     '<div class="field"><label for="bperf">Performance or audition date <small style="display:inline">(optional)</small></label><input id="bperf" name="perf" type="date" min="'+today()+'"></div></div><div class="hint" id="availHint"></div></div>'+
   '<div class="fsec"><h3>3. What you are playing</h3><div class="two"><div class="field"><label for="binst">Instrument or voice type</label><select id="binst" name="inst">'+opts(p.inst,"")+'</select></div><div></div></div>'+
     '<div class="field" style="margin-top:12px"><label for="brep">Repertoire</label><textarea id="brep" name="rep" rows="3" maxlength="400" placeholder="e.g. Brahms Cello Sonata No. 1, movements I and II"></textarea><small>Include composer, piece and movements. Unfamiliar pieces may need extra preparation time.</small></div></div>'+
   '<div class="fsec"><h3>4. Where</h3><div class="svcs" role="radiogroup" aria-label="Location">'+loc+'</div>'+
     '<div class="field" id="addrWrap" style="margin-top:12px" hidden><label for="baddr">Address or venue</label><input id="baddr" name="address" maxlength="120" placeholder="Street address, city"></div></div>'+
   '<div class="fsec"><h3>5. Anything else?</h3><div class="field"><label for="bnotes">Notes for the accompanist</label><textarea id="bnotes" name="notes" rows="3" maxlength="400" placeholder="Level, tempo preferences, how many rehearsals you need, how to reach the music"></textarea></div></div>'+
   '<p class="err" data-err role="alert" hidden></p><button class="btn primary lg" type="submit">Send booking request</button>'+
   '<p class="note">Your name and email ('+esc(u.name)+', '+esc(u.email)+') are shared with the accompanist only when the booking is confirmed.</p></form>'+
  '<aside class="panel" aria-label="Estimate"><div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">'+avatar(p,"sm")+'<div><b style="font-family:var(--serif);font-size:20px">'+esc(p.name)+'</b><div class="meta">'+esc(p.level)+'</div></div></div><div class="est" id="est" aria-live="polite"></div>'+
   '<p class="note" style="margin-top:12px"><b>Payment.</b> During our validation phase, you and the accompanist arrange payment directly after the booking is confirmed. Accord does not hold funds or offer payment protection yet. <a href="help.html#payments">Learn more</a></p></aside></div></div>';
  return {title:"Request a booking – Accord",html:html,after:function(){updateBook(p)}};
}
function updateBook(p){
  var f=$("#bookForm");if(!f)return;
  var svc=(f.querySelector('input[name="service"]:checked')||{}).value,lt=(f.querySelector('input[name="locType"]:checked')||{}).value,dur=+f.elements.duration.value;
  var e=estimate(p,svc,dur,lt);
  $("#est").innerHTML='<div><span>'+esc(svc)+' ('+money(e.rate)+' × '+dur+' h)</span><span>'+money(e.subtotal)+'</span></div>'+
    (lt==="travel"?'<div><span>Travel fee</span><span>'+money(e.travel)+'</span></div>':'')+
    '<div class="total"><span>Estimated total</span><span>'+money(e.total)+'</span></div><div class="sub">The accompanist can adjust the plan by proposing another time.</div>';
  $("#addrWrap").hidden=lt!=="travel";
  var d=f.elements.date.value,h=$("#availHint");
  if(!d){h.textContent="";h.className="hint"}
  else{
    var s=slotsFor(p,d),slot=slotOf(f.elements.start.value);
    if(s.open.indexOf(slot)>=0){h.textContent="✓ "+p.name.split(" ")[0]+" lists "+slot.toLowerCase()+" availability on this day.";h.className="hint good"}
    else{h.textContent="This time is not listed as open. You can still send the request, and they may propose another time.";h.className="hint warn"}
  }
}
document.addEventListener("input",function(e){var f=e.target.closest("#bookForm");if(f)updateBook(getP(f.dataset.id))});
document.addEventListener("change",function(e){var f=e.target.closest("#bookForm");if(f)updateBook(getP(f.dataset.id))});
FORMS.book=function(f){
  var p=getP(f.dataset.id),u=me(),g=function(n){return f.elements[n].value.trim()};
  var svc=(f.querySelector('input[name="service"]:checked')||{}).value,lt=(f.querySelector('input[name="locType"]:checked')||{}).value;
  var date=g("date"),rep=g("rep");
  if(!svc)return fail(f,"Choose a service.");
  if(!date)return fail(f,"Pick the date you would like.");
  if(date<today())return fail(f,"Choose a date that is today or later.");
  if(rep.length<3)return fail(f,"Tell the accompanist what you are playing.");
  if(!lt)return fail(f,"Choose where the session will take place.");
  if(lt==="travel"&&!g("address"))return fail(f,"Enter the address or venue where the accompanist should come.");
  var dur=+g("duration"),e=estimate(p,svc,dur,lt),now=Date.now();
  var b={id:uid("b"),pid:p.id,pname:p.name,ownerId:p.ownerId||null,fromId:u.id,fromName:u.name,fromEmail:u.email,service:svc,date:date,start:g("start"),duration:dur,
    inst:g("inst"),repertoire:rep,perfDate:g("perf"),locType:lt,address:lt==="travel"?g("address"):"",notes:g("notes"),
    rate:e.rate,subtotal:e.subtotal,travelFee:e.travel,total:e.total,commission:e.commission,status:p.sample?"demo":"requested",proposal:null,
    pay:"unpaid",reviewed:false,commissionCollected:false,ts:now,history:[{ts:now,text:"Request sent by "+u.name}]};
  DB.bookings.unshift(b);persist("bookings");
  notify(u.id,u.email,"Booking request sent to "+p.name,"Your request was sent.\n\n"+bookingSummary(b)+"\n\n"+(p.sample?"This is a sample accompanist, so nobody will reply.":"You will be notified when "+p.name.split(" ")[0]+" responds."),bookingUrl(b.id));
  if(!p.sample)notifyOther(b,"musician","New booking request from "+u.name,u.name+" would like to book you.\n\n"+bookingSummary(b)+(b.notes?"\n\nNotes: "+b.notes:"")+"\n\nOpen the request to accept, decline or propose another time.");
  else notifyOther(b,"musician","[Sample] New booking request from "+u.name,bookingSummary(b));
  go(bookingUrl(b.id)+"&sent=1");
};
mount(viewBook,"find");
