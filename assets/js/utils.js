function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
