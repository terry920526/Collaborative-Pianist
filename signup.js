/* Page: signup.html */
function viewSignup(c){
  if(me())return {redirect:"dashboard.html"};
  var role=c.params.get("role")==="pianist"?"pianist":"musician";
  var html='<div class="wrap page"><div class="auth"><h1>Create your account</h1><p class="sub">Free to join. Already have an account? <a href="login.html">Log in</a>.</p>'+
   '<form class="box form" data-form="signup" data-next="'+esc(c.params.get("next")||"")+'" novalidate>'+
    '<div class="roles" role="radiogroup" aria-label="I am a"><label class="role"><input type="radio" name="role" value="musician"'+(role==="musician"?' checked':'')+'><span><b>Musician</b><small>I need an accompanist</small></span></label>'+
    '<label class="role"><input type="radio" name="role" value="pianist"'+(role==="pianist"?' checked':'')+'><span><b>Accompanist</b><small>Students and professionals</small></span></label></div>'+
    '<div class="field"><label for="sn">Your name</label><input id="sn" name="sn" maxlength="40" autocomplete="name"></div>'+
    '<div class="field"><label for="se">Email</label><input id="se" name="se" type="email" autocomplete="email"><small>Prototype: no password is needed, and nothing leaves this browser. A live site would use secure sign-in.</small></div>'+
    '<p class="err" data-err role="alert" hidden></p><button class="btn primary" type="submit">Create account</button></form></div></div>';
  return {title:"Sign up – Accord",html:html};
}
FORMS.signup=function(f){
  var name=f.elements.sn.value.trim(),email=f.elements.se.value.trim(),role=(f.querySelector('input[name="role"]:checked')||{}).value||"musician";
  if(!name)return fail(f,"Enter your name.");
  if(!/^\S+@\S+\.\S+$/.test(email))return fail(f,"Enter a valid email address, like name@example.com.");
  if(emailTaken(email))return fail(f,"An account with this email already exists. Log in instead.");
  var u={id:uid("u"),name:name,email:email,role:role,created:Date.now()};
  DB.users.push(u);persist("users");signIn(u);
  notify(u.id,u.email,"Welcome to Accord","Thanks for joining Accord, "+name.split(" ")[0]+"."+(role==="pianist"?"\n\nNext step: create your profile so musicians can find you.":"\n\nSearch for an accompanist and send your first booking request."),role==="pianist"?"my-profile.html":"find.html");
  var next=safeNext(f.dataset.next);
  go(role==="pianist"?"my-profile.html":(next||"find.html"));
};
mount(viewSignup,"");
