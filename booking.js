/* Page: booking.html?id=… – one booking: details, responses, payment status, review. */
function viewBooking(c){
  var g=guard();if(g)return g;
  var u=me(),b=getB(c.params.get("id")||""),r=b?roleIn(b):"";
  if(!b||(!r&&!isAdmin()))return {title:"Not found – Accord",html:dashShell("bookings",'<div class="empty" style="grid-column:auto"><h3>Booking not found</h3><p>It may have been deleted, or it belongs to another account.</p><a class="btn primary" href="bookings.html">Back to bookings</a></div>')};
  var p=getP(b.pid),isP=r==="pianist",isM=r==="musician",st=b.status,sample=p&&p.sample;
  var actions="";
  if(isP&&st==="requested")actions+='<div class="actions"><button class="btn primary" type="button" data-action="accept" data-id="'+b.id+'">Accept request</button></div>'+
    '<div class="sub-actions"><details class="inline"><summary>Propose another time</summary><form class="form" data-form="propose" data-id="'+b.id+'" novalidate><div class="two"><div class="field"><label for="pd">Date</label><input id="pd" name="pd" type="date" min="'+today()+'" value="'+esc(b.date)+'"></div><div class="field"><label for="ps">Start time</label><select id="ps" name="ps">'+opts(TIMES.map(function(t){return [t,fmtTime(t)]}),b.start)+'</select></div></div><div class="field"><label for="pm">Message</label><textarea id="pm" name="pm" rows="2" maxlength="300" placeholder="Why this time works better"></textarea></div><p class="err" data-err role="alert" hidden></p><div><button class="btn small primary" type="submit">Send proposal</button></div></form></details>'+
    '<details class="inline"><summary>Decline request</summary><form class="form" data-form="decline" data-id="'+b.id+'" novalidate><div class="field"><label for="dm">Message to the musician <small style="display:inline">(optional)</small></label><textarea id="dm" name="dm" rows="2" maxlength="300" placeholder="e.g. I am unavailable that week"></textarea></div><div><button class="btn small" type="submit">Decline</button></div></form></details></div>';
  if(isM&&st==="proposed"&&b.proposal)actions+='<div class="banner"><b>'+esc(b.pname)+' proposed '+esc(fmtDay(b.proposal.date))+' at '+esc(fmtTime(b.proposal.start))+'.</b>'+(b.proposal.message?'<br>“'+esc(b.proposal.message)+'”':'')+'</div><div class="actions"><button class="btn primary" type="button" data-action="accept-proposal" data-id="'+b.id+'">Accept new time</button><button class="btn quiet" type="button" data-action="decline-proposal" data-id="'+b.id+'">Decline proposal</button></div>';
  if(isP&&st==="proposed")actions+='<p class="note" style="margin:12px 0">Waiting for the musician to accept your proposed time.</p>';
  if(st==="confirmed")actions+='<div class="actions"><button class="btn primary" type="button" data-action="complete" data-id="'+b.id+'">Mark session as completed</button></div>';
  if(isP&&(st==="confirmed"||st==="completed")&&b.pay!=="paid")actions+='<div class="actions"><button class="btn" type="button" data-action="paid" data-id="'+b.id+'">Mark payment received</button></div>';
  if(["requested","proposed","confirmed"].indexOf(st)>=0&&r)actions+='<div class="actions"><button class="btn quiet" type="button" data-action="cancel" data-id="'+b.id+'">Cancel booking</button></div>';
  var review="";
  if(isM&&st==="completed"&&p&&!sample){
    review=b.reviewed?'<div class="banner good">Thanks, you reviewed this accompanist.</div>':
     '<form class="box form" data-form="review" data-id="'+b.id+'" style="margin-top:20px" novalidate><h3 style="font-size:22px">Review '+esc(b.pname)+'</h3>'+
     CATS.map(function(ct){return '<div class="field"><label for="v-'+ct[0]+'">'+ct[1]+'</label><select id="v-'+ct[0]+'" name="v-'+ct[0]+'">'+opts([[5,"5 – Excellent"],[4,"4 – Good"],[3,"3 – Okay"],[2,"2 – Poor"],[1,"1 – Bad"]],5)+'</select></div>'}).join("")+
     '<div class="field"><label for="vt">Your review</label><textarea id="vt" name="vt" rows="3" maxlength="500" placeholder="What was it like to play with them?"></textarea></div><p class="err" data-err role="alert" hidden></p><button class="btn primary" type="submit">Post review</button></form>';
  }
  var money_=isP?'<dt>Platform commission ('+Math.round(COMMISSION*100)+'%)</dt><dd>− '+money(b.commission)+'</dd><dt>Your share</dt><dd><b>'+money(b.total-b.commission)+'</b></dd>':'';
  var other="";
  if(st==="confirmed"||st==="completed"){
    var om=isP?{n:b.fromName,e:b.fromEmail}:(function(){var o=b.ownerId?userById(b.ownerId):null;return o?{n:b.pname,e:o.email}:null})();
    other=om?'<div class="banner good"><b>Contact details shared:</b> '+esc(om.n)+', <a href="mailto:'+esc(om.e)+'">'+esc(om.e)+'</a></div>':'';
  }
  var inner=(c.params.get("sent")?'<div class="banner good"><b>Request sent.</b> '+(sample?'This is a sample accompanist, so nobody will reply.':'You will be notified when '+esc(b.pname.split(" ")[0])+' responds.')+'</div>':'')+
   '<a class="crumbs" href="bookings.html">← All bookings</a><h1>'+(isP?'Request from '+esc(b.fromName):'Booking with '+esc(b.pname))+'</h1>'+
   '<p class="lede">'+statusChip(st)+' &nbsp; Sent '+when(b.ts)+(p&&!isP?' · <a href="'+pianistUrl(p.id)+'">View profile</a>':'')+'</p>'+
   (st==="demo"?'<div class="banner">This request went to a sample accompanist, so there will be no reply. Create an accompanist account in another tab to try the full flow.</div>':'')+
   other+
   '<div class="box"><dl class="sum" style="margin:0"><dt>Service</dt><dd>'+esc(b.service)+'</dd><dt>When</dt><dd>'+esc(fmtDay(b.date))+' at '+esc(fmtTime(b.start))+'</dd><dt>Length</dt><dd>'+b.duration+' hour'+(b.duration===1?'':'s')+'</dd>'+
   '<dt>Instrument</dt><dd>'+esc(b.inst)+'</dd><dt>Repertoire</dt><dd>'+esc(b.repertoire)+'</dd>'+(b.perfDate?'<dt>Performance date</dt><dd>'+esc(fmtDay(b.perfDate))+'</dd>':'')+
   '<dt>Location</dt><dd>'+(b.locType==="travel"?'At the musician’s location: '+esc(b.address):'At the accompanist’s studio')+'</dd>'+(b.notes?'<dt>Notes</dt><dd>'+esc(b.notes)+'</dd>':'')+
   '<dt>Rate</dt><dd>'+money(b.rate)+' × '+b.duration+' h = '+money(b.subtotal)+'</dd>'+(b.travelFee?'<dt>Travel fee</dt><dd>'+money(b.travelFee)+'</dd>':'')+
   '<dt>Total</dt><dd><b>'+money(b.total)+'</b></dd>'+money_+'<dt>Payment</dt><dd>'+(b.pay==="paid"?'Paid (arranged directly)':'Not yet paid. Arranged directly between you.')+'</dd></dl></div>'+
   actions+review+
   '<h2 style="font-size:22px;font-weight:600;margin:28px 0 12px">History</h2><ul class="timeline">'+b.history.slice().reverse().map(function(h){return '<li>'+esc(h.text)+'<small>'+when(h.ts)+'</small></li>'}).join("")+'</ul>';
  return {title:"Booking – Accord",html:dashShell("bookings",inner)};
}
function B(b){return getB(b.dataset?b.dataset.id:b)}
function after(msg){persist("bookings");renderHeader();if(msg)toast(msg);rerender()}
ACTIONS.accept=function(el){
  var b=B(el);b.status="confirmed";addHistory(b,b.pname+" accepted the request");
  notifyOther(b,"pianist","Booking confirmed with "+b.pname,"Good news: "+b.pname+" accepted your request.\n\n"+bookingSummary(b)+"\n\nPayment is arranged directly with the accompanist.");after("Booking confirmed");
};
FORMS.decline=function(f){
  var b=B(f.dataset.id),m=f.elements.dm.value.trim();b.status="declined";b.response=m;addHistory(b,b.pname+" declined the request"+(m?": “"+m+"”":""));
  notifyOther(b,"pianist",b.pname+" is unable to take your request","Unfortunately "+b.pname+" cannot take this booking."+(m?"\n\nMessage: "+m:"")+"\n\nYou can search for another accompanist.");after("Request declined");
};
FORMS.propose=function(f){
  var b=B(f.dataset.id),d=f.elements.pd.value,s=f.elements.ps.value,m=f.elements.pm.value.trim();
  if(!d||d<today())return fail(f,"Pick a date that is today or later.");
  b.proposal={date:d,start:s,message:m};b.status="proposed";addHistory(b,b.pname+" proposed "+fmtShort(d)+" at "+fmtTime(s));
  notifyOther(b,"pianist",b.pname+" proposed another time","They proposed "+fmtDay(d)+" at "+fmtTime(s)+"."+(m?"\n\nMessage: "+m:"")+"\n\nOpen the booking to accept or decline.");after("Proposal sent");
};
ACTIONS["accept-proposal"]=function(el){
  var b=B(el);b.date=b.proposal.date;b.start=b.proposal.start;b.status="confirmed";addHistory(b,"Musician accepted the new time: "+fmtShort(b.date)+" at "+fmtTime(b.start));
  notifyOther(b,"musician","New time accepted","The booking is confirmed for "+fmtDay(b.date)+" at "+fmtTime(b.start)+".\n\n"+bookingSummary(b));after("Booking confirmed");
};
ACTIONS["decline-proposal"]=function(el){
  var b=B(el);b.status="cancelled";addHistory(b,"Musician declined the proposed time");
  notifyOther(b,"musician","Proposed time declined","The musician declined the proposed time, so the booking was cancelled.");after("Booking cancelled");
};
ACTIONS.cancel=function(el){
  if(!armed(el,"Click again to cancel"))return;
  var b=B(el),r=roleIn(b);b.status="cancelled";addHistory(b,(r==="pianist"?b.pname:b.fromName)+" cancelled the booking");
  notifyOther(b,r,"Booking cancelled",(r==="pianist"?b.pname:b.fromName)+" cancelled this booking.\n\n"+bookingSummary(b));after("Booking cancelled");
};
ACTIONS.complete=function(el){
  var b=B(el),r=roleIn(b);b.status="completed";addHistory(b,"Session marked as completed by "+(r==="pianist"?b.pname:b.fromName));
  notifyOther(b,r,"Session completed","This session is marked as completed."+(r==="pianist"?"\n\nPlease leave a review for "+b.pname+".":""));after("Marked as completed");
};
ACTIONS.paid=function(el){
  var b=B(el);b.pay="paid";addHistory(b,"Payment of "+money(b.total)+" marked as received");
  notifyOther(b,"pianist","Payment recorded","Payment of "+money(b.total)+" for your session with "+b.pname+" was marked as received.");after("Payment recorded");
};
FORMS.review=function(f){
  var b=B(f.dataset.id),u=me(),text=f.elements.vt.value.trim();
  if(text.length<10)return fail(f,"Write at least a sentence so other musicians learn something.");
  var scores={};CATS.forEach(function(ct){scores[ct[0]]=+f.elements["v-"+ct[0]].value});
  var parts=u.name.split(" ");
  DB.revs.push({id:uid("v"),pid:b.pid,bid:b.id,name:parts[0]+(parts[1]?" "+parts[1][0]+".":""),scores:scores,text:text,ts:Date.now(),hidden:false});
  b.reviewed=true;addHistory(b,"Musician left a review");persist("revs");
  notifyOther(b,"musician","You received a new review",u.name.split(" ")[0]+" rated you "+scores.overall+" out of 5.");after("Thanks for your review");
};
mount(viewBooking,"");
