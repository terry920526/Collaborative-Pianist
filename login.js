/* Page: login.html – email login (prototype) and demo accounts. */
function viewLogin(c){
  if(me())return {redirect:"dashboard.html"};
  var html='<div class="wrap page"><div class="auth"><h1>Log in</h1><p class="sub">New here? <a href="signup.html">Create an account</a>.</p>'+
   '<form class="box form" data-form="login" data-next="'+esc(c.params.get("next")||"")+'" novalidate>'+
    '<div class="field"><label for="le">Email</label><input id="le" name="le" type="email" autocomplete="email"><small>Prototype: no password is needed. A live site would use secure sign-in.</small></div>'+
    '<p class="err" data-err role="alert" hidden></p><button class="btn primary" type="submit">Log in</button>'+
    '<div class="demo"><span class="note">Want to look around first? Try a ready-made demo account.</span><div class="row"><button class="btn small" type="button" data-action="demo" data-role="musician">Try as a musician</button><button class="btn small" type="button" data-action="demo" data-role="pianist">Try as an accompanist</button><button class="btn small" type="button" data-action="demo" data-role="admin">Try as admin</button></div></div></form></div></div>';
  return {title:"Log in – Accord",html:html};
}
FORMS.login=function(f){
  var email=f.elements.le.value.trim().toLowerCase();
  if(!email)return fail(f,"Enter the email you signed up with.");
  var u=DB.users.filter(function(x){return x.email.toLowerCase()===email})[0];
  if(!u)return fail(f,"No account found for that email. Check the spelling or create an account.");
  if(u.suspended)return fail(f,"This account has been suspended. Please contact Accord support.");
  signIn(u);var next=safeNext(f.dataset.next);go(next||(u.role==="admin"?"admin.html":"dashboard.html"));
};
function demoUser(role){
  var email="demo."+role+"@example.com",names={musician:"Demo Musician",pianist:"Demo Accompanist",admin:"Demo Admin"};
  var u=DB.users.filter(function(x){return x.email===email})[0];
  if(!u){
    u={id:uid("u"),name:names[role],email:email,role:role,created:Date.now()};DB.users.push(u);persist("users");
    if(role==="pianist"){
      var pl=placeOf("Irvine");
      DB.custom.push({id:uid("p"),ownerId:u.id,name:u.name,city:"Irvine",zip:"92618",lat:pl.lat,lng:pl.lng,level:"Emerging professional",exp:6,
        specialties:["Classical","Opera"],inst:["Voice","Violin","Cello"],purposes:["Audition","Recital","Rehearsal"],
        services:{"Rehearsal":65,"Audition preparation":75,"Recital or performance":90},travelFee:20,travelRadius:20,studio:true,languages:["English"],
        education:"MM Collaborative Piano (demo profile)",bio:"Demo profile. I accompany singers and string players for auditions and recitals, and I enjoy helping nervous performers feel at home on stage.",
        rep:["Schubert lieder","Brahms Violin Sonata No. 1","Musical theater audition cuts"],
        avail:{Mon:["Evening"],Tue:["Afternoon","Evening"],Wed:["Evening"],Thu:["Afternoon","Evening"],Sat:["Morning","Afternoon"]},videos:[],photo:"",hidden:false,created:Date.now()});
      persist("custom");
    }
  }
  return u;
}
ACTIONS.demo=function(b){var u=demoUser(b.dataset.role);signIn(u);toast("Signed in as "+u.name);setTimeout(function(){go(u.role==="admin"?"admin.html":u.role==="pianist"?"bookings.html":"find.html")},300)};
mount(viewLogin,"");
