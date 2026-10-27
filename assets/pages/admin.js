/* Accord live administrator dashboard. Access is checked by Supabase, not browser demo roles. */
(function () {
  var activeTab = new URLSearchParams(location.search).get('tab') || 'overview';
  var cache = { users: [], profiles: [], bookings: [] };
  var tabs = [['overview','Overview'],['bookings','Bookings'],['profiles','Profile approvals'],['users','Users']];
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function money(v) { var n = Number(v); return Number.isFinite(n) ? n.toLocaleString(undefined,{style:'currency',currency:'USD'}) : '—'; }
  function date(v) { if (!v) return '—'; var d = new Date(v); return Number.isNaN(d.getTime()) ? esc(v) : d.toLocaleString(); }
  function name(u) { return [u && u.first_name, u && u.last_name].filter(Boolean).join(' ') || (u && u.email) || '—'; }
  function setMessage(msg, bad) { var el = document.getElementById('admin-message'); if (el) { el.textContent = msg; el.className = bad ? 'note declined' : 'note'; } }
  function table(head, rows) {
    if (!rows.length) return '<div class="empty" style="grid-column:auto"><h3>Nothing here yet</h3><p>New records will appear here when available.</p></div>';
    return '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';
  }
  function layout(content) {
    document.getElementById('view').innerHTML = '<div class="wrap page"><div class="page-head"><h1>Accord administration</h1><p>Live information from your Accord database.</p></div><div class="subtabs">'+tabs.map(function(t){return '<a class="pill" href="admin.html?tab='+t[0]+'" '+(t[0]===activeTab?'aria-current="page"':'')+'>'+t[1]+'</a>';}).join('')+'</div><p id="admin-message" class="note" role="status"></p>'+content+'</div>';
    document.title = 'Admin – Accord';
  }
  async function loadData() {
    var usersRes = await supabaseClient.from('profiles').select('id,first_name,last_name,role,city,state,created_at').order('created_at',{ascending:false});
    if (usersRes.error) throw usersRes.error;
    cache.users = usersRes.data || [];
    var profilesRes = await supabaseClient.from('pianist_profiles').select('id,hourly_rate,years_experience,instruments,specialties,available_for_hire,is_published,profile_details,created_at').order('created_at',{ascending:false});
    if (profilesRes.error) throw profilesRes.error;
    cache.profiles = profilesRes.data || [];
    var bookingsRes = await supabaseClient.from('booking_requests').select('*').order('created_at',{ascending:false});
    if (bookingsRes.error) throw bookingsRes.error;
    cache.bookings = bookingsRes.data || [];
  }
  function render() {
    var body = '';
    if (activeTab === 'overview') {
      var pending = cache.profiles.filter(function(p){return !p.is_published;}).length;
      var requested = cache.bookings.filter(function(b){return ['requested','pending'].indexOf(String(b.status||'').toLowerCase())>=0;}).length;
      body = '<div class="stats four"><div class="stat"><b>'+cache.users.length+'</b><span>Registered users</span></div><div class="stat"><b>'+cache.profiles.length+'</b><span>Accompanist profiles</span></div><div class="stat"><b>'+pending+'</b><span>Profiles not published</span></div><div class="stat"><b>'+cache.bookings.length+'</b><span>Total booking requests</span></div></div><div class="box" style="margin-top:18px"><h3>Needs attention</h3><p>'+requested+' booking request(s) currently marked requested/pending, and '+pending+' profile(s) not published.</p><p>Use the tabs above to review individual records.</p></div>';
    } else if (activeTab === 'users') {
      body = table(['Name','User ID','Role','Location','Created'], cache.users.map(function(u){return [esc(name(u)), '<small>'+esc(u.id)+'</small>', esc(u.role||'—'), esc([u.city,u.state].filter(Boolean).join(', ')||'—'), date(u.created_at)];}));
    } else if (activeTab === 'profiles') {
      body = '<p>Profiles with “Not published” status are not currently published. Publishing makes the profile eligible to appear publicly, subject to the existing site search rules.</p>'+table(['Accompanist','Rate','Experience','Status','Action'], cache.profiles.map(function(p){var u=cache.users.find(function(x){return x.id===p.id;})||{}; var details=p.profile_details||{}; var isPub=!!p.is_published; return [esc(details.display_name||name(u)), money(p.hourly_rate)+' / hour', esc(p.years_experience==null?'—':p.years_experience+' years'), isPub?'<span class="status accepted">Published</span>':'<span class="status pending">Not published</span>', '<button class="btn small" type="button" data-admin-action="publish-profile" data-id="'+esc(p.id)+'" data-publish="'+(!isPub)+'">'+(isPub?'Unpublish':'Approve & publish')+'</button>'];}));
    } else if (activeTab === 'bookings') {
      body = table(['Created','Musician ID','Accompanist ID','Date','Time','Status','Booking ID'], cache.bookings.map(function(b){return [date(b.created_at),'<small>'+esc(b.musician_id||'—')+'</small>','<small>'+esc(b.pianist_id||'—')+'</small>',esc(b.date||b.requested_date||'—'),esc(b.time||b.requested_time||'—'),'<span class="status '+(String(b.status).toLowerCase()==='confirmed'?'accepted':'pending')+'">'+esc(b.status||'—')+'</span>','<small>'+esc(b.id||'—')+'</small>'];}));
    }
    layout(body);
  }
  async function start() {
    layout('<div class="box"><h3>Checking administrator access…</h3><p>Please wait.</p></div>');
    try {
      await AUTH_READY;
      var sessionResult = await supabaseClient.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (!session) { location.replace('index.html?auth=login&next='+encodeURIComponent('admin.html')); return; }
      var check = await supabaseClient.rpc('is_accord_admin');
      if (check.error) throw check.error;
      if (check.data !== true) {
        layout('<div class="box"><h2>Access denied</h2><p>This account is not authorized to use the Accord administrator dashboard.</p><p><a class="btn" href="index.html">Return to Accord</a></p></div>'); return;
      }
      await loadData(); render();
    } catch (e) {
      console.error('Admin dashboard failed to load:', e);
      layout('<div class="box"><h2>Could not load administrator data</h2><p>The administrator check or database query failed. Confirm the SQL policies in the setup instructions have been applied, then reload this page.</p><p class="note">'+esc(e && e.message || 'Unknown error')+'</p></div>');
    }
  }
  document.addEventListener('click', async function(e) {
    var b = e.target.closest('[data-admin-action]'); if (!b) return;
    if (b.dataset.adminAction !== 'publish-profile') return;
    var id=b.dataset.id, publish=b.dataset.publish==='true';
    if (!id) return;
    b.disabled=true;
    try {
      var result = await supabaseClient.from('pianist_profiles').update({is_published:publish}).eq('id',id).select('id,is_published').maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) throw new Error('No profile was updated. Check the admin update policy in Supabase.');
      var p=cache.profiles.find(function(x){return x.id===id;}); if(p)p.is_published=!!result.data.is_published;
      render(); setMessage(publish?'Profile approved and published.':'Profile unpublished.',false);
    } catch(err) { console.error(err); b.disabled=false; setMessage('Could not update profile: '+(err.message||'Unknown error'),true); }
  });
  mount(function(){ return {title:'Admin – Accord',html:'<div class="wrap page"><div class="box"><h1>Accord administration</h1><p>Checking administrator access…</p></div></div>'}; }, '');
  start();
})();
