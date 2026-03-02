const favorites = [
  {
    title: "NRK",
    desc: "Nyheter, TV og radio.",
    url: "https://www.nrk.no",
    icon: "📰",
  },
  {
    title: "VG",
    desc: "Siste nytt og sport.",
    url: "https://www.vg.no",
    icon: "🗞️",
  },
  {
    title: "Yr",
    desc: "Værmelding og radar.",
    url: "https://www.yr.no/nb/v%C3%A6rvarsel/daglig-tabell/1-72837/Norge/Vestfold%20og%20Telemark/Bamble/Stathelle",
    icon: "🌦️",
  },
  {
    title: "FINN",
    desc: "Bolig, torget og jobb.",
    url: "https://www.finn.no",
    icon: "🏠",
  },
  {
    title: "ChatGPT",
    desc: "Skriv, planlegg og utforsk.",
    url: "https://chatgpt.com",
    icon: "🤖",
  },
  {
    title: "Spotify",
    desc: "Musikk og spillelister.",
    url: "https://open.spotify.com",
    icon: "🎶",
  },
  {
    title: "YouTube",
    desc: "Videoer og kanaler.",
    url: "https://www.youtube.com",
    icon: "▶️",
  },
  {
    title: "Suno",
    desc: "Lag musikk med AI.",
    url: "https://suno.com",
    icon: "🎵",
  },
  {
    title: "BandLab",
    desc: "Produser og del låter.",
    url: "https://www.bandlab.com",
    icon: "🎚️",
  },
  {
    title: "Aftenposten",
    desc: "Nyheter og analyser.",
    url: "https://www.aftenposten.no",
    icon: "🗂️",
  },
  {
    title: "E24",
    desc: "Forsiden for økonomi og marked.",
    url: "https://e24.no",
    icon: "💹",
  },
  {
    title: "DN.no",
    desc: "Dagens Næringsliv.",
    url: "https://www.dn.no",
    icon: "📉",
  },
];

const THEME_KEY = "min-startside-theme";
const STATHELLE = {
  lat: 59.046,
  lon: 9.698,
};

const favoritesGrid = document.getElementById("favorites-grid");
const themeToggle = document.getElementById("theme-toggle");
const clockEl = document.getElementById("clock");
const clockDateEl = document.getElementById("clock-date");
const weatherContent = document.getElementById("weather-content");

function renderFavorites() {
  if (!favoritesGrid) return;

  favoritesGrid.innerHTML = favorites
    .map(
      (item, index) => `
      <a
        class="favorite-card favorite-tone-${(index % 6) + 1}"
        href="${item.url}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${item.title} (åpnes i ny fane)"
      >
        <span class="favorite-icon" aria-hidden="true">${item.icon}</span>
        <h3 class="favorite-title">${item.title}</h3>
        <p class="favorite-desc">${item.desc}</p>
      </a>
    `
    )
    .join("");
}

function updateClock() {
  const now = new Date();

  if (clockEl) {
    clockEl.textContent = new Intl.DateTimeFormat("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  }

  if (clockDateEl) {
    clockDateEl.textContent = new Intl.DateTimeFormat("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);
  }
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return "dark";
}

function initTheme() {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

function weatherMarkup(values) {
  return `
    <div class="weather-grid">
      <article class="weather-item">
        <p class="weather-label">Temperatur</p>
        <p class="weather-value">${values.temperature} °C</p>
      </article>
      <article class="weather-item">
        <p class="weather-label">Vind</p>
        <p class="weather-value">${values.wind} m/s</p>
      </article>
      <article class="weather-item">
        <p class="weather-label">Nedbør (1t)</p>
        <p class="weather-value">${values.precipitation} mm</p>
      </article>
      <article class="weather-item">
        <p class="weather-label">Symbol</p>
        <p class="weather-value">${values.symbol}</p>
      </article>
    </div>
  `;
}

async function initWeather() {
  if (!weatherContent) return;

  const endpoint = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${STATHELLE.lat}&lon=${STATHELLE.lon}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const first = data?.properties?.timeseries?.[0]?.data;

    if (!first?.instant?.details) {
      throw new Error("Ugyldig værdata");
    }

    const details = first.instant.details;
    const symbol =
      first.next_1_hours?.summary?.symbol_code ||
      first.next_6_hours?.summary?.symbol_code ||
      "ukjent";

    weatherContent.innerHTML = weatherMarkup({
      temperature: Number(details.air_temperature).toFixed(1),
      wind: Number(details.wind_speed).toFixed(1),
      precipitation: Number(first.next_1_hours?.details?.precipitation_amount ?? 0).toFixed(1),
      symbol,
    });
  } catch (error) {
    weatherContent.innerHTML =
      '<p class="weather-status">Kunne ikke hente værdata nå. Åpne Yr-lenken over for full værmelding.</p>';
  }
}

renderFavorites();
initClock();
initTheme();
initWeather();
