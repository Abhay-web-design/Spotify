let currentAudio = null;


// ========== Hamburger Toggle ==========
const hamburger = document.getElementById("hamburger");
const library = document.getElementById("library");

hamburger.addEventListener("click", () => {
  library.classList.toggle("hidden");
});

// ========== Player Toggle (Top/Bottom) ==========
let bottom_player = document.querySelector("#bottom-player");
let top_player = document.querySelector("#top-player");
let playlist = document.querySelector("#playlistContainer");
let down_arrow = document.querySelector("#down-arrow");



// ========== Fetch Songs From Folder ==========
async function getsongs(folder) {
  let response = await fetch(`/songs/${folder}/`);
  let a = await response.text();
  let div = document.createElement("div");
  div.innerHTML = a;
  let li = div.getElementsByTagName("a");
  let arr = [];
  for (let i = 0; i < li.length; i++) {
    let element = li[i];
    if (element.href.endsWith(".mp3")) {
      arr.push(element.href);
    }
  }
  return arr;
}

// ========== Load Directories from Server ==========
async function songdir() {
  let response = await fetch("/songs/");
  let a = await response.text();
  let div = document.createElement("div");
  div.innerHTML = a;
  let li = div.getElementsByTagName("a");
  let dir = [];
  for (let i = 0; i < li.length; i++) {
    let element = li[i];
    if (element.title && element.title !== "..") {
      dir.push(element.title);
    }
  }
  return dir;
}

// ========== Show Songs in Playlist View ==========
function showPlaylist(folder, songs) {
  // Remove previous song list if it exists
  const old = document.getElementById("incard");
  if (old) old.remove();

  // Hide the playlist grid
  const playlistGrid = document.getElementById("playlist");
  if (playlistGrid) playlistGrid.classList.add("hidden");

  // Create the song list container
  const incard = document.createElement("div");
  incard.id = "incard";
 incard.className = "w-full h-fit mt-5 rounded-xl animate-fade-in px-4 lg:px-40 xl:px-80";


  // Back Button
  const backBtn = document.createElement("button");
  backBtn.textContent = "← Back to Playlists";
  backBtn.className = "text-white text-lg font-semibold p-3 hover:underline transition";
  backBtn.addEventListener("click", () => {
    incard.classList.add("animate-fade-out");
    setTimeout(() => {
      incard.remove(); // hide song list
      playlistGrid.classList.remove("hidden");  // show playlist cards
      playlistGrid.classList.add("animate-fade-in");
    }, 300); // match fade duration
  });
  incard.appendChild(backBtn);

  // Playlist title
  const titleText = document.createElement("p");
  titleText.textContent = folder;
  titleText.className = "text-3xl text-white font-bold px-4 pb-2";
  incard.appendChild(titleText);

  // Cover image
  const coverContainer = document.createElement("div");
  coverContainer.className = "w-full h-80 rounded-xl overflow-hidden";

  const img = document.createElement("img");
  img.src = `/songs/${folder}/cover.jpg`;
  img.alt = "album cover";
  img.className = "w-full h-full object-cover rounded-xl";
  coverContainer.appendChild(img);
  

  // Song list container
  const songListContainer = document.createElement("div");
  songListContainer.className = "w-full h-full bg-[#1F1F1F]";

  const ul = document.createElement("ul");
  ul.className = "p-4 pb-25 text-2xl text-white font-bold";

  songs.forEach((songUrl, index) => {
    const li = document.createElement("li");
    const fileName = decodeURIComponent(songUrl.split("/").pop().replace(".mp3", ""));
    li.textContent = `${index + 1}. ${fileName}`;
            li.className = "border border-white p-4 rounded-lg m-3 hover:bg-white hover:text-black transition cursor-pointer";
              li.addEventListener("click", () => {
                // Save current playlist info
                currentPlaylist = songs;
                currentPlaylistName = folder;
                currentIndex = index;

                // Stop existing song
                if (currentAudio) {
                  currentAudio.pause();
                  currentAudio.currentTime = 0;
                }

                // Play new song
                const audio = new Audio(songUrl);
                currentAudio = audio;
                audio.play();

                // Update bottom player UI
                updateBottomPlayer(folder, fileName, `/songs/${folder}/cover.jpg`, audio);
              });


    ul.appendChild(li);
  });

  songListContainer.appendChild(ul);
  incard.appendChild(coverContainer);
  incard.appendChild(songListContainer);
  playlist.appendChild(incard);
}


