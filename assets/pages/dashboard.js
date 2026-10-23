/* dashboard.html remains the account entry point and routes to the correct role dashboard. */
function viewDash(){
  var g=guard();if(g)return g;
  var u=me();
  if(u.role==="pianist"||myProfile())return {redirect:"accompanist-dashboard.html"};
  return {redirect:"musician-dashboard.html"};
}
mount(viewDash,"");
