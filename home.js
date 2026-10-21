/* Page: index.html – search, how it works, and featured accompanists. */

function viewHome() {
  var top = listed()
    .slice()
    .sort(function(a, b) {
      return score(b) - score(a);
    })
    .slice(0, 3);

  var html =
    '<div class="hero"><div class="wrap">' +
      '<h1>Find a collaborative pianist who can <em>play with you.</em></h1>' +
      '<p class="lead">Search collaborative pianists near you, compare rates and experience, and request a booking in minutes. Built for conservatory students, teachers, and professionals.</p>' +
      '<div class="hero-cta">' +
        '<a class="btn primary lg" href="find.html">Find an Accompanist</a>' +
        '<a class="btn lg" href="become-accompanist.html">Become an Accompanist</a>' +
      '</div>' +

      '<form class="search s4" data-form="heroSearch" role="search">' +
        '<label><span>City or ZIP code</span><input name="loc" type="text" placeholder="e.g. Los Angeles or 90001" autocomplete="off"></label>' +
        '<label><span>Within</span><select name="r">' +
          opts(RADII.map(function(r) {
            return [r, r + " miles"];
          }), 25) +
        '</select></label>' +
        '<label><span>You play or sing</span><select name="inst">' +
          opts(INSTRUMENTS, "", "Any instrument") +
        '</select></label>' +
        '<button class="btn primary" type="submit">Search</button>' +
      '</form>' +

      '<div class="try"><span>Popular:</span>' +
        [
          ["Brahms", "Brahms sonatas"],
          ["Opera", "Opera auditions"],
          ["Suzuki", "Suzuki repertoire"],
          ["Jazz", "Jazz"],
          ["Competition", "Competition prep"]
        ].map(function(x) {
          return '<a href="find.html?q=' +
            encodeURIComponent(x[0]) + '">' + x[1] + '</a>';
        }).join("") +
      '</div>' +

      '<div class="kb-wrap">' +
        '<div class="kb-cap">' +
          '<div class="left">' +
            '<span>Try the keys</span>' +
            '<button class="linkbtn" type="button" data-action="labels" aria-pressed="false">Show note names</button>' +
          '</div>' +
          '<span id="np">Tap, drag across, or type A to K</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="kb" aria-label="Piano keyboard, two octaves from middle C">' +
      '<div class="kb-inner" id="kb"></div>' +
    '</div>' +
    '</div>' +

    '<div class="wrap">' +

      '<section class="sec">' +
        '<div class="sec-head">' +
          '<h2>Featured accompanists</h2>' +
          '<a class="btn" href="find.html">See all accompanists</a>' +
        '</div>' +

        '<div class="grid three" id="homeAccompanistCards">' +
          top.map(function(p) {
            return cardHTML(p, "");
          }).join("") +
        '</div>' +

        '<p class="note" id="homeAccompanistStatus" aria-live="polite"></p>' +
      '</section>' +

      '<section class="sec">' +
        '<div class="sec-head">' +
          '<h2>How it works</h2>' +
          '<a class="btn" href="how-it-works.html">Learn more</a>' +
        '</div>' +
        stepsHTML() +
      '</section>' +

      '<section class="sec">' +
        '<div class="sec-head"><h2>Why musicians use Accord</h2></div>' +
        '<div class="why">' +
          '<div>' +
            '<h3>Excellent matching</h3>' +
            '<p>Search by location, instrument, specialty, price, availability, and the repertoire an accompanist already knows.</p>' +
          '</div>' +
          '<div>' +
            '<h3>Trust and clarity</h3>' +
            '<p>Full profiles with education, rates, travel fees, languages and reviews from musicians who have booked before.</p>' +
          '</div>' +
          '<div>' +
            '<h3>Convenient booking</h3>' +
            '<p>Request a time online and track the answer in one place, instead of coordinating by text and email.</p>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="sec">' +
        '<div class="cta">' +
          '<div>' +
            '<h2>Are you an accompanist?</h2>' +
            '<p>Create a professional profile, set your rates and availability, and receive booking requests from musicians near you.</p>' +
          '</div>' +
          '<a class="btn" href="signup.html?role=pianist">Create your profile</a>' +
        '</div>' +
      '</section>' +

    '</div>';

  return {
    title: "Accord – Find an accompanist",
    html: html,
    after: mountHome
  };
}


/* ---------- Supabase homepage listings ---------- */

function mountHome() {
  mountKeys();
  loadHomeAccompanists();
}


