const userId = "1481454957512101950";

let activityInterval = null;

/* =========================
   UTILS
========================= */

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/* =========================
   AVATAR EFFECT
========================= */

function applyAvatarDecoration(user) {
  const frameEl = document.getElementById("avatarFrame");
  if (!frameEl) return;

  const decoration = user.avatar_decoration_data;

  if (decoration && decoration.asset) {
    const asset = decoration.asset;
    const gifUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.gif`;
    const pngUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${asset}.png`;

    const testImg = new Image();

    testImg.onload = () => {
      frameEl.src = gifUrl;
      frameEl.style.display = "block";
    };

    testImg.onerror = () => {
      frameEl.src = pngUrl;
      frameEl.style.display = "block";
    };

    testImg.src = gifUrl;
  } else {
    frameEl.style.display = "none";
    frameEl.removeAttribute("src");
  }
}

/* =========================
   CUSTOM STATUS
========================= */

function applyCustomStatus(activities) {
  const customEl = document.getElementById("customStatus");
  const customEmojiEl = document.getElementById("customStatusEmoji");
  const customTextEl = document.getElementById("customStatusText");

  if (!customEl || !customEmojiEl || !customTextEl) return;

  const custom = activities.find(a => a.type === 4);

  if (custom) {
    customTextEl.innerText = custom.state || "";
    customEmojiEl.innerHTML = "";

    if (custom.emoji) {
      if (!custom.emoji.id) {
        customEmojiEl.textContent = custom.emoji.name || "";
      } else {
        const ext = custom.emoji.animated ? "gif" : "png";
        customEmojiEl.innerHTML = `<img src="https://cdn.discordapp.com/emojis/${custom.emoji.id}.${ext}?size=64&quality=lossless">`;
      }
    }

    if (!custom.state && !custom.emoji) {
      customEl.style.display = "none";
    } else {
      customEl.style.display = "flex";
    }
  } else {
    customEl.style.display = "none";
    customEmojiEl.innerHTML = "";
    customTextEl.innerText = "";
  }
}

/* =========================
   ACTIVITY
========================= */

function resetActivityTimer() {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
}

function setFallbackActivity() {
  document.getElementById("activityName").innerText = "Available";
  document.getElementById("activityArtist").innerText = "No activity right now";
  document.getElementById("activityCover").style.display = "none";
  document.getElementById("activityIconFallback").style.display = "flex";
}

function setSpotifyActivity(spotify) {
  const cover = document.getElementById("activityCover");
  const name = document.getElementById("activityName");
  const artist = document.getElementById("activityArtist");
  const bar = document.getElementById("progressBar");

  cover.src = spotify.album_art_url;
  cover.style.display = "block";

  name.innerText = spotify.song;
  artist.innerText = spotify.artist;

  const start = spotify.timestamps.start;
  const end = spotify.timestamps.end;

  const update = () => {
    const now = Date.now();
    const total = (end - start) / 1000;
    const current = (now - start) / 1000;
    const percent = Math.min(100, (current / total) * 100);

    bar.style.width = percent + "%";
  };

  update();
  activityInterval = setInterval(update, 1000);
}

function setOtherActivity(activity) {
  const name = document.getElementById("activityName");
  const artist = document.getElementById("activityArtist");
  const cover = document.getElementById("activityCover");

  name.innerText = activity.name;
  artist.innerText = activity.details || activity.state || "";

  if (activity.assets?.large_image) {
    cover.src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
    cover.style.display = "block";
  } else {
    cover.style.display = "none";
  }
}

/* =========================
   MAIN RENDER
========================= */

function renderDiscordPresence(payload) {
  const user = payload.discord_user;
  const activities = payload.activities || [];
  const spotify = payload.spotify;

  const isAnimated = user.avatar && user.avatar.startsWith("a_");
  const avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isAnimated ? "gif" : "png"}`;

  document.getElementById("avatar").src = avatar;
  document.getElementById("displayName").innerText = user.global_name || user.username;
  document.getElementById("tag").innerText = "@" + user.username;
  document.getElementById("dot").className = "status-dot " + payload.discord_status;

  applyAvatarDecoration(user);
  applyCustomStatus(activities);

  resetActivityTimer();

  if (payload.listening_to_spotify && spotify) {
    setSpotifyActivity(spotify);
    return;
  }

  const activity = activities.find(a => a.type === 0);

  if (activity) {
    setOtherActivity(activity);
  } else {
    setFallbackActivity();
  }
}

/* =========================
   API + SOCKET
========================= */

async function loadDiscord() {
  const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
  const data = await res.json();
  renderDiscordPresence(data.data);
}

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

    if (payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") {
      renderDiscordPresence(payload.d);
    }
  };

  socket.onclose = () => setTimeout(connectLanyard, 3000);
}

/* =========================
   INIT
========================= */

loadDiscord();
connectLanyard();