/* Page: settings.html – account details and permanent account deletion. */
function viewSettings(){
  var g=guard();if(g)return g;
  var u=me();
  var inner='<h1>Settings</h1><p class="lede">Your account details.</p>'+
   '<form class="box form" data-form="settings" novalidate><div class="two"><div class="field"><label for="an">First name</label><input id="an" name="an" maxlength="40" value="'+esc(u.first_name||u.name||'')+'"></div><div class="field"><label for="al">Last name</label><input id="al" name="al" maxlength="40" value="'+esc(u.last_name||'')+'"></div></div><div class="field"><label for="ae">Email</label><input id="ae" name="ae" type="email" value="'+esc(u.email)+'" disabled><small>Your sign-in email is managed by your account provider.</small></div><p class="err" data-err role="alert" hidden></p><div><button class="btn primary" type="submit">Save changes</button></div></form>'+
   '<div class="box" style="margin-top:20px;border:1px solid #c44"><h3 style="font-size:20px;margin-bottom:6px">Delete account permanently</h3><p class="note" style="margin-bottom:12px">This permanently deletes your Accord sign-in account and your Accord profile from the server. Your bookings, reviews, notifications, and saved items currently stored in this browser will also be removed where they can be associated with your account. This action cannot be undone.</p><button class="btn quiet" type="button" data-action="delete-account">Delete my account</button><p class="note" style="margin-top:10px">You will be asked to type DELETE to confirm.</p></div>';
  return {title:"Settings – Accord",html:dashShell("settings",inner)};
}
FORMS.settings=async function(f){
  var u=me(),first=f.elements.an.value.trim(),last=f.elements.al.value.trim();
  if(!first)return fail(f,"Enter your first name.");
  if(!last)return fail(f,"Enter your last name.");
  if(!u||!u.id)return fail(f,"Please log in again before saving changes.");
  if(typeof supabaseClient==="undefined"||!supabaseClient)return fail(f,"The account service is unavailable. Refresh and try again.");
  var button=f.querySelector('button[type="submit"]');
  if(button){button.disabled=true;button.textContent="Saving...";}
  try{
    var result=await supabaseClient.from("profiles").update({first_name:first,last_name:last}).eq("id",u.id);
    if(result.error)throw result.error;
    u.first_name=first;u.last_name=last;u.name=first+" "+last;
    renderHeader();toast("Settings saved");
  }catch(error){
    console.error("Could not update account details:",error);
    fail(f,"We couldn't save your changes. Please try again.");
  }finally{
    if(button){button.disabled=false;button.textContent="Save changes";}
  }
};
ACTIONS["delete-account"]=async function(button){
  if(!armed(button,"Click again to continue"))return;
  var u=me();
  if(!u||!u.id){toast("Please log in again before deleting your account.");return;}
  if(typeof supabaseClient==="undefined"||!supabaseClient||!supabaseClient.auth){
    toast("The account service is unavailable. Refresh and try again.");return;
  }
  var confirmation=window.prompt('This permanently deletes your Accord account. Type DELETE in capital letters to continue:');
  if(confirmation!=="DELETE"){if(confirmation!==null)toast("Account deletion cancelled.");return;}
  button.disabled=true;button.textContent="Deleting account...";
  try{
    var sessionResult=await supabaseClient.auth.getSession();
    if(sessionResult.error)throw sessionResult.error;
    if(!sessionResult.data.session)throw new Error("No active sign-in session.");
    var result=await supabaseClient.functions.invoke("delete-account");
    if(result.error)throw result.error;
    if(!result.data||result.data.success!==true)throw new Error((result.data&&result.data.error)||"Account deletion was not confirmed.");

    /* Clean this browser's legacy/local data associated with the deleted user. */
    var deletedBookingIds=DB.bookings.filter(function(b){return b.fromId===u.id||b.ownerId===u.id;}).map(function(b){return b.id;});
    DB.custom=DB.custom.filter(function(p){return p.ownerId!==u.id&&p.id!==u.id;});
    DB.bookings=DB.bookings.filter(function(b){return b.fromId!==u.id&&b.ownerId!==u.id;});
    DB.revs=DB.revs.filter(function(r){return r.pid!==u.id&&deletedBookingIds.indexOf(r.bid)<0;});
    DB.notifs=DB.notifs.filter(function(n){return n.to!==u.id;});
    DB.users=DB.users.filter(function(x){return x.id!==u.id;});
    if(DB.saved&&typeof DB.saved==="object")delete DB.saved[u.id];
    DB.session=null;
    ["custom","bookings","revs","notifs","users","saved","session"].forEach(persist);
    try{await supabaseClient.auth.signOut({scope:"local"});}catch(signOutError){console.warn("Local sign-out after deletion:",signOutError);}
    AUTH_USER=null;
    toast("Your account has been deleted.");
    setTimeout(function(){go("index.html");},500);
  }catch(error){
    console.error("Account deletion failed:",error);
    toast("We couldn't complete account deletion. Your account may still exist. Please try again or contact support.");
    button.disabled=false;button.textContent="Delete my account";
    delete button.dataset.armed;
  }
};
mount(viewSettings,"");
