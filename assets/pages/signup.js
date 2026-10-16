/* Signup page — Supabase Authentication */

function viewSignup(c) {
  var role =
    c.params.get("role") === "pianist"
      ? "pianist"
      : "musician";

  var html =
    '<div class="wrap page">' +
      '<div class="auth">' +
        '<h1>Create your account</h1>' +
        '<p class="sub">Free to join. Already have an account? ' +
          '<a href="login.html">Log in</a>.</p>' +

        '<form class="box form" data-form="signup" ' +
          'data-next="' + esc(c.params.get("next") || "") + '" ' +
          'novalidate>' +

          '<div class="roles" role="radiogroup" aria-label="I am a">' +
            '<label class="role">' +
              '<input type="radio" name="role" value="musician"' +
              (role === "musician" ? " checked" : "") + '>' +
              '<span><b>Musician</b>' +
              '<small>I need an accompanist</small></span>' +
            '</label>' +

            '<label class="role">' +
              '<input type="radio" name="role" value="pianist"' +
              (role === "pianist" ? " checked" : "") + '>' +
              '<span><b>Accompanist</b>' +
              '<small>I am an accompanist</small></span>' +
            '</label>' +
          '</div>' +

          '<div class="field">' +
            '<label for="sn">Your name</label>' +
            '<input id="sn" name="sn" maxlength="80" ' +
              'autocomplete="name" required>' +
          '</div>' +

          '<div class="field">' +
            '<label for="se">Email address</label>' +
            '<input id="se" name="se" type="email" ' +
              'autocomplete="email" required>' +
          '</div>' +

          '<div class="field">' +
            '<label for="sp">Password</label>' +
            '<input id="sp" name="sp" type="password" ' +
              'autocomplete="new-password" minlength="8" required>' +
            '<small>Use at least 8 characters.</small>' +
          '</div>' +

          '<div class="field">' +
            '<label for="sc">Confirm password</label>' +
            '<input id="sc" name="sc" type="password" ' +
              'autocomplete="new-password" minlength="8" required>' +
          '</div>' +

          '<p class="err" data-err role="alert" hidden></p>' +

          '<button class="btn primary" type="submit">' +
            'Create account' +
          '</button>' +

        '</form>' +
      '</div>' +
    '</div>';

  return {
    title: "Sign up – Accord",
    html: html
  };
}


/* Register a new account with Supabase. */

FORMS.signup = async function (f) {
  var name = f.elements.sn.value.trim();
  var email = f.elements.se.value.trim().toLowerCase();
  var password = f.elements.sp.value;
  var confirmPassword = f.elements.sc.value;

  var roleInput = f.querySelector(
    'input[name="role"]:checked'
  );

  var role = roleInput ? roleInput.value : "musician";

  if (!name) {
    return fail(f, "Please enter your name.");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return fail(f, "Please enter a valid email address.");
  }

 // Password requirements
var passwordErrors = [];

if (password.length < 8) {
  passwordErrors.push("At least 8 characters");
}

if (!/[A-Z]/.test(password)) {
  passwordErrors.push("At least one uppercase letter (A-Z)");
}

if (!/[a-z]/.test(password)) {
  passwordErrors.push("At least one lowercase letter (a-z)");
}

if (!/[0-9]/.test(password)) {
  passwordErrors.push("At least one number (0-9)");
}

if (passwordErrors.length > 0) {
  alert("Please fix your password:\n\n" + passwordErrors.join("\n"));
  return;
}

  if (password !== confirmPassword) {
    return fail(f, "Your passwords do not match.");
  }

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient.auth
  ) {
    return fail(
      f,
      "The account service could not load. Please refresh the page and try again."
    );
  }

  var button = f.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = "Creating account…";

  try {
    var result = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });

    if (result.error) {
      throw result.error;
    }

    alert(
      result.data.session
        ? "Your account was created successfully. We will connect your new account to the dashboard next."
        : "Your registration was submitted. Check your email for a confirmation link if email confirmation is enabled. We will connect login and your dashboard next."
    );

    /*
     * Do not test the full login flow yet.
     * We still need to update login.js and app.js
     * to recognize Supabase accounts.
     */

  } catch (error) {
    console.error("Signup error:", error);

    var message =
      error.message ||
      "We couldn't create your account. Please try again.";

    if (
      /already registered|already exists|user already/i.test(message)
    ) {
      message =
        "An account may already exist with this email. Try logging in instead.";
    }

    fail(f, message);

  } finally {
    button.disabled = false;
    button.textContent = "Create account";
  }
};

mount(viewSignup, "");