async function loadHomeAccompanists() {
  var grid = $("#homeAccompanistCards");
  var status = $("#homeAccompanistStatus");

  if (!grid) return;

  /*
   * Keep the existing sample cards visible if Supabase
   * is not available.
   */
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    if (status) {
      status.textContent =
        "Showing example profiles while live listings are being set up.";
    }
    return;
  }

  try {
    var result = await supabaseClient
      .from("profiles")
      .select(
        "id, first_name, last_name, role, city, state, bio, " +
        "pianist_profiles!inner(" +
          "hourly_rate, years_experience, instruments, " +
          "specialties, available_for_hire, is_published, created_at" +
        ")"
      )
      .in("role", ["pianist", "both"])
      .eq("pianist_profiles.is_published", true)
      .eq("pianist_profiles.available_for_hire", true)
      .not("pianist_profiles.hourly_rate", "is", null)
      .gt("pianist_profiles.hourly_rate", 0)
      .order("created_at", {
        foreignTable: "pianist_profiles",
        ascending: false
      })
      .limit(3);

    if (result.error) {
      throw result.error;
    }

    var rows = result.data || [];

    /*
     * Convert Supabase rows into the data format
     * expected by Accord's existing cardHTML() function.
     */
    var accompanists = rows.map(function(row) {
      var pp = row.pianist_profiles;

      if (Array.isArray(pp)) {
        pp = pp[0];
      }

      if (!pp) return null;

      var experience = Number(pp.years_experience || 0);
      var rate = Number(pp.hourly_rate);

      var level = experience >= 7
        ? "Established professional"
        : experience >= 3
          ? "Emerging professional"
          : "Student";

      return {
        id: row.id,
        ownerId: row.id,

        name: [row.first_name, row.last_name]
          .filter(Boolean)
          .join(" ") || "Accompanist",
        city: row.city || "Location not listed",
        state: row.state || "",
        bio: row.bio || "Collaborative pianist available for bookings.",

        exp: experience,
        level: level,

        inst: Array.isArray(pp.instruments)
          ? pp.instruments
          : [],

        specialties: Array.isArray(pp.specialties)
          ? pp.specialties
          : [],

        /*
         * The current card design expects service prices
         * inside a services object.
         */
        services: {
          "Rehearsal": rate
        },

        rep: [],
        purposes: ["Audition", "Competition", "Recital", "Rehearsal"],
        languages: ["English"],
        avail: {},

        travelFee: 0,
        travelRadius: 25,
        studio: false,

        photo: "",
        sample: false,
        rating: 0,
        reviews: 0,
        completed: 0,

        hidden: false,
        suspended: false
      };
    }).filter(function(p) {
      return p !== null;
    });

    /*
     * If real published listings exist, show them.
     * Otherwise, retain the original sample cards.
     */
    if (accompanists.length > 0) {
      grid.innerHTML = accompanists.map(function(p) {
        return cardHTML(p, "");
      }).join("");

      if (status) {
        status.textContent =
          "Showing published accompanist profiles from Accord.";
      }
    } else {
      if (status) {
        status.textContent =
          "Example profiles are shown while accompanists begin publishing their listings.";
      }
    }

  } catch (error) {
    console.error(
      "Could not load Accord homepage listings:",
      error
    );

    /*
     * A database error should not break the homepage
     * or the interactive piano keyboard.
     */
    if (status) {
      status.textContent =
        "Live listings are temporarily unavailable. Showing example profiles for now.";
    }
  }
}


/* ---------- Hero search ---------- */

FORMS.heroSearch = function(f) {
  var p = [];
  var loc = f.elements.loc.value.trim();
  var i = f.elements.inst.value;

  if (loc) {
    p.push("loc=" + encodeURIComponent(loc));
    p.push("r=" + f.elements.r.value);
  }

  if (i) {
    p.push("inst=" + encodeURIComponent(i));
  }

  go("find.html" + (p.length ? "?" + p.join("&") : ""));
};


ACTIONS.labels = function(b) {
  var on = $(".kb").classList.toggle("labels");

  b.setAttribute("aria-pressed", on);
  b.textContent = on ? "Hide note names" : "Show note names";
};


/* ---------- Piano keyboard ---------- */

var NOTES = [0, 2, 4, 5, 7, 9, 11];
var BLACK_AFTER = {0:1, 1:3, 3:6, 4:8, 5:10};
var NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

var WHITES = 15;
var keyEls = {};
var ctx = null;
var npT;
var dragging = false;
var lastKey = null;
var keyObserver = null;

function freq(semi) {
  return 261.63 * Math.pow(2, semi / 12);
}

function noteName(semi) {
  return NAMES[semi % 12] + (4 + Math.floor(semi / 12));
}

