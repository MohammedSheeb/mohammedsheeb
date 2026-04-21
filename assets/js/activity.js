let activityInterval = null;

function resetActivityTimer() {
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
}

function setFallbackActivity() {
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
  const activityIconFallback = document.getElementById("activityIconFallback");

  activityCard.style.display = "flex";
  spotifyHeader.style.display = "flex";
  spotifyProgressWrap.style.display = "block";
  activityIconFallback.style.display = "none";

  activityName.innerText = spotify.song || "Spotify";
  activityArtist.innerText = spotify.artist || "";
  activityCover.src = spotify.album_art_url || "";
  activityCover.style.display = "block";

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
}

function setOtherActivity(activity) {
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

  activityCard.style.display = "flex";
  spotifyHeader.style.display = "none";
  spotifyProgressWrap.style.display = "none";

  activityName.innerText = activity.name || "Activity";
  activityArtist.innerText = activity.details || activity.state || "";

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
}
