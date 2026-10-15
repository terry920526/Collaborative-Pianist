# Accord – Stage 1 (MVP) prototype

A multi-page static website for finding and booking collaborative pianists in Southern California.
No build step, no server code. Open the pages through any web server.

## Run it locally
    cd accord-site
    python3 -m http.server 8000
    # then visit http://localhost:8000

(Opening index.html straight from the folder works in some browsers, but Firefox treats each file as a
separate origin, so accounts would not carry between pages. Use a local server.)

## Host it
Upload the whole folder to any static host: Netlify, Cloudflare Pages, GitHub Pages, Vercel.
Point your own domain at it. No configuration is needed.

## Structure
    index.html               Home (two paths, search, how it works, top accompanists)
    find.html                Find an accompanist (city/ZIP + radius, instrument, specialty, price, level, language, date)
    pianist.html?id=…        Accompanist profile (all fields from the spec, 14-day availability, reviews, report)
    book.html?pianist=…      Booking request form (service, date, time, repertoire, location, live estimate)
    bookings.html            My bookings        booking.html?id=…   One booking (accept/decline/propose, pay status, review)
    dashboard.html           Overview           my-profile.html     Accompanist profile editor
    reviews.html  payments.html  notifications.html  settings.html  saved.html
    how-it-works.html  become-accompanist.html  help.html  signup.html  login.html
    admin.html?tab=…         Admin: overview metrics, users, profiles, bookings, reviews, reports, emails
    assets/styles.css        Shared stylesheet
    assets/data.js           Constants, Southern California places/ZIPs, 16 fictional sample accompanists
    assets/app.js            Shared core: storage, accounts, location math, pricing, bookings, header/footer
    assets/pages/*.js        One script per page

Edit the navigation or footer once, in assets/app.js (HEADER_HTML and FOOTER_HTML).

## What this prototype is, and is not
- All accounts and bookings are stored in each visitor's browser (localStorage). Nothing is shared between devices.
- Emails are simulated: see Notifications (per user) and Admin > Emails.
- No passwords. Log-in is by email only. The "Try as…" buttons create demo accounts, including an admin.
- Payments are tracked manually (Stage 1 "validation phase"). No money moves. Commission (15%) is calculated and tracked.
- Place and ZIP lookup uses a small built-in list of Southern California cities (assets/data.js, PLACES).

## To go live (next steps)
1. Backend and database for accounts, profiles, bookings, reviews (for example Supabase or Firebase).
2. Real authentication, with admin roles set on the server.
3. Transactional email (for example Resend or SendGrid) to replace the simulated notifications.
4. Geocoding for any ZIP code or address.
5. Stage 2: Stripe Connect for payments, commission and payouts; calendar conflict checks; refunds.
6. Review policies and terms with a qualified professional. Policies in help.html are drafts.
