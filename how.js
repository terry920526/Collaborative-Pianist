/* Page: how-it-works.html */
function viewHow(){
  var steps=[["1","Select the service","Rehearsal, audition or competition preparation, recital or performance, or a recording session."],
   ["2","Provide the details","Date, start time, length, instrument, repertoire, your performance date and location."],
   ["3","Choose your accompanist","Compare profiles, rates, location and availability, then send your request."],
   ["4","They respond","The accompanist can accept, decline, or propose another time."],
   ["5","Arrange payment","In this validation phase you and the accompanist arrange payment directly. Online checkout comes next."],
   ["6","Rehearse, then review","Both of you get the confirmed details. After the session, leave a review."]];
  var html='<div class="wrap page"><div class="page-head"><h1>How Accord works</h1><p>Finding, evaluating and booking an accompanist, in one place.</p></div>'+
   '<div class="benefits">'+steps.map(function(s){return '<div class="benefit"><div class="n" style="font-family:var(--serif);font-size:40px;font-weight:300;color:var(--accent);line-height:1">'+s[0]+'</div><h3 style="margin-top:10px">'+s[1]+'</h3><p>'+s[2]+'</p></div>'}).join("")+'</div>'+
   '<section class="sec"><div class="sec-head"><h2>Practical questions</h2><p>Common things musicians ask before they book.</p></div>'+faqHTML()+'</section>'+
   '<section class="sec"><div class="cta"><div><h2>Ready to find your accompanist?</h2></div><a class="btn" href="find.html">Search accompanists</a></div></section></div>';
  return {title:"How it works – Accord",html:html};
}
mount(viewHow,"how");
