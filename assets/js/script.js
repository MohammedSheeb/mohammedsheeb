const userId = "1481454957512101950";
let activityInterval = null;

/* =========================
   STATUS ICON (NEW)
========================= */
function updateStatus(status) {
  const icon = document.getElementById("statusIcon");
  if (!icon) return;

  const map = {
    online: "/assets/images/status/online.svg",
    idle: "/assets/images/status/idle.svg",
    dnd: "/assets/images/status/dnd.svg",
    offline: "/assets/images/status/offline.svg"
  };

  icon.src = map[status] || map.offline;
}

/* =========================
   TIME FORMAT
========================= */
function formatTime(seconds) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/* =========================
   RESET TIMER
========================= */
function resetActivityTimer() {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
}

/* =========================
   HIDE ACTIVITY (IMPORTANT)
========================= */
function hideActivity() {
  const activityCard = document.getElementById("activityCard");
  if (activityCard) {
    activityCard.style.display = "none";
  }
}

/* =========================
   SPOTIFY
========================= */
function setSpotifyActivity(spotify) {
  const activityCard = document.getElementById("activityCard");
  const activityName = document.getElementById("activityName");
  const activityArtist = document.getElementById("activityArtist");
  const activityCover = document.getElementById("activityCover");
  const progressBar = document.getElementById("progressBar");
  const timeCurrent = document.getElementById("timeCurrent");
  const timeTotal = document.getElementById("timeTotal");
  const spotifyHeader = document.getElementById("spotifyHeader");
  const spotifyProgressWrap = document.getElementById("spotifyProgressWrap");

  if (!activityCard) return;

  activityCard.style.display = "flex";
  spotifyHeader.style.display = "flex";
  spotifyProgressWrap.style.display = "block";

  activityName.innerText = spotify.song || "Spotify";
  activityArtist.innerText = spotify.artist || "";
  activityCover.src = spotify.album_art_url || "";
  activityCover.style.display = "block";

  const start = spotify.timestamps?.start;
  const end = spotify.timestamps?.end;

  if (start && end) {
    const update = () => {
      const now = Date.now();
      const total = Math.floor((end - start) / 1000);
      const current = Math.floor((now - start) / 1000);

      const percent = Math.min(100, (current / total) * 100);
      progressBar.style.width = percent + "%";

      timeCurrent.innerText = formatTime(current);
      timeTotal.innerText = formatTime(total);
    };

    update();
    activityInterval = setInterval(update, 1000);
  }
}

/* =========================
   AVATAR FRAME
========================= */
function applyAvatarDecoration(user) {
  const frameEl = document.getElementById("avatarFrame");
  if (!frameEl) return;

  const decoration = user.avatar_decoration_data;

  if (decoration && decoration.asset) {
    const asset = decoration.asset;
    frameEl.src = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;
    frameEl.style.display = "block";
  } else {
    frameEl.style.display = "none";
  }
}

/* =========================
   CUSTOM STATUS
========================= */
function applyCustomStatus(activities) {
  const customEl = document.getElementById("customStatus");
  const emojiEl = document.getElementById("customStatusEmoji");
  const textEl = document.getElementById("customStatusText");

  if (!customEl) return;

  const custom = activities.find(a => a.type === 4);

  if (custom) {
    textEl.innerText = custom.state || "";
    emojiEl.innerHTML = "";

    if (custom.emoji?.name) {
      emojiEl.textContent = custom.emoji.name;
    }

    customEl.style.display = "flex";
  } else {
    customEl.style.display = "none";
  }
}

/* =========================
   MAIN RENDER
========================= */
function renderDiscordPresence(payload) {
  if (!payload) return;

  const user = payload.discord_user;
  const status = payload.discord_status || "offline";
  const activities = payload.activities || [];
  const spotify = payload.spotify;
  const listening = payload.listening_to_spotify;

  const avatar = document.getElementById("avatar");
  const name = document.getElementById("displayName");
  const tag = document.getElementById("tag");

  if (!avatar || !name || !tag) return;

  /* avatar */
  avatar.src = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  name.innerText = user.global_name || user.username;
  tag.innerText = user.username; // بدون @

  /* 🔥 status icon */
  updateStatus(status);

  applyAvatarDecoration(user);
  applyCustomStatus(activities);

  resetActivityTimer();

  /* 🔥 فقط Spotify يظهر */
  if (listening && spotify) {
    setSpotifyActivity(spotify);
  } else {
    hideActivity(); // 🔥 يخفي البوكس بالكامل
  }
}

/* =========================
   LOAD DATA
========================= */
async function loadDiscord() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();

    if (data.success) {
      renderDiscordPresence(data.data);
    }
  } catch {
    hideActivity();
  }
}

/* =========================
   LIVE SOCKET
========================= */
function connectLanyard() {
  const socket = new WebSocket("wss://api.lanyard.rest/socket");

  socket.onopen = () => {
    socket.send(JSON.stringify({
      op: 2,
      d: { subscribe_to_id: userId }
    }));
  };

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    if (payload.op === 1) {
      socket.send(JSON.stringify({ op: 3 }));
      return;
    }

    if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
      renderDiscordPresence(payload.d);
    }
  };

  socket.onclose = () => setTimeout(connectLanyard, 3000);
  socket.onerror = () => socket.close();
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadDiscord();
  connectLanyard();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});