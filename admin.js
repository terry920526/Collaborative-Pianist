/* Page: admin.html – basic admin dashboard (prototype: demo admin only). */
var TABS=[["overview","Overview"],["users","Users"],["profiles","Profiles"],["bookings","Bookings"],["reviews","Reviews"],["reports","Reports"],["emails","Emails"]];
function pct(a,b){return b?Math.round(a/b*100)+"%":"—"}
function viewAdmin(c){
  var g=guardAdmin();if(g)return g;
  var tab=c.params.get("tab")||"overview",body="";
  var real=DB.bookings.filter(function(b){return b.status!=="demo"});
  if(tab==="overview"){
    var musicians=DB.users.filter(function(u){return u.role==="musician"}),pians=DB.users.filter(function(u){return u.role==="pianist"});
    var done=real.filter(function(b){return b.status==="completed"}),conf=real.filter(function(b){return b.status==="confirmed"||b.status==="completed"});
    var paid=real.filter(function(b){return b.pay==="paid"});
    var avg=conf.length?conf.reduce(function(s,b){return s+b.total},0)/conf.length:0;
    var comm=done.reduce(function(s,b){return s+b.commission},0),collected=done.filter(function(b){return b.commissionCollected}).reduce(function(s,b){return s+b.commission},0);
    var by={};real.forEach(function(b){by[b.fromId]=(by[b.fromId]||0)+1});var ids=Object.keys(by),repeat=ids.filter(function(k){return by[k]>1}).length;
    var cac=musicians.length&&DB.admin.spend?money(DB.admin.spend/musicians.length):"—";
    body='<div class="stats four">'+[
      [pians.length,"registered accompanists"],[musicians.length,"registered musicians"],[real.length,"booking requests"],[pct(paid.length,real.length),"requests that became paid bookings"],
      [money(avg),"average booking value"],[money(conf.length?conf.reduce(function(s,b){return s+b.commission},0)/conf.length:0),"revenue per booking"],[pct(repeat,ids.length),"repeat booking rate"],[cac,"customer acquisition cost"]
    ].map(function(x){return '<div class="stat"><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join("")+'</div>'+
    '<div class="box"><h3 style="font-size:20px;margin-bottom:8px">Commission ('+Math.round(COMMISSION*100)+'%)</h3><p>Earned on completed bookings: <b>'+money(comm)+'</b>. Collected: <b>'+money(collected)+'</b>. Outstanding: <b>'+money(comm-collected)+'</b>.</p><p class="note" style="margin-top:6px">Commission is tracked but not collected automatically in the validation phase.</p></div>'+
    '<form class="box form" data-form="spend" style="margin-top:16px" novalidate><div class="field" style="max-width:260px"><label for="sp">Marketing spend to date ($)</label><input id="sp" name="sp" type="number" min="0" value="'+(DB.admin.spend||0)+'"><small>Used to estimate customer acquisition cost per registered musician.</small></div><div><button class="btn small" type="submit">Save</button></div></form>'+
    '<p class="note" style="margin-top:16px">Figures cover accounts and bookings stored in this browser. The 16 sample accompanists are not counted.</p>';
  }else if(tab==="users"){
    body=tbl(["Name","Email","Role","Joined","Status",""],DB.users.map(function(u){
      return [esc(u.name),esc(u.email),esc(u.role),esc(new Date(u.created).toLocaleDateString()),u.suspended?'<span class="status declined">Suspended</span>':'<span class="status accepted">Active</span>',
        u.id===me().id?'—':'<button class="btn small" type="button" data-action="suspend-user" data-id="'+u.id+'">'+(u.suspended?"Restore":"Suspend")+'</button>']}));
  }else if(tab==="profiles"){
    body=tbl(["Accompanist","City","Level","Rates","Status",""],DB.custom.map(function(p){
      return ['<a href="'+pianistUrl(p.id)+'">'+esc(p.name)+'</a>',esc(p.city),esc(p.level),money(minRate(p))+" from",p.suspended?'<span class="status declined">Suspended</span>':p.hidden?'<span class="status pending">Hidden by owner</span>':'<span class="status accepted">Listed</span>',
        '<button class="btn small" type="button" data-action="suspend-profile" data-id="'+p.id+'">'+(p.suspended?"Restore":"Suspend")+'</button>']}));
  }else if(tab==="bookings"){
    body=tbl(["Date","Musician","Accompanist","Service","Total","Commission","Status","Payment",""],DB.bookings.map(function(b){
      var can=b.status==="completed"&&b.pay==="paid";
      return [esc(fmtShort(b.date)),esc(b.fromName),esc(b.pname),esc(b.service),money(b.total),money(b.commission),statusChip(b.status),b.pay==="paid"?"Paid":"Unpaid",
        can?'<button class="btn small" type="button" data-action="commission" data-id="'+b.id+'">'+(b.commissionCollected?"Collected ✓":"Mark commission collected")+'</button>':'']}));
  }else if(tab==="reviews"){
    body=tbl(["Accompanist","Reviewer","Overall","Review","Status",""],DB.revs.map(function(r){var p=getP(r.pid);
      return [esc(p?p.name:""),esc(r.name),"★ "+r.scores.overall,esc(r.text),r.hidden?'<span class="status declined">Hidden</span>':'<span class="status accepted">Visible</span>','<button class="btn small" type="button" data-action="hide-review" data-id="'+r.id+'">'+(r.hidden?"Restore":"Hide")+'</button>']}));
  }else if(tab==="reports"){
    body=tbl(["When","Profile","Reason","Details","Status",""],DB.reports.map(function(r){
      return [when(r.ts),'<a href="'+pianistUrl(r.pid)+'">'+esc(r.pname)+'</a>',esc(r.reason),esc(r.details),r.status==="open"?'<span class="status pending">Open</span>':'<span class="status accepted">Resolved</span>','<button class="btn small" type="button" data-action="resolve" data-id="'+r.id+'">'+(r.status==="open"?"Resolve":"Reopen")+'</button>']}));
  }else if(tab==="emails"){
    body='<p class="note" style="margin-bottom:14px">Emails Accord would have sent. A live site connects these to an email service.</p>'+(DB.notifs.length?DB.notifs.map(function(n){return '<div class="email"><h4>'+esc(n.subject)+'</h4><div class="to">To: '+esc(n.email)+' · '+when(n.ts)+'</div><p>'+esc(n.body)+'</p></div>'}).join(""):'<div class="empty" style="grid-column:auto"><h3>No emails yet</h3></div>');
  }
  var html='<div class="wrap page"><div class="page-head"><h1>Admin dashboard</h1><p>Manage the marketplace. Prototype: the demo admin account stands in for a real administrator login.</p></div><div class="subtabs">'+TABS.map(function(t){return '<a class="pill" href="admin.html?tab='+t[0]+'"'+(t[0]===tab?' aria-current="page"':'')+'>'+t[1]+'</a>'}).join("")+'</div>'+body+'</div>';
  return {title:"Admin – Accord",html:html};
}
function tbl(head,rows){
  if(!rows.length)return '<div class="empty" style="grid-column:auto"><h3>Nothing here yet</h3></div>';
  return '<div class="tbl-wrap"><table class="tbl"><thead><tr>'+head.map(function(h){return '<th>'+h+'</th>'}).join("")+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
}
function byId(list,id){return list.filter(function(x){return x.id===id})[0]}
ACTIONS["suspend-user"]=function(b){var u=byId(DB.users,b.dataset.id);u.suspended=!u.suspended;persist("users");toast(u.suspended?"Account suspended":"Account restored");rerender()};
ACTIONS["suspend-profile"]=function(b){var p=byId(DB.custom,b.dataset.id);p.suspended=!p.suspended;persist("custom");toast(p.suspended?"Profile suspended":"Profile restored");rerender()};
ACTIONS.commission=function(b){var x=byId(DB.bookings,b.dataset.id);x.commissionCollected=!x.commissionCollected;persist("bookings");rerender()};
ACTIONS["hide-review"]=function(b){var r=byId(DB.revs,b.dataset.id);r.hidden=!r.hidden;persist("revs");rerender()};
ACTIONS.resolve=function(b){var r=byId(DB.reports,b.dataset.id);r.status=r.status==="open"?"resolved":"open";persist("reports");rerender()};
FORMS.spend=function(f){DB.admin.spend=Math.max(0,+f.elements.sp.value||0);persist("admin");toast("Saved");rerender()};
mount(viewAdmin,"");
