/* Page: reviews.html – reviews received and reviews to write. */
function viewReviews(){
  var g=guard();if(g)return g;
  var u=me(),mp=myProfile(),inner='<h1>Reviews</h1><p class="lede">Feedback builds trust on both sides.</p>';
  if(mp){
    var s=stats(mp),rv=DB.revs.filter(function(r){return r.pid===mp.id});
    inner+='<h2 style="font-size:24px;font-weight:600;margin-bottom:12px">Reviews you received</h2>';
    if(s.cats)inner+='<div class="box" style="margin-bottom:14px"><div style="margin-bottom:8px"><b style="font-family:var(--serif);font-size:28px">'+s.rating.toFixed(1)+' ★</b> <span class="meta">from '+s.reviews+' review'+(s.reviews===1?'':'s')+'</span></div>'+CATS.map(function(c){return '<div class="catbar"><span>'+c[1]+'</span><div class="bar"><i style="width:'+(s.cats[c[0]]/5*100)+'%"></i></div><b>'+s.cats[c[0]].toFixed(1)+'</b></div>'}).join("")+'</div>';
    inner+=rv.length?rv.map(function(r){return '<blockquote>'+esc(r.text)+'<cite>'+esc(r.name)+' · ★ '+r.scores.overall+' · '+when(r.ts)+(r.hidden?' · hidden by moderator':'')+'</cite></blockquote>'}).join(""):'<p class="note">No reviews yet. They appear after a musician completes a booking with you.</p>';
  }
  var mine=myBookings().filter(function(b){return roleIn(b)==="musician"&&b.status==="completed"&&getP(b.pid)&&!getP(b.pid).sample});
  var pending=mine.filter(function(b){return !b.reviewed}),done=DB.revs.filter(function(r){return mine.some(function(b){return b.id===r.bid})});
  inner+='<h2 style="font-size:24px;font-weight:600;margin:28px 0 12px">Reviews you can write</h2>'+
    (pending.length?'<div class="rows">'+pending.map(function(b){return '<a class="row-item" href="'+bookingUrl(b.id)+'"><div class="grow"><b>'+esc(b.pname)+'</b><div class="meta">'+esc(b.service)+' · '+esc(fmtShort(b.date))+'</div></div><span class="btn small primary">Write review</span></a>'}).join("")+'</div>':'<p class="note">Nothing waiting. After a completed booking, you can review the accompanist here.</p>');
  if(done.length)inner+='<h2 style="font-size:24px;font-weight:600;margin:28px 0 12px">Reviews you wrote</h2>'+done.map(function(r){var p=getP(r.pid);return '<blockquote>'+esc(r.text)+'<cite>'+esc(p?p.name:"")+' · ★ '+r.scores.overall+' · '+when(r.ts)+'</cite></blockquote>'}).join("");
  return {title:"Reviews – Accord",html:dashShell("reviews",inner)};
}
mount(viewReviews,"");
