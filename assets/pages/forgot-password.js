/* Password recovery request for Accord. */
(function () {
  var form = document.getElementById("forgotForm");
  if (!form) return;
  var emailInput = document.getElementById("recoveryEmail");
  var errorBox = document.getElementById("recoveryError");
  var statusBox = document.getElementById("recoveryStatus");
  var submitButton = document.getElementById("recoverySubmit");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    statusBox.hidden = true;
    var email = emailInput.value.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errorBox.textContent = "Please enter a valid email address.";
      errorBox.hidden = false;
      emailInput.focus();
      return;
    }
    if (typeof supabaseClient === "undefined" || !supabaseClient.auth) {
      errorBox.textContent = "The account service could not load. Please refresh the page and try again.";
      errorBox.hidden = false;
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    var requestSent = false;
    try {
      var redirectTo = new URL("reset-password.html", window.location.href).href;
      var result = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
      if (result.error) throw result.error;
      statusBox.textContent = "If an Accord account is associated with that email, a password-reset link will arrive shortly. Check your inbox and spam folder.";
      statusBox.hidden = false;
      requestSent = true;
      form.querySelectorAll("input,button").forEach(function (element) { element.disabled = true; });
    } catch (error) {
      console.error("Password recovery request failed:", error);
      /* Keep the response generic so the page does not reveal whether an email is registered. */
      statusBox.textContent = "If an Accord account is associated with that email, a password-reset link will arrive shortly. If you do not receive it, wait a little and try again.";
      statusBox.hidden = false;
    } finally {
      if (!requestSent) {
        submitButton.disabled = false;
        submitButton.textContent = "Send reset link";
      }
    }
  });
})();
