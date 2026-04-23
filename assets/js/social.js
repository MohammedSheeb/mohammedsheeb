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