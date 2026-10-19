/* Page: payments.html – payment tracking. */
function viewPayments(){
  var g=guard();if(g)return g;
  var bs=myBookings().filter(function(b){return ["confirmed","completed"].indexOf(b.status)>=0});
  var earned=0,owed=0,spent=0;
  bs.forEach(function(b){var r=roleIn(b);if(r==="pianist"){if(b.pay==="paid")earned+=b.total-b.commission;else owed+=b.total-b.commission}else if(b.pay==="paid")spent+=b.total});
  var rows=bs.map(function(b){
    var r=roleIn(b);
    return '<tr><td>'+esc(fmtShort(b.date))+'</td><td><a href="'+bookingUrl(b.id)+'">'+esc(r==="pianist"?b.fromName:b.pname)+'</a></td><td>'+esc(b.service)+'</td><td>'+money(b.total)+'</td><td>'+(r==="pianist"?'− '+money(b.commission):'—')+'</td><td>'+(r==="pianist"?'<b>'+money(b.total-b.commission)+'</b>':'—')+'</td><td>'+(b.pay==="paid"?'<span class="status accepted">Paid</span>':'<span class="status pending">Unpaid</span>')+'</td></tr>';
  }).join("");
  var inner='<h1>Payments</h1><p class="lede">Payments are arranged directly between musician and accompanist.</p>'+
   '<div class="banner"><b>How payment works.</b> Musicians pay accompanists directly once a booking is confirmed. Accord does not hold funds or offer payment protection. Accompanists mark bookings as paid once they receive payment, and Accord tracks its '+Math.round(COMMISSION*100)+'% commission. <a href="help.html#payments">Learn more</a></div>'+
   '<div class="stats"><div class="stat"><b>'+money(earned)+'</b><span>your share received</span></div><div class="stat"><b>'+money(owed)+'</b><span>your share outstanding</span></div><div class="stat"><b>'+money(spent)+'</b><span>paid to accompanists</span></div></div>'+
   (rows?'<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Date</th><th>With</th><th>Service</th><th>Total</th><th>Commission</th><th>Your share</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="empty" style="grid-column:auto"><h3>No confirmed bookings yet</h3><p>Confirmed and completed bookings appear here.</p></div>');
  return {title:"Payments – Accord",html:dashShell("payments",inner)};
}
mount(viewPayments,"");
