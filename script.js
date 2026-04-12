const userId = "1481454957512101950";

let activityInterval;

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

async function loadDiscord() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const activities = data.data.activities || [];
    const spotify = data.data.spotify;
    const listeningToSpotify = data.data.listening_to_spotify;

    const isAnimated = user.avatar && user.avatar.startsWith("a_");
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isAnimated ? "gif" : "png"}`;
    document.getElementById("avatar").src = avatarUrl;

    const frameEl = document.getElementById("avatarFrame");
    if (frameEl) {
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
      }
    }

    const name = user.global_name ? user.global_name : user.username;
    document.getElementById("displayName").innerText = name;
    document.getElementById("tag").innerText = user.username;
    document.getElementById("dot").className = "status-dot " + status;

    const customEl = document.getElementById("customStatus");
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

    const custom = activities.find(a => a.type === 4);
    customEl.innerText = custom ? (custom.state || "") : "";

    clearInterval(activityInterval);

    if (listeningToSpotify && spotify) {
      activityCard.style.display = "flex";
      spotifyHeader.style.display = "flex";
      spotifyProgressWrap.style.display = "block";
      activityCover.style.display = "block";
      activityIconFallback.style.display = "none";

      activityName.innerText = spotify.song || "Spotify";
      activityArtist.innerText = spotify.artist || "";
      activityCover.src = spotify.album_art_url || "";

      const start = spotify.timestamps?.start;
      const end = spotify.timestamps?.end;

      if (start && end) {
        const updateSpotifyProgress = () => {
          const now = Date.now();
          const totalSeconds = Math.floor((end - start) / 1000);
          const currentSeconds = Math.floor((now - start) / 1000);
          const percent = Math.min(100, Math.max(0, (currentSeconds / totalSeconds) * 100));

          progressBar.style.width = `${percent}%`;
          timeCurrent.innerText = formatTime(currentSeconds);
          timeTotal.innerText = formatTime(totalSeconds);
        };

        updateSpotifyProgress();
        activityInterval = setInterval(updateSpotifyProgress, 1000);
      } else {
        progressBar.style.width = "0%";
        timeCurrent.innerText = "0:00";
        timeTotal.innerText = "0:00";
      }

      return;
    }

    const activity =
      activities.find(a => a.type === 0) ||
      activities.find(a => a.type === 1) ||
      activities.find(a => a.type === 3) ||
      activities.find(a => a.type === 5);

    spotifyHeader.style.display = "none";

    if (activity) {
      activityCard.style.display = "flex";
      activityName.innerText = activity.name || "Activity";
      activityArtist.innerText = activity.details || activity.state || "";
      spotifyProgressWrap.style.display = "none";

      const largeImage = activity.assets?.large_image;
      if (largeImage) {
        if (largeImage.startsWith("mp:external/")) {
          activityCover.src = `https://media.discordapp.net/${largeImage.slice(3)}`;
        } else {
          activityCover.src = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${largeImage}.png`;
        }
        activityCover.style.display = "block";
        activityIconFallback.style.display = "none";
      } else {
        activityCover.style.display = "none";
        activityCover.removeAttribute("src");
        activityIconFallback.style.display = "flex";
      }

      progressBar.style.width = "0%";
      timeCurrent.innerText = "";
      timeTotal.innerText = "";
    } else {
      activityCard.style.display = "flex";
      spotifyHeader.style.display = "none";
      spotifyProgressWrap.style.display = "none";
      activityName.innerText = "Just Chilling";
      activityArtist.innerText = "No current activity";
      activityCover.style.display = "none";
      activityCover.removeAttribute("src");
      activityIconFallback.style.display = "flex";
      progressBar.style.width = "0%";
      timeCurrent.innerText = "";
      timeTotal.innerText = "";
    }

  } catch (e) {
    console.error("Failed to load Discord data", e);
  }
}

const header = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 8);
});

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

menuToggle.addEventListener("click", () => {
  siteNav.classList.toggle("open");
  menuToggle.classList.toggle("active");

  const expanded = siteNav.classList.contains("open");
  menuToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
});

siteNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const socialLinks = document.querySelectorAll(".icons a");

socialLinks.forEach(link => {
  link.addEventListener("click", () => {
    setTimeout(() => link.blur(), 0);
  });

  link.addEventListener("mouseup", () => link.blur());
  link.addEventListener("touchend", () => link.blur());
});

window.addEventListener("pageshow", () => {
  socialLinks.forEach(link => link.blur());
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    socialLinks.forEach(link => link.blur());
  }
});

document.addEventListener("contextmenu", function(e) {
  if (e.target.tagName === "IMG" && !e.target.closest(".logo")) {
    e.preventDefault();
  }
});

document.querySelectorAll("img").forEach(img => {
  if (img.closest(".logo")) return;

  img.addEventListener("dragstart", e => e.preventDefault());
  img.addEventListener("touchstart", e => e.preventDefault(), { passive: false });
  img.addEventListener("mousedown", e => {
    if (e.button === 2) e.preventDefault();
  });
});

loadDiscord();
setInterval(loadDiscord, 30000);

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});