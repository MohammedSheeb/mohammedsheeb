const userId = "759076162935717901";
let activityInterval = null;

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

function formatTime(seconds) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatTimeLong(seconds) {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function resetActivityTimer() {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
}

function hideActivity() {
  const activityCard = document.getElementById("activityCard");
  if (activityCard) activityCard.style.display = "none";
}

function showActivityBase() {
  const activityCard = document.getElementById("activityCard");
  const spotifyHeader = document.getElementById("spotifyHeader");
  const spotifyProgressWrap = document.getElementById("spotifyProgressWrap");
  const activityCover = document.getElementById("activityCover");
  const activityIconFallback = document.getElementById("activityIconFallback");
  const progressBar = document.getElementById("progressBar");
  const timeCurrent = document.getElementById("timeCurrent");
  const timeTotal = document.getElementById("timeTotal");

  if (!activityCard) return false;

  activityCard.style.display = "flex";

  if (spotifyHeader) spotifyHeader.style.display = "none";
  if (spotifyProgressWrap) spotifyProgressWrap.style.display = "none";
  if (activityCover) activityCover.style.display = "none";
  if (activityIconFallback) activityIconFallback.style.display = "none";
  if (progressBar) progressBar.style.width = "0%";
  if (timeCurrent) timeCurrent.innerText = "";
  if (timeTotal) timeTotal.innerText = "";

  return true;
}

function setSpotifyActivity(spotify) {
  resetActivityTimer();

  const activityCard = document.getElementById("activityCard");
  const activityName = document.getElementById("activityName");
  const activityArtist = document.getElementById("activityArtist");
  const activityCover = document.getElementById("activityCover");
  const progressBar = document.getElementById("progressBar");
  const timeCurrent = document.getElementById("timeCurrent");
  const timeTotal = document.getElementById("timeTotal");
  const spotifyHeader = document.getElementById("spotifyHeader");
  const spotifyProgressWrap = document.getElementById("spotifyProgressWrap");
  const activityIconFallback = document.getElementById("activityIconFallback");

  if (!activityCard || !activityName || !activityArtist || !activityCover) return;

  activityCard.style.display = "flex";

  if (spotifyHeader) {
    spotifyHeader.style.display = "flex";
    spotifyHeader.innerHTML = `<span>Listening to Spotify</span><i class="fab fa-spotify" aria-hidden="true"></i>`;
  }

  if (spotifyProgressWrap) spotifyProgressWrap.style.display = "block";
  if (activityIconFallback) activityIconFallback.style.display = "none";

  activityName.innerText = spotify.song || "Spotify";
  activityArtist.innerText = spotify.artist || "";
  activityCover.src = spotify.album_art_url || "";
  activityCover.style.display = "block";

  const start = spotify.timestamps?.start;
  const end = spotify.timestamps?.end;

  if (start && end && end > start && progressBar && timeCurrent && timeTotal) {
    const update = () => {
      const now = Date.now();
      const total = Math.max(1, Math.floor((end - start) / 1000));
      const current = Math.max(0, Math.floor((now - start) / 1000));
      const percent = Math.min(100, Math.max(0, (current / total) * 100));

      progressBar.style.width = `${percent}%`;
      timeCurrent.innerText = formatTime(current);
      timeTotal.innerText = formatTime(total);
    };

    update();
    activityInterval = setInterval(update, 1000);
  }
}

function getActivityImage(activity) {
  const largeImage = activity.assets?.large_image;

  if (!largeImage) return "";

  if (largeImage.startsWith("mp:external/")) {
    return `https://media.discordapp.net/${largeImage.slice(3)}`;
  }

  if (largeImage.startsWith("spotify:")) {
    return `https://i.scdn.co/image/${largeImage.replace("spotify:", "")}`;
  }

  if (activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImage}.png`;
  }

  return "";
}

function setGameActivity(activity) {
  resetActivityTimer();

  const activityName = document.getElementById("activityName");
  const activityArtist = document.getElementById("activityArtist");
  const activityCover = document.getElementById("activityCover");
  const spotifyHeader = document.getElementById("spotifyHeader");
  const spotifyProgressWrap = document.getElementById("spotifyProgressWrap");
  const activityIconFallback = document.getElementById("activityIconFallback");

  if (!showActivityBase() || !activityName || !activityArtist || !activityCover) return;

  if (spotifyHeader) {
    spotifyHeader.style.display = "flex";
    spotifyHeader.innerHTML = `<span>Playing</span>`;
  }

  if (spotifyProgressWrap) {
    spotifyProgressWrap.style.display = "none";
  }

  activityName.innerText = activity.name || "Game";

  const details = activity.details || "";
  const state = activity.state || "";
  const start = activity.timestamps?.start;

  const updateGameText = () => {
    let html = "";

    if (details) {
      html += `<div>${details}</div>`;
    }

    if (state) {
      html += `<div>${state}</div>`;
    }

    if (start) {
      const seconds = Math.floor((Date.now() - start) / 1000);
      html += `
        <div class="game-time">
          <i class="fas fa-gamepad" aria-hidden="true"></i>
          <span>${formatTimeLong(seconds)}</span>
        </div>
      `;
    }

    activityArtist.innerHTML = html || `<div>Playing</div>`;
  };

  updateGameText();

  if (start) {
    activityInterval = setInterval(updateGameText, 1000);
  }

  const imageUrl = getActivityImage(activity);

  if (imageUrl) {
    activityCover.src = imageUrl;
    activityCover.style.display = "block";
    if (activityIconFallback) activityIconFallback.style.display = "none";
  } else {
    activityCover.removeAttribute("src");
    activityCover.style.display = "none";

    if (activityIconFallback) {
      activityIconFallback.innerHTML = '<i class="fas fa-gamepad" aria-hidden="true"></i>';
      activityIconFallback.style.display = "flex";
    }
  }
}

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

function applyCustomStatus(activities) {
  const customEl = document.getElementById("customStatus");
  const emojiEl = document.getElementById("customStatusEmoji");
  const textEl = document.getElementById("customStatusText");

  if (!customEl || !emojiEl || !textEl) return;

  const custom = activities.find((a) => a.type === 4);

  if (!custom) {
    customEl.style.display = "none";
    emojiEl.innerHTML = "";
    textEl.innerText = "";
    return;
  }

  textEl.innerText = custom.state || "";
  emojiEl.innerHTML = "";

  if (custom.emoji) {
    if (!custom.emoji.id && custom.emoji.name) {
      emojiEl.textContent = custom.emoji.name;
    } else if (custom.emoji.id) {
      const ext = custom.emoji.animated ? "gif" : "png";
      emojiEl.innerHTML = `<img src="https://cdn.discordapp.com/emojis/${custom.emoji.id}.${ext}?size=64&quality=lossless" alt="">`;
    }
  }

  customEl.style.display = custom.state || custom.emoji ? "flex" : "none";
}

function renderDiscordPresence(payload) {
  if (!payload || !payload.discord_user) return;

  const user = payload.discord_user;
  const status = payload.discord_status || "offline";
  const activities = payload.activities || [];
  const spotify = payload.spotify;
  const listening = payload.listening_to_spotify;

  const avatar = document.getElementById("avatar");
  const name = document.getElementById("displayName");
  const tag = document.getElementById("tag");

  if (!avatar || !name || !tag) return;

  const avatarExt = user.avatar?.startsWith("a_") ? "gif" : "png";

  avatar.src = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=256`
    : "https://cdn.discordapp.com/embed/avatars/0.png";

  name.innerText = user.global_name || user.username || "Unknown";
  tag.innerText = user.username || "username";

  updateStatus(status);
  applyAvatarDecoration(user);
  applyCustomStatus(activities);
  resetActivityTimer();

  if (listening && spotify) {
    setSpotifyActivity(spotify);
    return;
  }

  const gameActivity = activities.find((activity) => activity.type === 0);

  if (gameActivity) {
    setGameActivity(gameActivity);
    return;
  }

  hideActivity();
}

async function loadDiscord() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();

    if (data?.success && data.data) {
      renderDiscordPresence(data.data);
    }
  } catch {
    hideActivity();
  }
}

