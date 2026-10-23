/* Accompanist dashboard. Booking data currently follows the site's existing browser-storage implementation. */
function viewAccompanistDashboard(){
  var g=guard();if(g)return g;
  var u=me(),mp=myProfile();
  if(u.role!=="pianist"&&!mp&&u.role!=="both")return {redirect:"musician-dashboard.html"};
  var bs=myBookings().filter(function(b){return roleIn(b)==="pianist";});
  var t=today();
  var pending=bs.filter(function(b){return b.status==="requested";});
  var upcoming=bs.filter(function(b){return b.status==="confirmed"&&b.date>=t;});
  var recent=bs.slice(0,4).map(bookingRow).join("");
  var listing=mp?(mp.suspended?"Suspended":mp.hidden?"Hidden":"Available"):"Not created";
  var inner='<div class="page-head"><h1>Welcome, '+esc((u.first_name||u.name||"there").split(" ")[0])+'</h1><p>Manage your accompanist profile and respond to musicians looking to work with you.</p></div>'+
    '<div class="dash-quicklinks"><a class="btn primary" href="my-profile.html">'+(mp?'Manage my profile':'Create my profile')+'</a><a class="btn" href="bookings.html">View booking requests</a></div>'+
    '<div class="stats"><div class="stat"><b>'+pending.length+'</b><span>requests awaiting your reply</span></div><div class="stat"><b>'+upcoming.length+'</b><span>upcoming sessions</span></div><div class="stat"><b>'+esc(listing)+'</b><span>profile status</span></div></div>'+
    (!mp?'<div class="banner"><b>Get started:</b> create your accompanist profile so musicians can discover you. <a href="my-profile.html">Create profile</a></div>':'')+
    '<div class="dashboard-grid"><section><div class="sec-head" style="margin-bottom:14px"><h2 style="font-size:24px">Recent booking activity</h2><a href="bookings.html">View all</a></div>'+
    (recent?'<div class="rows">'+recent+'</div>':'<div class="empty" style="grid-column:auto"><h3>No booking requests yet</h3><p>When a musician requests a session with you, it will appear here.</p></div>')+
    '</section><aside class="box"><h2 style="font-size:22px;margin-bottom:10px">Your accompanist tools</h2><div class="dashboard-linklist"><a href="my-profile.html"><span>Public profile</span><span aria-hidden="true">→</span></a><a href="bookings.html?f=action"><span>Requests needing attention</span><span aria-hidden="true">→</span></a><a href="reviews.html"><span>Reviews</span><span aria-hidden="true">→</span></a><a href="settings.html"><span>Account settings</span><span aria-hidden="true">→</span></a></div></aside></div>'+
    (u.role==="both"?'<div class="banner" style="margin-top:20px">You can also use Accord to find an accompanist for yourself. <a href="musician-dashboard.html">Switch to musician dashboard</a>.</div>':'');
  return {title:"Accompanist Dashboard – Accord",html:dashShell("",inner)};
}
mount(viewAccompanistDashboard,"");
