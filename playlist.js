const THEME_KEY = "min-startside-theme";
const FILE_BASE = "audio/rkstudio/";
const RKSTUDIO_TRACKS = [
  "A_Song_I_cant_sing.mp3",
  "Aint_Ready.mp3",
  "Ambulance_Lights.mp3",
  "Amore.mp3",
  "At_the_endv2.mp3",
  "BEEP.mp3",
  "Beep_Beep_baby.mp3",
  "Before_Her_Name.mp3",
  "Born_to_rome.mp3",
  "Carry_me_forward.mp3",
  "Cest_toi_Remastered.mp3",
  "Dont_let_go.mp3",
  "Echoes_of_the_North.mp3",
  "Endless_Light_jazz_.mp3",
  "Gasoline__Melody.mp3",
  "Glitter_Love.mp3",
  "Grab_a_rifle_shoot_to_dare.mp3",
  "High.mp3",
  "Hold_me_closer.mp3",
  "Im_an_outlaw.mp3",
  "In_Love_With_the_Rain.mp3",
  "In_the_frost.mp3",
  "LateNight_Drive.mp3",
  "Maybe_Hey.mp3",
  "Miss_Your_Eyes.mp3",
  "My_girl.mp3",
  "Ol_og_Savn.mp3",
  "Perplexy.mp3",
  "Pure_Joy.mp3",
  "Saltpop.mp3",
  "Sommaren_Ger_Sig.mp3",
  "Southbound_Hearts.mp3",
  "Sugar_on_My_Skin.mp3",
  "Take_me_higher.mp3",
  "The_Dragon.mp3",
  "This_Aint_Peace.mp3",
  "Under_En_Norsk_Himmel.mp3",
  "What_Your_Eyes_Meant.mp3",
  "What_do_you_say.mp3",
  "Where_Love_Breathes.mp3",
  "You_Hex_Me.mp3",
  "curious_spells.mp3",
  "happy_party_love.mp3",
];

let tracks = RKSTUDIO_TRACKS.map((fileName) => ({
  title: titleFromFileName(fileName),
  fileName,
  url: `${FILE_BASE}${encodeURIComponent(fileName)}`,
}));
let filteredTracks = [...tracks];
let currentIndex = 0;
let shuffle = false;
let repeat = false;

const audio = document.getElementById("audio-player");
const playlistEl = document.getElementById("playlist");
const nowTitle = document.getElementById("now-title");
const playlistMeta = document.getElementById("playlist-meta");
const searchInput = document.getElementById("track-search");
const chooseFolderButton = document.getElementById("choose-folder");
const prevButton = document.getElementById("prev-track");
const playButton = document.getElementById("play-track");
const nextButton = document.getElementById("next-track");
const shuffleButton = document.getElementById("shuffle-track");
const repeatButton = document.getElementById("repeat-track");
const themeToggle = document.getElementById("theme-toggle");

function titleFromFileName(fileName) {
  return fileName.replace(/\.mp3$/i, "").replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === "light" || saved === "dark" ? saved : "dark");

  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

function renderPlaylist() {
  playlistMeta.textContent = `${tracks.length} låter fra RKstudio på nett`;

  if (!filteredTracks.length) {
    playlistEl.innerHTML = '<li class="playlist-empty">Ingen låter matcher søket.</li>';
    return;
  }

  playlistEl.innerHTML = filteredTracks
    .map((track) => {
      const originalIndex = tracks.indexOf(track);
      const isCurrent = originalIndex === currentIndex;
      return `
        <li>
          <button
            type="button"
            class="track-row${isCurrent ? " is-active" : ""}"
            data-track-index="${originalIndex}"
            aria-current="${isCurrent ? "true" : "false"}"
          >
            <span class="track-title">${track.title}</span>
            <span class="track-file">${track.fileName}</span>
          </button>
        </li>
      `;
    })
    .join("");
}

function setCurrentTrack(index, shouldPlay = false) {
  if (!tracks[index]) return;

  currentIndex = index;
  audio.src = tracks[currentIndex].url;
  nowTitle.textContent = tracks[currentIndex].title;
  renderPlaylist();

  if (shouldPlay) {
    audio.play().catch(() => {
      nowTitle.textContent = `${tracks[currentIndex].title} - velg RKstudio-mappen hvis nettleseren blokkerer filen`;
    });
  }
}

function playNext() {
  if (!tracks.length) return;
  const nextIndex = shuffle
    ? Math.floor(Math.random() * tracks.length)
    : (currentIndex + 1) % tracks.length;
  setCurrentTrack(nextIndex, true);
}

function playPrevious() {
  if (!tracks.length) return;
  const nextIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
  setCurrentTrack(nextIndex, true);
}

async function chooseFolder() {
  if (!window.showDirectoryPicker) {
    playlistMeta.textContent = "Mappevalg krever Chrome eller Edge på localhost.";
    return;
  }

  const directoryHandle = await window.showDirectoryPicker();
  const selectedTracks = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind !== "file" || !entry.name.toLowerCase().endsWith(".mp3") || entry.name.startsWith("._")) {
      continue;
    }

    const file = await entry.getFile();
    selectedTracks.push({
      title: titleFromFileName(entry.name),
      fileName: entry.name,
      url: URL.createObjectURL(file),
    });
  }

  tracks = selectedTracks.sort((a, b) => a.title.localeCompare(b.title, "nb-NO"));
  filteredTracks = [...tracks];
  currentIndex = 0;
  searchInput.value = "";
  renderPlaylist();
  setCurrentTrack(0);
}

playlistEl?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-track-index]");
  if (!button) return;
  setCurrentTrack(Number(button.dataset.trackIndex), true);
});

searchInput?.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  filteredTracks = tracks.filter((track) => track.title.toLowerCase().includes(query));
  renderPlaylist();
});

chooseFolderButton?.addEventListener("click", () => {
  chooseFolder().catch(() => {
    playlistMeta.textContent = "Kunne ikke åpne mappen. Prøv igjen.";
  });
});

prevButton?.addEventListener("click", playPrevious);
nextButton?.addEventListener("click", playNext);

playButton?.addEventListener("click", () => {
  if (!audio.src) {
    setCurrentTrack(currentIndex, true);
    return;
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

shuffleButton?.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleButton.setAttribute("aria-pressed", String(shuffle));
  shuffleButton.classList.toggle("is-active", shuffle);
});

repeatButton?.addEventListener("click", () => {
  repeat = !repeat;
  repeatButton.setAttribute("aria-pressed", String(repeat));
  repeatButton.classList.toggle("is-active", repeat);
});

audio?.addEventListener("play", () => {
  playButton.textContent = "Pause";
});

audio?.addEventListener("pause", () => {
  playButton.textContent = "Spill";
});

audio?.addEventListener("ended", () => {
  if (repeat) {
    setCurrentTrack(currentIndex, true);
  } else {
    playNext();
  }
});

initTheme();
renderPlaylist();
setCurrentTrack(0);
