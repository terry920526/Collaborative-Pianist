/* Musician/customer dashboard. Booking data currently follows the site's existing browser-storage implementation. */
function viewMusicianDashboard(){
  var g=guard();if(g)return g;
  var u=me();
  if(u.role!=="both"&&(u.role==="pianist"||myProfile()))return {redirect:"accompanist-dashboard.html"};
  var bs=myBookings().filter(function(b){return roleIn(b)==="musician";});
  var t=today();
  var pending=bs.filter(function(b){return b.status==="requested"||b.status==="proposed";});
  var upcoming=bs.filter(function(b){return b.status==="confirmed"&&b.date>=t;});
  var recent=bs.slice(0,4).map(bookingRow).join("");
  var inner='<div class="page-head"><h1>Welcome, '+esc((u.first_name||u.name||"there").split(" ")[0])+'</h1><p>Find the right collaborative pianist and keep track of your booking requests.</p></div>'+
    '<div class="dash-quicklinks"><a class="btn primary" href="find.html">Find an accompanist</a><a class="btn" href="bookings.html">View my bookings</a></div>'+
    '<div class="stats"><div class="stat"><b>'+bs.length+'</b><span>booking requests sent</span></div><div class="stat"><b>'+upcoming.length+'</b><span>upcoming sessions</span></div><div class="stat"><b>'+pending.length+'</b><span>awaiting a response</span></div></div>'+
    '<div class="dashboard-grid"><section><div class="sec-head" style="margin-bottom:14px"><h2 style="font-size:24px">Recent bookings</h2><a href="bookings.html">View all</a></div>'+
    (recent?'<div class="rows">'+recent+'</div>':'<div class="empty" style="grid-column:auto"><h3>No bookings yet</h3><p>Search for a pianist and send your first booking request.</p><a class="btn primary" href="find.html">Find an accompanist</a></div>')+
    '</section><aside class="box"><h2 style="font-size:22px;margin-bottom:10px">Your musician tools</h2><div class="dashboard-linklist"><a href="find.html"><span>Find an accompanist</span><span aria-hidden="true">→</span></a><a href="saved.html"><span>Saved accompanists</span><span aria-hidden="true">→</span></a><a href="bookings.html"><span>Booking requests</span><span aria-hidden="true">→</span></a><a href="settings.html"><span>Account settings</span><span aria-hidden="true">→</span></a></div></aside></div>'+
    (u.role==="both"?'<div class="banner" style="margin-top:20px">You can also use Accord as an accompanist. <a href="accompanist-dashboard.html">Switch to accompanist dashboard</a>.</div>':'');
  return {title:"Musician Dashboard – Accord",html:dashShell("",inner)};
}
mount(viewMusicianDashboard, "");

// Load real booking requests from Supabase.
async function loadMusicianDashboardBookings() {
  const user = me();

  if (!user) return;

  const { data, error } = await supabaseClient
    .from("booking_requests")
    .select("*")
    .eq("musician_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load musician bookings:", error);
    return;
  }

  const bookings = data || [];
  const todayDate = new Date().toISOString().slice(0, 10);

  const pending = bookings.filter(
    booking => booking.status === "pending"
  );

  const upcoming = bookings.filter(
    booking =>
      booking.status === "accepted" &&
      booking.event_date &&
      booking.event_date >= todayDate
  );

  // Update the dashboard's three statistics.
  const stats = document.querySelectorAll("#view .stats .stat b");

  if (stats.length >= 3) {
    stats[0].textContent = bookings.length;
    stats[1].textContent = upcoming.length;
    stats[2].textContent = pending.length;
  }

  // Display the most recent real booking requests.
  const sections = document.querySelectorAll("#view .dashboard-grid section");
  if (!sections.length) return;

  const section = sections[0];
  let container = section.querySelector(".rows");

  if (!container) {
    container = document.createElement("div");
    container.className = "rows";

    const empty = section.querySelector(".empty");
    if (empty) empty.remove();

    section.appendChild(container);
  }

  if (!bookings.length) {
    container.innerHTML =
      '<div class="empty" style="grid-column:auto">' +
      '<h3>No bookings yet</h3>' +
      '<p>Search for a pianist and send your first booking request.</p>' +
      '<a class="btn primary" href="find.html">Find an accompanist</a>' +
      '</div>';

    return;
  }

  container.innerHTML = bookings.slice(0, 4).map(booking => {
    const date = booking.event_date || "Date not specified";
    const time = booking.event_time
      ? booking.event_time.slice(0, 5)
      : "Time not specified";

    const status = booking.status || "pending";

    return `
      <div class="row-item">
        <div class="grow">
          <b>Booking request</b>
          <div class="meta">
            ${esc(date)} · ${esc(time)}
          </div>
          <div class="meta">
            ${esc(booking.repertoire || "No repertoire specified")}
          </div>
          <div class="meta">
            ${esc(booking.location || "Location not specified")}
          </div>
        </div>
        <span class="pill">${esc(status)}</span>
      </div>
    `;
  }).join("");
}

// Wait until authentication has loaded before querying bookings.
AUTH_READY.then(loadMusicianDashboardBookings);
