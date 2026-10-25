/* Accompanist dashboard. Booking data currently follows the site's existing browser-storage implementation. */
function viewAccompanistDashboard(){
  var g=guard();if(g)return g;
  var u=me(),mp=myProfile();
  if(u.role!=="pianist"&&!mp&&u.role!=="both")return {redirect:"musician-dashboard.html"};
  var bs=myBookings().filter(function(b){return roleIn(b)==="pianist";});
  var t=today();
  var pending=bs.filter(function(b){return b.status==="requested";});
  var upcoming=bs.filter(function(b){return b.status==="confirmed"&&b.date>=t;});
  var recent=bs.slice(0,4).map(bookingRow).join("");
  var listing=mp?(mp.suspended?"Suspended":mp.hidden?"Hidden":"Available"):"Not created";
  var inner='<div class="page-head"><h1>Welcome, '+esc((u.first_name||u.name||"there").split(" ")[0])+'</h1><p>Manage your accompanist profile and respond to musicians looking to work with you.</p></div>'+
    '<div class="dash-quicklinks"><a class="btn primary" href="my-profile.html">'+(mp?'Manage my profile':'Create my profile')+'</a><a class="btn" href="bookings.html">View booking requests</a></div>'+
    '<div class="stats"><div class="stat"><b>'+pending.length+'</b><span>requests awaiting your reply</span></div><div class="stat"><b>'+upcoming.length+'</b><span>upcoming sessions</span></div><div class="stat"><b>'+esc(listing)+'</b><span>profile status</span></div></div>'+
    (!mp?'<div class="banner"><b>Get started:</b> create your accompanist profile so musicians can discover you. <a href="my-profile.html">Create profile</a></div>':'')+
    '<div class="dashboard-grid"><section><div class="sec-head" style="margin-bottom:14px"><h2 style="font-size:24px">Recent booking activity</h2><a href="bookings.html">View all</a></div>'+
    (recent?'<div class="rows">'+recent+'</div>':'<div class="empty" style="grid-column:auto"><h3>No booking requests yet</h3><p>When a musician requests a session with you, it will appear here.</p></div>')+
    '</section><aside class="box"><h2 style="font-size:22px;margin-bottom:10px">Your accompanist tools</h2><div class="dashboard-linklist"><a href="my-profile.html"><span>Public profile</span><span aria-hidden="true">→</span></a><a href="bookings.html?f=action"><span>Requests needing attention</span><span aria-hidden="true">→</span></a><a href="reviews.html"><span>Reviews</span><span aria-hidden="true">→</span></a><a href="settings.html"><span>Account settings</span><span aria-hidden="true">→</span></a></div></aside></div>'+
    (u.role==="both"?'<div class="banner" style="margin-top:20px">You can also use Accord to find an accompanist for yourself. <a href="musician-dashboard.html">Switch to musician dashboard</a>.</div>':'');
  return {title:"Accompanist Dashboard – Accord",html:dashShell("",inner)};
}
mount(viewAccompanistDashboard, "");

// Load real booking requests addressed to this accompanist.
async function loadAccompanistDashboardBookings() {
  const user = me();

  if (!user) return;

  const { data, error } = await supabaseClient
    .from("booking_requests")
    .select("*")
    .eq("pianist_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not load accompanist bookings:", error);
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

  // Update the dashboard's statistics.
  const stats = document.querySelectorAll("#view .stats .stat b");

  if (stats.length >= 3) {
    stats[0].textContent = bookings.length;
    stats[1].textContent = upcoming.length;
    stats[2].textContent = pending.length;
  }

  // Display the latest incoming booking requests.
  const sections = document.querySelectorAll(
    "#view .dashboard-grid section"
  );

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
      '<h3>No booking requests yet</h3>' +
      '<p>New requests from musicians will appear here.</p>' +
      '</div>';

    return;
  }

container.innerHTML = bookings.slice(0, 4).map(booking => {
  const date = booking.event_date || "Date not specified";
  const time = booking.event_time
    ? booking.event_time.slice(0, 5)
    : "Time not specified";

  const status = booking.status || "pending";

  const responseButtons = status === "pending"
    ? `
      <div class="booking-actions" style="display:flex;gap:8px;margin-top:12px;">
        <button
          type="button"
          class="btn primary"
          data-booking-action="accepted"
          data-booking-id="${esc(booking.id)}"
        >
          Accept
        </button>
        <button
          type="button"
          class="btn"
          data-booking-action="declined"
          data-booking-id="${esc(booking.id)}"
        >
          Decline
        </button>
      </div>
    `
    : "";

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
        <div class="meta">
          ${esc(booking.message || "No additional message")}
        </div>
        ${responseButtons}
      </div>
      <span class="pill">${esc(status)}</span>
    </div>
  `;
}).join("");
}

// Wait for authentication before loading bookings.
AUTH_READY.then(loadAccompanistDashboardBookings);
// Handle Accept and Decline actions on booking requests.
document.addEventListener("click", async function (event) {
  const button = event.target.closest("[data-booking-action]");

  if (!button) return;

  const bookingId = button.dataset.bookingId;
  const response = button.dataset.bookingAction;

  if (!bookingId || !["accepted", "declined"].includes(response)) {
    return;
  }

  const actionLabel = response === "accepted" ? "accept" : "decline";

  if (!window.confirm(`Are you sure you want to ${actionLabel} this booking?`)) {
    return;
  }

  const originalText = button.textContent;

  button.disabled = true;
  button.textContent = "Saving...";

  const { error } = await supabaseClient.rpc("respond_to_booking", {
    p_booking_id: bookingId,
    p_response: response
  });

  if (error) {
    console.error("Could not respond to booking:", error);
    alert("We couldn't update this booking. Please refresh and try again.");
    button.disabled = false;
    button.textContent = originalText;
    return;
  }

  alert(`Booking ${response} successfully.`);

  // Reload the dashboard so the updated status appears.
  await loadAccompanistDashboardBookings();
});
