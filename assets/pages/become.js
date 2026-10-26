/* Page: become-accompanist.html – recruit accompanists. */
function viewBecome(){
  var u=me(),mp=myProfile();
  if (u && u.role === "musician") {
    return {title:"Become an accompanist – Accord",html:'<div class="wrap page"><div class="box"><h1>Your account is registered as a musician</h1><p>This account cannot be used to create an accompanist profile.</p><p><a class="btn primary" href="find.html">Find an accompanist</a></p></div></div>'};
  }
  if (u && (u.role === "pianist" || u.role === "both")) {
    return {title:"Become an accompanist – Accord",html:'<div class="wrap page"><div class="box"><h1>Manage your accompanist profile</h1><p>Visit your profile to update your listing and availability.</p><p><a class="btn primary" href="my-profile.html">My profile</a> <a class="btn" href="bookings.html">My bookings</a></p></div></div>',after:refreshAccompanistPromos};
  }
  var cta=u?(mp?'<a class="btn primary" href="bookings.html">Open your bookings</a>':'<a class="btn primary" href="my-profile.html">Create your profile</a>'):'<a class="btn primary" href="signup.html?role=pianist">Create a free profile</a>';
  var html='<div class="wrap page"><div class="page-head"><h1>Become an accompanist</h1><p>Advertise your services to musicians near you, set your own rates and availability, and receive booking requests. Open to piano students and professional accompanists.</p><p style="margin-top:20px">'+cta+'</p></div>'+
   '<div class="benefits"><div class="benefit"><h3>Create a professional profile</h3><p>Photo, bio, education, videos, repertoire, languages and reviews, all in one portfolio page.</p></div>'+
   '<div class="benefit"><h3>Set your terms</h3><p>Choose your rate for each service, your studio and travel options, and the days and times you are available.</p></div>'+
   '<div class="benefit"><h3>Get found by repertoire</h3><p>Musicians search by composer and piece, so requests match what you already know and love to play.</p></div></div>'+
   '<section class="sec"><div class="sec-head"><h2>How you earn</h2></div><div class="box"><p>Accord charges a <b>'+Math.round(COMMISSION*100)+'% commission</b> on completed bookings. For example, if a musician books a $100 rehearsal, the commission is $15 and your share is $85.</p><p class="note" style="margin-top:10px">During the validation phase, you and the musician arrange payment directly, and Accord tracks the commission. Integrated online payments and payouts are planned for the next stage.</p></div></section>'+
   '<section class="sec"><div class="sec-head"><h2>What a strong profile includes</h2></div><ul class="tips"><li>A clear bio about who you accompany and what you specialise in.</li><li>Specific repertoire. “Brahms Cello Sonata No. 1” will be found more often than “classical music”.</li><li>Honest availability and travel details, so musicians know what to expect.</li><li>A performance video, so musicians can hear how you play.</li></ul></section>'+
   '<section class="sec"><div class="cta"><div><h2>List your profile for free.</h2><p>It takes about ten minutes. You can pause or delete your listing at any time.</p></div>'+cta.replace('class="btn primary"','class="btn"')+'</div></section></div>';
  return {title:"Become an accompanist – Accord",html:html};
}
mount(viewBecome,"for");
