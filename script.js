const userId = "1481454957512101950";

async function loadDiscord() {
  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const data = await res.json();

    const user = data.data.discord_user;
    const status = data.data.discord_status;
    const isAnimated = user.avatar && user.avatar.startsWith("a_");
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${isAnimated ? "gif" : "png"}`;

    document.getElementById("avatar").src = avatarUrl;

    const name = user.global_name ? user.global_name : user.username;
    document.getElementById("displayName").innerText = name;
    document.getElementById("tag").innerText = user.username;
    document.getElementById("dot").className = "status-dot " + status;
    document.getElementById("statusMiniDot").className = "mini-dot " + status;

    document.getElementById("statusText").innerText =
      status === "online" ? "Online" :
      status === "idle" ? "Idle" :
      status === "dnd" ? "Do Not Disturb" : "Offline";
  } catch (e) {
    console.error("Failed to load Discord data");
  }
}

const header = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  if (window.scrollY > 8) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
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