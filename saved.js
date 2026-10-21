/* Page: saved.html – shortlist. */
function viewSaved(){
  var L=savedList();
  var html='<div class="wrap page"><div class="page-head"><h1>Your shortlist</h1><p>Accompanists you have saved. Open a profile to request a booking.</p></div><div class="grid">'+
   (L.length?L.map(function(p){return cardHTML(p,"")}).join(""):'<div class="empty"><h3>Nothing saved yet</h3><p>Tap the heart on any accompanist to keep them here.</p><a class="btn primary" href="find.html">Find an accompanist</a></div>')+'</div></div>';
  return {title:"Shortlist – Accord",html:html};
}
mount(viewSaved,"");
