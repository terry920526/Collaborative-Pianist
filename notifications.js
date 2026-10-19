/* Page: notifications.html – in-app copies of the emails Accord would send. */
function viewNotifs(){
  var g=guard();if(g)return g;
  var list=myNotifs();
  var inner='<h1>Notifications</h1><p class="lede">Updates about your bookings and account.</p>'+
   (list.length?'<div class="rows" style="padding:4px 20px">'+list.map(function(n){return '<div class="note-item'+(n.read?'':' new')+'"><h4>'+esc(n.subject)+'</h4><div class="meta">'+when(n.ts)+'</div><p>'+esc(n.body)+'</p>'+(n.link?'<p style="margin-top:6px"><a href="'+esc(n.link)+'">Open</a></p>':'')+'</div>'}).join("")+'</div>':'<div class="empty" style="grid-column:auto"><h3>No notifications yet</h3><p>Booking updates will appear here.</p></div>');
  return {title:"Notifications – Accord",html:dashShell("notifications",inner),after:function(){
    var changed=false;DB.notifs.forEach(function(n){if(n.to===me().id&&!n.read){n.read=true;changed=true}});if(changed){persist("notifs");setTimeout(renderHeader,0)}}};
}
mount(viewNotifs,"");
