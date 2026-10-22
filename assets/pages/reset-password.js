/* Set a new Accord password after the user opens the recovery email link. */
(function () {
  var form = document.getElementById("resetForm");
  if (!form) return;
  var intro = document.getElementById("resetIntro");
  var errorBox = document.getElementById("resetError");
  var statusBox = document.getElementById("resetStatus");
  var invalidBox = document.getElementById("resetInvalid");
  var submitButton = document.getElementById("resetSubmit");
  var ready = false;

  function showInvalid(message) {
    form.hidden = true;
    invalidBox.textContent = message;
    invalidBox.hidden = false;
    intro.textContent = "The password-reset link may have expired or already been used.";
  }

  async function initialize() {
    if (typeof supabaseClient === "undefined" || !supabaseClient.auth) {
      showInvalid("The account service could not load. Refresh the page and try again.");
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var authError = params.get("error_description") || params.get("error");
    if (authError) {
      showInvalid("This password-reset link is invalid or has expired. Please request a new one.");
      return;
    }

    try {
      var result = await supabaseClient.auth.getSession();
      if (result.error) throw result.error;
      if (!result.data.session) {
        showInvalid("We couldn't verify this reset link. Please request a new password-reset email and open the newest link on this device.");
        return;
      }
      ready = true;
      form.hidden = false;
      document.getElementById("newPassword").focus();
    } catch (error) {
      console.error("Could not validate password-reset session:", error);
      showInvalid("We couldn't verify this reset link. Please request a new password-reset email and open the newest link on this device.");
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    statusBox.hidden = true;
    if (!ready) {
      errorBox.textContent = "Your reset session is no longer valid. Request a new reset link.";
      errorBox.hidden = false;
      return;
    }

    var password = form.elements.password.value;
    var confirmPassword = form.elements.confirmPassword.value;
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      errorBox.textContent = "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a digit.";
      errorBox.hidden = false;
      return;
    }
    if (password !== confirmPassword) {
      errorBox.textContent = "The passwords do not match.";
      errorBox.hidden = false;
      form.elements.confirmPassword.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Updating…";
    try {
      var result = await supabaseClient.auth.updateUser({ password: password });
      if (result.error) throw result.error;
      ready = false;
      form.hidden = true;
      intro.textContent = "Your password has been updated successfully.";
      statusBox.textContent = "You can now log in to Accord using your new password.";
      statusBox.hidden = false;
      try { await supabaseClient.auth.signOut({ scope: "local" }); } catch (signOutError) {
        console.warn("Could not clear the local recovery session:", signOutError);
      }
      var back = document.querySelector(".recovery-back a");
      if (back) back.textContent = "Log in with your new password";
    } catch (error) {
      console.error("Password update failed:", error);
      errorBox.textContent = /expired|invalid|session/i.test(String(error && error.message || ""))
        ? "This reset link has expired or is no longer valid. Please request a new one."
        : "We couldn't update your password. Please try again, or request a new reset link.";
      errorBox.hidden = false;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Update password";
    }
  });

  initialize();
})();