function mountKeys() {
  var kb = $("#kb");
  if (!kb) return;

  if (keyObserver) {
    keyObserver.disconnect();
  }

  var currentCount = 0;
  keyEls = {};

  function drawKeys() {
    var width = kb.clientWidth;

    if (!width) return;

    var nextCount = Math.max(14, Math.floor(width / 34));

    if (nextCount === currentCount) return;

    currentCount = nextCount;
    WHITES = nextCount;
    keyEls = {};
    kb.innerHTML = "";

    var whiteWidth = 100 / WHITES;

    for (var i = 0; i < WHITES; i++) {
      var sm = Math.floor(i / 7) * 12 + NOTES[i % 7];
      var b = document.createElement("button");

      b.className = "wk";
      b.type = "button";
      b.setAttribute("aria-label", "Play " + noteName(sm));
      b.dataset.semi = sm;

      b.innerHTML =
        '<span class="lbl" aria-hidden="true">' +
        noteName(sm) +
        '</span>';

      kb.appendChild(b);
      keyEls[sm] = b;
    }

    for (var j = 0; j < WHITES - 1; j++) {
      var o = j % 7;

      if (BLACK_AFTER.hasOwnProperty(o)) {
        var s2 = Math.floor(j / 7) * 12 + BLACK_AFTER[o];
        var bk = document.createElement("button");

        bk.className = "bk";
        bk.type = "button";
        bk.setAttribute("aria-label", "Play " + noteName(s2));
        bk.dataset.semi = s2;

        bk.innerHTML =
          '<span class="lbl" aria-hidden="true">' +
          NAMES[s2 % 12].replace("♯", "#") +
          '</span>';

        bk.style.left = ((j + 1) * whiteWidth) + "%";
        bk.style.width = (whiteWidth * 0.62) + "%";
        bk.style.marginLeft = (-whiteWidth * 0.31) + "%";

        kb.appendChild(bk);
        keyEls[s2] = bk;
      }
    }
  }

  drawKeys();

  if (window.ResizeObserver) {
    keyObserver = new ResizeObserver(drawKeys);
    keyObserver.observe(kb);
  } else {
    window.addEventListener("resize", drawKeys);
  }

  kb.addEventListener("pointerdown", function(e) {
    var k = e.target.closest("[data-semi]");
    if (!k) return;

    e.preventDefault();
    dragging = true;
    lastKey = k;

    try {
      k.releasePointerCapture(e.pointerId);
    } catch(x) {}

    play(+k.dataset.semi);
  });

  kb.addEventListener("pointermove", function(e) {
    if (!dragging) return;

    var el = document.elementFromPoint(e.clientX, e.clientY);
    var k = el && el.closest
      ? el.closest("[data-semi]")
      : null;

    if (k && k !== lastKey && kb.contains(k)) {
      lastKey = k;
      play(+k.dataset.semi);
    }
  });

  kb.addEventListener("click", function(e) {
    if (e.detail !== 0) return;

    var k = e.target.closest("[data-semi]");
    if (k) play(+k.dataset.semi);
  });
}


function readout(semi) {
  var np = $("#np");
  if (!np) return;

  np.textContent = noteName(semi);
  np.classList.add("on");

  clearTimeout(npT);

  npT = setTimeout(function() {
    var n = $("#np");

    if (n) {
      n.textContent = "Tap, drag across, or type A to K";
      n.classList.remove("on");
    }
  }, 1400);
}


function play(semi) {
  var el = keyEls[semi];

  if (el) {
    el.classList.add("down");

    setTimeout(function() {
      el.classList.remove("down");
    }, 160);
  }

  readout(semi);

  try {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;

      ctx = new AC();
    }

    if (ctx.state === "suspended") ctx.resume();

    var t = ctx.currentTime;
    var f = freq(semi);
    var g = ctx.createGain();

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.28, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 1.6);
    g.connect(ctx.destination);

    [[1, 1], [2, 0.35], [3, 0.12], [4, 0.05]].forEach(function(h) {
      var o = ctx.createOscillator();
      var hg = ctx.createGain();

      o.type = "sine";
      o.frequency.value = f * h[0];
      hg.gain.value = h[1];

      o.connect(hg);
      hg.connect(g);
      o.start(t);
      o.stop(t + 1.7);
    });

  } catch(e) {}
}


window.addEventListener("pointerup", function() {
  dragging = false;
  lastKey = null;
});

window.addEventListener("pointercancel", function() {
  dragging = false;
  lastKey = null;
});


var KEYMAP = {
  a:0, w:1, s:2, e:3, d:4, f:5, t:6,
  g:7, y:8, h:9, u:10, j:11, k:12,
  o:13, l:14, p:15, ";":16
};

document.addEventListener("keydown", function(e) {
  if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;

  var t = e.target.tagName;

  if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;

  var m = KEYMAP[e.key.toLowerCase()];

  if (m !== undefined && keyEls[m]) {
    play(m);
  }
});


mount(viewHome, "home");