function connectLanyard() {
  const socket = new WebSocket("wss://api.lanyard.rest/socket");

  socket.onopen = () => {
    socket.send(JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: userId
      }
    }));
  };

  socket.onmessage = (event) => {
    const payload = JSON.parse(event.data);

    if (payload.op === 1) {
      socket.send(JSON.stringify({ op: 3 }));
      return;
    }

    if ((payload.t === "INIT_STATE" || payload.t === "PRESENCE_UPDATE") && payload.d) {
      renderDiscordPresence(payload.d);
    }
  };

  socket.onclose = () => setTimeout(connectLanyard, 3000);
  socket.onerror = () => socket.close();
}

const header = document.getElementById("siteHeader");

window.addEventListener("scroll", () => {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
});

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    siteNav.classList.toggle("open");
    menuToggle.classList.toggle("active");

    const expanded = siteNav.classList.contains("open");
    menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const socialLinks = document.querySelectorAll(".icons a");

socialLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setTimeout(() => link.blur(), 0);
  });

  link.addEventListener("mouseup", () => link.blur());
  link.addEventListener("touchend", () => link.blur());
});

window.addEventListener("pageshow", () => {
  socialLinks.forEach((link) => link.blur());
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    socialLinks.forEach((link) => link.blur());
  }
});

document.addEventListener("contextmenu", (e) => {
  if (e.target.tagName === "IMG" && !e.target.closest(".logo")) {
    e.preventDefault();
  }
});

document.querySelectorAll("img").forEach((img) => {
  if (img.closest(".logo")) return;

  img.addEventListener("dragstart", (e) => e.preventDefault());

  img.addEventListener("mousedown", (e) => {
    if (e.button === 2) e.preventDefault();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadDiscord();
  connectLanyard();

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});