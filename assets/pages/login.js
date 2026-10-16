```javascript
/* Login page — Supabase Authentication */

function viewLogin(c) {
  var html =
    '<div class="wrap page">' +
      '<div class="auth">' +
        '<h1>Log in</h1>' +
        '<p class="sub">New here? ' +
          '<a href="signup.html">Create an account</a>.</p>' +

        '<form class="box form" data-form="login" ' +
          'data-next="' + esc(c.params.get("next") || "") + '" ' +
          'novalidate>' +

          '<div class="field">' +
            '<label for="le">Email address</label>' +
            '<input id="le" name="le" type="email" ' +
              'autocomplete="email" required>' +
          '</div>' +

          '<div class="field">' +
            '<label for="lp">Password</label>' +
            '<input id="lp" name="lp" type="password" ' +
              'autocomplete="current-password" required>' +
          '</div>' +

          '<p class="err" data-err role="alert" hidden></p>' +

          '<button class="btn primary" type="submit">' +
            'Log in' +
          '</button>' +
        '</form>' +
      '</div>' +
    '</div>';

  return {
    title: "Log in – Accord",
    html: html
  };
}


/* Authenticate with Supabase. */

FORMS.login = async function (f) {
  var email = f.elements.le.value.trim().toLowerCase();
  var password = f.elements.lp.value;

  if (!email) {
    return fail(f, "Please enter your email address.");
  }

  if (!password) {
    return fail(f, "Please enter your password.");
  }

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient.auth
  ) {
    return fail(
      f,
      "The account service could not load. Please refresh and try again."
    );
  }

  var button = f.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Logging in…";

  try {
    var result = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (result.error) {
      throw result.error;
    }

    var next = safeNext(f.dataset.next);
    go(next || "dashboard.html");

  } catch (error) {
    console.error("Login error:", error);

    fail(
      f,
      "We couldn't log you in. Check your email and password, and make sure you've confirmed your email if required."
    );

    button.disabled = false;
    button.textContent = "Log in";
  }
};

mount(viewLogin, "");
```