// ========== Render Playlist Cards from Directories ==========
async function directories() {
  let directories = await songdir();
  const playlistContainer = document.getElementById("playlistContainer");

  const playlist = document.createElement("div");
  playlist.id = "playlist";
  playlist.className = "bg-gradient-to-t from-[#000] to-[#1F1F1F] w-screen rounded-lg p-6 overflow-hidden";

  const title = document.createElement("p");
  title.textContent = "Your Playlist";
  title.className = "text-3xl text-white font-bold";
  playlist.appendChild(title);

  const cards = document.createElement("div");
  cards.id = "cards";
  cards.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

  playlist.appendChild(cards);

  playlistContainer.appendChild(playlist);

  directories.forEach(dir => {
    fetch(`/songs/${dir}/info.json`)
      .then(res => res.json())
      .then(data => {
        const card = document.createElement("div");
        card.className = "outcard hover:bg-gradient-to-b from-[#171616] to-[#1F1F1F] rounded-2xl p-4 mt-4";

        const innerFlex = document.createElement("div");
        innerFlex.className = "flex items-center flex-col";

        const imgWrapper = document.createElement("div");
        imgWrapper.className = "w-40 h-45 rounded-2xl";

        const img = document.createElement("img");
        img.src = `/songs/${dir}/cover.jpg`;
        img.alt = "cover photo";
        img.className = "w-full h-full rounded-2xl";
        imgWrapper.appendChild(img);

        const title = document.createElement("p");
        title.textContent = data.title || dir;
        title.className = "text-xl font-semibold text-white mt-1";

        const desc = document.createElement("p");
        desc.textContent = data.description || "";
        desc.className = "text-[12px] font-medium text-[#899f9c] mt-1";

        innerFlex.appendChild(imgWrapper);
        innerFlex.appendChild(title);
        innerFlex.appendChild(desc);
        card.appendChild(innerFlex);

        card.addEventListener("click", async () => {
          const songs = await getsongs(dir);
          showPlaylist(dir, songs);
        });

        cards.appendChild(card);
      })
      .catch(error => {
        console.error(`Failed to load ${dir}: `, error);
      });
  });
}

// ========== Init ==========
directories();


function updateBottomPlayer(playlistName, songName, coverUrl, audio) {
  document.querySelector("#bottom-player img").src = coverUrl;
  document.querySelector("#bottom-player .song-title").textContent = songName;
  document.querySelector("#bottom-player .song-desc").textContent = `From "${playlistName}"`;

  const timeInput = document.querySelector("#song-progress");
  const timeText = document.querySelector("#time-label");

  const playToggleIcon = document.getElementById("play-toggle");

  // Reset range and time
  timeInput.value = 0;
  timeText.textContent = "00:00";

  // Remove previous event listeners
  playToggleIcon.replaceWith(playToggleIcon.cloneNode(true));
  const newToggle = document.getElementById("play-toggle");

  // Update max duration
  audio.addEventListener("loadedmetadata", () => {
    timeInput.max = audio.duration;
  });

  audio.addEventListener("timeupdate", () => {
    timeInput.value = audio.currentTime;
    const minutes = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    timeText.textContent = `${minutes}:${seconds}`;
  });

  timeInput.addEventListener("input", () => {
    audio.currentTime = timeInput.value;
  });

  // Volume
  const volume = document.getElementById("volume-range");
  volume.value = 100;
  audio.volume = 1;
  volume.addEventListener("input", () => {
    audio.volume = volume.value / 100;
  });

  // Play/pause toggle
  newToggle.className = "ri-pause-circle-fill"; // start as pause (playing)
  newToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play();
      newToggle.className = "ri-pause-circle-fill";
      document.getElementById("now-playing-bars")?.classList.remove("hidden");
    } else {
      audio.pause();
      newToggle.className = "ri-play-circle-fill";
      document.getElementById("now-playing-bars")?.classList.add("hidden");
    }
  });

  // Show now playing animation
  showNowPlayingBars();
}


function showNowPlayingBars() {
  const bars = document.getElementById("now-playing-bars");
  if (bars) bars.classList.remove("hidden");
}


// ==============forward and backward button==========

let currentPlaylist = [];
let currentPlaylistName = "";
let currentIndex = -1;

document.getElementById("forward").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentPlaylist.length === 0) return;
  currentIndex = (currentIndex + 1) % currentPlaylist.length;
  playSongByIndex(currentIndex);
});

document.getElementById("backward").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentPlaylist.length === 0) return;
  currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playSongByIndex(currentIndex);
});

function playSongByIndex(index) {
  const songUrl = currentPlaylist[index];
  const fileName = decodeURIComponent(songUrl.split("/").pop().replace(".mp3", ""));
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = new Audio(songUrl);
  currentAudio = audio;
  audio.play();

  updateBottomPlayer(currentPlaylistName, fileName, `/songs/${currentPlaylistName}/cover.jpg`, audio);
}
