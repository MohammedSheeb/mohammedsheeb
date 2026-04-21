const userId = "1481454957512101950";

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
  const customEmojiEl = document.getElementById("customStatusEmoji");
  const customTextEl = document.getElementById("customStatusText");

  if (!customEl || !customEmojiEl || !customTextEl) return;

  const custom = activities.find(a => a.type === 4);

  if (custom) {
    customTextEl.innerText = custom.state || "";
    customEmojiEl.innerHTML = "";

    if (custom.emoji) {
      if (!custom.emoji.id && custom.emoji.name) {
        customEmojiEl.textContent = custom.emoji.name;
      } else if (custom.emoji.id) {
        const emojiExt = custom.emoji.animated ? "gif" : "png";
        const emojiUrl = `https://cdn.discordapp.com/emojis/${custom.emoji.id}.${emojiExt}?size=64&quality=lossless`;
        customEmojiEl.innerHTML = `<img src="${emojiUrl}" alt="">`;
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

function renderDiscordPresence(payload) {
  const user = payload.discord_user;
  const status = payload.discord_status;
  const activities = payload.activities || [];
  const spotify = payload.spotify;
  const listeningToSpotify = payload.listening_to_spotify;

  const isAnimated = user.avatar && user.avatar.startsWith("a_");
  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isAnimated ? "gif" : "png"}`;

  document.getElementById("avatar").src = avatarUrl;
  document.getElementById("displayName").innerText = user.global_name ? user.global_name : user.username;
  document.getElementById("tag").innerText = user.username;
  document.getElementById("dot").className = "status-dot " + status;

  applyAvatarDecoration(user);
  applyCustomStatus(activities);

  resetActivityTimer();

  if (listeningToSpotify && spotify) {
    setSpotifyActivity(spotify);
    return;
  }

  const activity =
    activities.find(a => a.type === 0) ||
    activities.find(a => a.type === 1) ||
    activities.find(a => a.type === 3) ||
    activities.find(a => a.type === 5);

  if (activity) {
    setOtherActivity(activity);
  } else {
    setFallbackActivity();
  }
}

async function loadDiscord() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();
    renderDiscordPresence(data.data);
  } catch (e) {
    console.error("Failed to load Discord data", e);
  }
}

function connectLanyard() {
  const socket = new WebSocket("wss://api.lanyard.rest/socket");

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({
      op: 2,
      d: {
        subscribe_to_id: userId
      }
    }));
  });

  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);

    if (payload.op === 1) {
      socket.send(JSON.stringify({ op: 3 }));
      return;
    }

    if (payload.t === "INIT_STATE" && payload.d) {
      renderDiscordPresence(payload.d);
    }

    if (payload.t === "PRESENCE_UPDATE" && payload.d) {
      renderDiscordPresence(payload.d);
    }
  });

  socket.addEventListener("close", () => {
    setTimeout(connectLanyard, 3000);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}
