/* Page: help.html – help center and policies. */
function viewHelp(){
  var sections=[
   ["payments","How payments work","You and your accompanist arrange payment directly once a booking is confirmed. Accord does not hold funds, does not offer payment protection, and cannot process refunds. The accompanist marks a booking as paid in their dashboard, and Accord tracks its "+Math.round(COMMISSION*100)+"% commission on completed bookings."],
   ["cancellations","Cancellations and rescheduling","Either party can cancel a request at any time. For confirmed bookings, we suggest giving at least 48 hours notice. Late cancellations may be charged at the accompanist’s discretion. To reschedule, an accompanist can propose another time on any request."],
   ["reviews","Reviews","Only musicians who completed a booking can review an accompanist. Reviews cover musical preparation, reliability, communication, professionalism and overall experience. Reviews that are abusive or fraudulent can be reported and are moderated by Accord."],
   ["safety","Safety and reporting","Use the Report this profile button on any profile to flag inappropriate behavior, misrepresented credentials, repeated cancellations, payment disputes or suspicious accounts. Parents booking for younger musicians should be present, or choose a public location, for sessions. Accord does not currently verify credentials or identity, and profiles are not labelled verified."],
   ["privacy","Privacy","Contact details are shared between musician and accompanist only after a booking is confirmed. Do not share music you do not have permission to distribute."]];
  var html='<div class="wrap page"><div class="page-head"><h1>Help center</h1><p>How bookings, payments, reviews and safety work on Accord.</p></div>'+
   '<div class="faq">'+sections.map(function(s){return '<details id="'+s[0]+'"><summary>'+esc(s[1])+'</summary><p>'+esc(s[2])+'</p></details>'}).join("")+'</div>'+
   '<section class="sec"><div class="sec-head"><h2>Common questions</h2></div>'+faqHTML()+'</section></div>';
  return {title:"Help center – Accord",html:html,after:function(){var h=location.hash.slice(1),d=h&&document.getElementById(h);if(d&&d.tagName==="DETAILS"){d.open=true;d.scrollIntoView()}}};
}
mount(viewHelp,"help");
