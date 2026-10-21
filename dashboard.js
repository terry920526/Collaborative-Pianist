/* Page: dashboard.html – account overview. */
function viewDash(){
  var g=guard();if(g)return g;
  var u=me(),mp=myProfile(),bs=myBookings(),pian=u.role==="pianist"||mp,t=today();
  var asP=bs.filter(function(b){return roleIn(b)==="pianist"}),asM=bs.filter(function(b){return roleIn(b)==="musician"});
  var s=pian?[[asP.filter(function(b){return b.status==="requested"}).length,"requests awaiting your reply"],[asP.filter(function(b){return b.status==="confirmed"&&b.date>=t}).length,"upcoming sessions"],[mp?(mp.suspended?"Suspended":mp.hidden?"Hidden":"Live"):"None","your listing"]]:
    [[asM.length,"booking requests sent"],[asM.filter(function(b){return b.status==="confirmed"&&b.date>=t}).length,"upcoming sessions"],[asM.filter(function(b){return b.status==="requested"||b.status==="proposed"}).length,"awaiting a response"]];
  var next="";
  if(u.role==="pianist"&&!mp)next+='<div class="banner"><b>Next step:</b> create your profile so musicians can find you. <a href="my-profile.html">Create profile</a></div>';
  var need=bs.filter(needsMe).length;
  if(need)next+='<div class="banner warn"><b>'+need+' booking'+(need===1?' needs':'s need')+' your attention.</b> <a href="bookings.html?f=action">Review now</a></div>';
  var recent=bs.slice(0,4).map(bookingRow).join("");
  var inner='<h1>Welcome, '+esc(u.name.split(" ")[0])+'</h1><p class="lede">'+(pian?"Manage your listing and respond to booking requests.":"Track your booking requests and find your next accompanist.")+'</p>'+next+
   '<div class="stats">'+s.map(function(x){return '<div class="stat"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join("")+'</div>'+
   '<h2 style="font-size:24px;font-weight:600;margin-bottom:12px">Recent bookings</h2>'+
   (recent?'<div class="rows">'+recent+'</div>':'<div class="empty" style="grid-column:auto"><h3>No bookings yet</h3><p>'+(pian?"When a musician requests you, it will show up here.":"Find an accompanist and send your first request.")+'</p>'+(pian?'':'<a class="btn primary" href="find.html">Find an accompanist</a>')+'</div>')+
   '<div class="banner" style="margin-top:24px"><b>Try the whole flow:</b> accounts live in this browser. Create an accompanist account, request a booking from a musician account, then switch back to accept it, record payment and leave a review. The “Try as…” buttons on the log-in page set up demo accounts. Notifications stand in for emails.</div>';
  return {title:"Dashboard – Accord",html:dashShell("",inner)};
}
mount(viewDash,"");
