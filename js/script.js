console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;

  try {
    console.log(`Fetching songs from: /${folder}/`);
    let response = await fetch(`/${folder}/`);

    // Check if the response is okay
    if (!response.ok) throw new Error("Failed to fetch songs from folder");

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let as = div.getElementsByTagName("a");

    // Get all song links from the folder
    songs = Array.from(as)
      .filter((element) => element.href.endsWith(".mp3"))
      .map((element) => element.href.split(`/${folder}/`)[1]);

    console.log("Found songs:", songs); // Debug log to check songs array

    // Check if songs were found
    if (songs.length === 0) {
      throw new Error("No songs found in the folder.");
    }

    // Show all the songs in the playlist
    let songUL = document
      .querySelector(".songList")
      .getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    songs.forEach((song) => {
      songUL.innerHTML += `<li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(
                      song.replaceAll("%20", " ")
                    )}</div>
                    <div>Dipankar</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
    });

    // Attach an event listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
      e.addEventListener("click", () => {
        playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });
  } catch (error) {
    //console.error("Error fetching songs:", error);
  }
}

function playMusic(track, pause = false) {
  const trackUrl = `/${currFolder}/` + track;
  console.log(`Playing track: ${trackUrl}`); // Log the URL
  currentSong.src = trackUrl;

  if (!pause) {
    currentSong.play().catch((err) => {
      console.error("Error playing audio:", err);
    });
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  console.log("Displaying albums");

  try {
    let response = await fetch(`/songs/`);
    if (!response.ok) throw new Error("Failed to fetch albums");
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (const e of array) {
      if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
        let folder = e.href.split("/").slice(-1)[0];
        // Log the folder being processed
        //console.log(`Processing folder: ${folder}`);

        let infoResponse = await fetch(`/songs/${folder}/info.json`);
        if (!infoResponse.ok) {
          //console.error(`info.json not found for folder: ${folder}`);
          continue; // Skip this folder if info.json is not found
        }

        let folderInfo = await infoResponse.json();

        cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="Album Cover">
                    <h2>${folderInfo.title}</h2>
                    <p>${folderInfo.description}</p>
                </div>`;
      }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async () => {
        console.log("Fetching Songs");
        await getSongs(`songs/${e.dataset.folder}`);
        if (songs.length > 0) {
          playMusic(songs[0]);
        }
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}

async function main() {
  // Get the list of all the songs
  await getSongs("songs");
  if (songs.length > 0) {
    playMusic(songs[0], true);
  }

  // Display all the albums on the page
  await displayAlbums();

  // Attach event listeners to play, next, and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document.querySelector(".range input").addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100");
    currentSong.volume = parseInt(e.target.value) / 100;
    document.querySelector(".volume>img").src =
      currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
  });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range input").value = 10;
    }
  });
}

main();
