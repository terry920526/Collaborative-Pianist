/* Page: bookings.html – My bookings. */
function viewBookings(c){
  var g=guard();if(g)return g;
  var f=c.params.get("f")||"all",all=myBookings(),t=today();
  var filt={all:function(){return true},action:needsMe,
    upcoming:function(b){return b.status==="confirmed"&&b.date>=t},
    pending:function(b){return b.status==="requested"||b.status==="proposed"},
    past:function(b){return ["completed","cancelled","declined","demo"].indexOf(b.status)>=0}};
  var list=all.filter(filt[f]||filt.all);
  var tabs=[["all","All"],["action","Needs action"],["pending","Pending"],["upcoming","Upcoming"],["past","Past"]];
  var inner='<h1>My bookings</h1><p class="lede">Requests you have sent and received.</p>'+
   '<div class="subtabs">'+tabs.map(function(x){var n=all.filter(filt[x[0]]).length;return '<a class="pill" href="bookings.html?f='+x[0]+'"'+(x[0]===f?' aria-current="page"':'')+'>'+x[1]+' ('+n+')</a>'}).join("")+'</div>'+
   (list.length?'<div class="rows">'+list.map(bookingRow).join("")+'</div>':'<div class="empty" style="grid-column:auto"><h3>No bookings here</h3><p>'+(f==="all"?"Find an accompanist and send your first request.":"Nothing matches this view.")+'</p><a class="btn primary" href="find.html">Find an accompanist</a></div>');
  return {title:"My bookings – Accord",html:dashShell("bookings",inner)};
}
mount(viewBookings,"");
