/* Page: settings.html – account details and deletion. */
function viewSettings(){
  var g=guard();if(g)return g;
  var u=me();
  var inner='<h1>Settings</h1><p class="lede">Your account details.</p>'+
   '<form class="box form" data-form="settings" novalidate><div class="two"><div class="field"><label for="an">Name</label><input id="an" name="an" maxlength="40" value="'+esc(u.name)+'"></div><div class="field"><label for="ae">Email</label><input id="ae" name="ae" type="email" value="'+esc(u.email)+'"></div></div><p class="err" data-err role="alert" hidden></p><div><button class="btn primary" type="submit">Save changes</button></div></form>'+
   '<div class="box" style="margin-top:20px"><h3 style="font-size:20px;margin-bottom:6px">Delete account</h3><p class="note" style="margin-bottom:12px">This removes your account, your profile and your bookings from this browser.</p><button class="btn quiet" type="button" data-action="delete-account">Delete my account</button></div>';
  return {title:"Settings – Accord",html:dashShell("settings",inner)};
}
FORMS.settings=function(f){
  var u=me(),name=f.elements.an.value.trim(),email=f.elements.ae.value.trim();
  if(!name)return fail(f,"Enter your name.");
  if(!/^\S+@\S+\.\S+$/.test(email))return fail(f,"Enter a valid email address.");
  if(emailTaken(email,u.id))return fail(f,"Another account already uses this email.");
  u.name=name;u.email=email;persist("users");renderHeader();toast("Settings saved");
};
ACTIONS["delete-account"]=function(b){
  if(!armed(b,"Click again to confirm"))return;
  var u=me();if(!u)return;
  DB.custom=DB.custom.filter(function(p){return p.ownerId!==u.id});
  DB.bookings=DB.bookings.filter(function(x){return x.fromId!==u.id&&x.ownerId!==u.id});
  DB.users=DB.users.filter(function(x){return x.id!==u.id});DB.session=null;
  ["custom","bookings","users","session"].forEach(persist);toast("Your account was deleted");setTimeout(function(){go("index.html")},500);
};
mount(viewSettings,"");
