/* =========================================================
   Accord Messaging
   File: assets/pages/messages.js
   ========================================================= */

var MESSAGE_ACTIVE_USER = null;
var MESSAGE_ROWS = [];
var MESSAGE_PROFILES = {};
var MESSAGE_LOADING = false;


/* ---------- Helpers ---------- */

function messageEscape(value) {
  return String(value == null ? "" : value).replace(
    /[&<>"']/g,
    function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    }
  );
}


function messageDisplayName(profile) {
  if (!profile) return "Accord member";

  var name = [
    profile.first_name,
    profile.last_name
  ].filter(Boolean).join(" ").trim();

  return name || "Accord member";
}


function messageTime(timestamp) {
  if (!timestamp) return "";

  var date = new Date(timestamp);

  if (isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}


/* ---------- Main page ---------- */

function viewMessages() {
  var g = guard();

  if (g) return g;

  var inner =
    '<section class="accord-messages">' +

      '<h1>Messages</h1>' +

      '<p class="lede">' +
        'Private conversations with musicians and accompanists.' +
      '</p>' +

      '<div id="message-error" class="banner warn" ' +
        'role="alert" hidden></div>' +

      '<div class="message-layout">' +

        '<aside class="message-sidebar">' +
          '<h2>Conversations</h2>' +
          '<div id="conversation-list">' +
            '<p class="note">Loading conversations...</p>' +
          '</div>' +
        '</aside>' +

        '<section class="message-chat" aria-label="Conversation">' +

          '<div id="message-chat-header" class="message-chat-header">' +
            '<p class="note">Select a conversation to begin.</p>' +
          '</div>' +

          '<div id="message-history" class="message-history" ' +
            'aria-live="polite">' +
          '</div>' +

          '<form id="message-form" class="message-form" hidden>' +

            '<label class="sr-only" for="message-input">' +
              'Your message' +
            '</label>' +

            '<textarea id="message-input" ' +
              'maxlength="5000" rows="3" required ' +
              'placeholder="Write a message..."></textarea>' +

            '<button class="btn primary" type="submit">' +
              'Send' +
            '</button>' +

          '</form>' +

        '</section>' +

      '</div>' +

    '</section>';

  return {
    title: "Messages – Accord",
    html: dashShell("messages", inner),

    after: function () {
      loadMessageConversations();
    }
  };
}


/* ---------- Error display ---------- */

function showMessageError(text) {
  var box = document.getElementById("message-error");

  if (!box) return;

  box.textContent = text;
  box.hidden = !text;
}


/* ---------- Load conversations ---------- */

async function loadMessageConversations() {
  if (MESSAGE_LOADING) return;

  MESSAGE_LOADING = true;

  try {
    var user = me();

    if (!user) {
      showMessageError("Please log in to view your messages.");
      return;
    }

    var result = await supabaseClient
      .from("messages")
      .select("id,sender_id,recipient_id,body,created_at,read_at")
      .or(
        "sender_id.eq." + user.id +
        ",recipient_id.eq." + user.id
      )
      .order("created_at", { ascending: false });

    if (result.error) throw result.error;

    MESSAGE_ROWS = result.data || [];

    var otherIds = [];

    MESSAGE_ROWS.forEach(function (message) {
      var otherId = message.sender_id === user.id
        ? message.recipient_id
        : message.sender_id;

      if (otherIds.indexOf(otherId) === -1) {
        otherIds.push(otherId);
      }
    });

    MESSAGE_PROFILES = {};

    if (otherIds.length) {
      var profilesResult = await supabaseClient
        .from("profiles")
        .select("id,first_name,last_name")
        .in("id", otherIds);

      if (profilesResult.error) {
        throw profilesResult.error;
      }

      (profilesResult.data || []).forEach(function (profile) {
        MESSAGE_PROFILES[profile.id] = profile;
      });
    }

    renderConversationList();

    if (
      MESSAGE_ACTIVE_USER &&
      otherIds.indexOf(MESSAGE_ACTIVE_USER) !== -1
    ) {
      renderMessageThread(MESSAGE_ACTIVE_USER);
    } else if (otherIds.length) {
      renderMessageThread(otherIds[0]);
    } else {
      renderEmptyConversation();
    }

  } catch (error) {
    console.error("Could not load Accord messages:", error);

    showMessageError(
      "We couldn't load your messages. Please refresh the page and try again."
    );

    var list = document.getElementById("conversation-list");

    if (list) {
      list.innerHTML =
        '<p class="note">Messages could not be loaded.</p>';
    }

  } finally {
    MESSAGE_LOADING = false;
  }
}


/* ---------- Conversation list ---------- */

function renderConversationList() {
  var user = me();
  var list = document.getElementById("conversation-list");

  if (!list || !user) return;

  var conversations = {};
  var unreadCounts = {};

  MESSAGE_ROWS.forEach(function (message) {
    var otherId = message.sender_id === user.id
      ? message.recipient_id
      : message.sender_id;

    if (!conversations[otherId]) {
      conversations[otherId] = message;
    }

    if (
      message.recipient_id === user.id &&
      !message.read_at
    ) {
      unreadCounts[otherId] =
        (unreadCounts[otherId] || 0) + 1;
    }
  });

  var ids = Object.keys(conversations);

  if (!ids.length) {
    list.innerHTML =
      '<div class="empty" style="grid-column:auto">' +
        '<h3>No conversations yet</h3>' +
        '<p>Visit an accompanist profile to start a conversation.</p>' +
        '<a class="btn primary" href="find.html">' +
          'Find an accompanist' +
        '</a>' +
      '</div>';

    return;
  }

  list.innerHTML = ids.map(function (id) {
    var latest = conversations[id];
    var profile = MESSAGE_PROFILES[id];
    var name = messageDisplayName(profile);

    var preview = latest.body || "";

    if (preview.length > 65) {
      preview = preview.slice(0, 65) + "...";
    }

    var unread = unreadCounts[id] || 0;

    return (
      '<button type="button" ' +
        'class="conversation-item' +
          (MESSAGE_ACTIVE_USER === id ? ' active' : '') +
        '" ' +
        'data-message-user="' + messageEscape(id) + '">' +

        '<span class="conversation-name">' +
          messageEscape(name) +
          (unread
            ? '<span class="message-unread">' + unread + '</span>'
            : '') +
        '</span>' +

        '<span class="conversation-preview">' +
          messageEscape(preview) +
        '</span>' +

        '<span class="conversation-time">' +
          messageEscape(messageTime(latest.created_at)) +
        '</span>' +

      '</button>'
    );
  }).join("");
}


/* ---------- Empty state ---------- */

function renderEmptyConversation() {
  var header = document.getElementById("message-chat-header");
  var history = document.getElementById("message-history");
  var form = document.getElementById("message-form");

  if (header) {
    header.innerHTML =
      '<h2>Your conversations</h2>' +
      '<p class="note">No messages yet.</p>';
  }

  if (history) {
    history.innerHTML =
      '<div class="empty" style="grid-column:auto">' +
        '<h3>Start a conversation</h3>' +
        '<p>Find an accompanist and send a message from their profile.</p>' +
        '<a class="btn primary" href="find.html">' +
          'Find an accompanist' +
        '</a>' +
      '</div>';
  }

  if (form) form.hidden = true;
}


/* ---------- Render a conversation ---------- */

function renderMessageThread(otherId) {
  MESSAGE_ACTIVE_USER = otherId;

  var user = me();

  var header = document.getElementById("message-chat-header");
  var history = document.getElementById("message-history");
  var form = document.getElementById("message-form");

  if (!user || !header || !history || !form) return;

  var profile = MESSAGE_PROFILES[otherId];
  var name = messageDisplayName(profile);

  header.innerHTML =
    '<h2>' + messageEscape(name) + '</h2>';

  var thread = MESSAGE_ROWS.filter(function (message) {
    return (
      (
        message.sender_id === user.id &&
        message.recipient_id === otherId
      ) ||
      (
        message.sender_id === otherId &&
        message.recipient_id === user.id
      )
    );
  });

  thread.sort(function (a, b) {
    return new Date(a.created_at) - new Date(b.created_at);
  });

  history.innerHTML = thread.map(function (message) {
    var mine = message.sender_id === user.id;

    return (
      '<article class="message-bubble' +
        (mine ? ' mine' : '') + '">' +

        '<p>' + messageEscape(message.body) + '</p>' +

        '<time datetime="' +
          messageEscape(message.created_at) + '">' +
          messageEscape(messageTime(message.created_at)) +
        '</time>' +

      '</article>'
    );
  }).join("");

  if (!thread.length) {
    history.innerHTML =
      '<p class="note message-empty-thread">' +
        'Send a message to start the conversation.' +
      '</p>';
  }

  form.hidden = false;

  renderConversationList();

  history.scrollTop = history.scrollHeight;
}


/* ---------- Send a message ---------- */

async function sendAccordMessage(event) {
  event.preventDefault();

  var user = me();
  var input = document.getElementById("message-input");
  var button = document.querySelector(
    '#message-form button[type="submit"]'
  );

  if (!user || !MESSAGE_ACTIVE_USER || !input) return;

  var body = input.value.trim();

  if (!body) return;

  if (body.length > 5000) {
    showMessageError("Messages cannot exceed 5,000 characters.");
    return;
  }

  if (button) button.disabled = true;

  showMessageError("");

  try {
    var result = await supabaseClient
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: MESSAGE_ACTIVE_USER,
        body: body
      });

    if (result.error) throw result.error;

    input.value = "";

    await loadMessageConversations();

  } catch (error) {
    console.error("Could not send Accord message:", error);

    showMessageError(
      "Your message could not be sent. Please try again."
    );

  } finally {
    if (button) button.disabled = false;
  }
}


/* ---------- Event listeners ---------- */

document.addEventListener("click", function (event) {
  var button = event.target.closest("[data-message-user]");

  if (!button) return;

  var otherId = button.getAttribute("data-message-user");

  if (otherId) {
    renderMessageThread(otherId);
  }
});


document.addEventListener("submit", function (event) {
  if (event.target && event.target.id === "message-form") {
    sendAccordMessage(event);
  }
});


/* ---------- Start page ---------- */

mount(viewMessages, "");
