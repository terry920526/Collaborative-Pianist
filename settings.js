/* Page: settings.html – account details. */
function viewSettings(){
  var g=guard();if(g)return g;
  var u=me();
  var inner='<h1>Settings</h1><p class="lede">Your account details.</p>'+
   '<form class="box form" data-form="settings" novalidate><div class="two"><div class="field"><label for="an">Name</label><input id="an" name="an" maxlength="80" value="'+esc(u.name)+'"></div><div class="field"><label for="ae">Email</label><input id="ae" name="ae" type="email" value="'+esc(u.email)+'"><small>If you change your email, we send a confirmation link to the new address.</small></div></div><p class="err" data-err role="alert" hidden></p><div><button class="btn primary" type="submit">Save changes</button></div></form>';
  return {title:"Settings – Accord",html:dashShell("settings",inner)};
}
FORMS.settings=async function(f){
  var u=me(),name=f.elements.an.value.trim(),email=f.elements.ae.value.trim().toLowerCase();
  if(!name)return fail(f,"Enter your name.");
  if(!/^\S+@\S+\.\S+$/.test(email))return fail(f,"Enter a valid email address.");
  if(typeof supabaseClient==="undefined"||!supabaseClient.auth)return fail(f,"The account service could not load. Please refresh the page and try again.");
  var nameChanged=name!==u.name,emailChanged=email!==String(u.email||"").toLowerCase();
  if(!nameChanged&&!emailChanged){toast("No changes to save");return}
  var btn=f.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent="Saving…";
  try{
    if(nameChanged){
      var r=await supabaseClient.from("profiles").update({full_name:name}).eq("id",u.id);
      if(r.error)throw r.error;
      u.name=name;u.full_name=name;
    }
    if(emailChanged){
      var r2=await supabaseClient.auth.updateUser({email:email});
      if(r2.error)throw r2.error;
    }
    renderHeader();
    toast(emailChanged?"Saved. Check your new email address to confirm the change.":"Settings saved");
  }catch(err){
    console.error("Settings error:",err);
    fail(f,"We couldn’t save your changes. Please try again.");
  }finally{
    btn.disabled=false;btn.textContent="Save changes";
  }
};
mount(viewSettings,"");
