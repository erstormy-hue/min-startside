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
const btcPriceEl = document.getElementById("btc-price");
const btcChangeEl = document.getElementById("btc-change");
const btcSparklineEl = document.getElementById("btc-sparkline");
const fundPriceEl = document.getElementById("fund-price");
const fundChangeEl = document.getElementById("fund-change");
const fundSparklineEl = document.getElementById("fund-sparkline");

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

function buildSparkline(targetEl, values, gradientId, colors) {
  if (!targetEl || !Array.isArray(values) || values.length < 2) {
    return;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 30;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  targetEl.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${colors.start}" />
        <stop offset="100%" stop-color="${colors.end}" />
      </linearGradient>
    </defs>
    <polyline points="${points}" fill="none" stroke="url(#${gradientId})" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></polyline>
  `;
}

async function initBitcoinTrend() {
  if (!btcPriceEl || !btcChangeEl || !btcSparklineEl) return;

  const marketEndpoint =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=nok&ids=bitcoin&price_change_percentage=24h";
  const chartEndpoint =
    "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=nok&days=7&interval=daily";

  try {
    const [marketRes, chartRes] = await Promise.all([fetch(marketEndpoint), fetch(chartEndpoint)]);

    if (!marketRes.ok || !chartRes.ok) {
      throw new Error("Kunne ikke hente BTC-data");
    }

    const marketData = await marketRes.json();
    const chartData = await chartRes.json();

    const bitcoin = marketData?.[0];
    const change = Number(bitcoin?.price_change_percentage_24h ?? 0);
    const prices = Array.isArray(chartData?.prices)
      ? chartData.prices.map((entry) => Number(entry?.[1])).filter((value) => Number.isFinite(value))
      : [];

    btcPriceEl.textContent = `${new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(Number(bitcoin?.current_price ?? 0))}`;

    btcChangeEl.textContent = `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)} % siste 24t`;
    btcChangeEl.classList.toggle("is-up", change >= 0);
    btcChangeEl.classList.toggle("is-down", change < 0);

    buildSparkline(btcSparklineEl, prices, "btc-line", {
      start: "#f7931a",
      end: "#ffd185",
    });
  } catch (error) {
    btcPriceEl.textContent = "Bitcoin-data utilgjengelig";
    btcChangeEl.textContent = "Prøv igjen senere";
    btcSparklineEl.innerHTML = "";
  }
}

function initFundTrend() {
  if (!fundPriceEl || !fundChangeEl || !fundSparklineEl) return;

  const fundPeriods = {
    "1m": {
      label: "siste 1 mnd",
      values: [3674, 3669, 3675, 3670, 3660, 3651, 3662, 3658, 3652, 3641, 3635, 3627, 3618, 3624, 3633, 3629, 3638, 3642, 3636, 3624],
    },
    "3m": {
      label: "siste 3 mnd",
      values: [3768, 3755, 3748, 3762, 3771, 3758, 3749, 3792, 3811, 3798, 3818, 3722, 3736, 3712, 3690, 3672, 3656, 3678, 3648, 3602, 3629, 3640, 3625, 3670, 3641, 3636, 3628, 3564, 3579],
    },
    "1y": {
      label: "siste 1 år",
      values: [3220, 3268, 3315, 3352, 3381, 3422, 3467, 3508, 3546, 3572, 3618, 3657, 3701, 3734, 3762, 3808, 3775, 3711, 3668, 3624, 3594, 3631, 3654, 3618],
    },
  };

  const periodButtons = document.querySelectorAll("[data-fund-period]");

  const renderFundPeriod = (periodKey) => {
    const current = fundPeriods[periodKey] || fundPeriods["3m"];
    const values = current.values;
    const latestValue = values[values.length - 1];
    const startValue = values[0];
    const periodChange = ((latestValue - startValue) / startValue) * 100;

    fundPriceEl.textContent = `${new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 4,
      minimumFractionDigits: 4,
    }).format(latestValue)}`;

    fundChangeEl.textContent = `${periodChange >= 0 ? "▲" : "▼"} ${Math.abs(periodChange).toFixed(2)} % ${current.label}`;
    fundChangeEl.classList.toggle("is-up", periodChange >= 0);
    fundChangeEl.classList.toggle("is-down", periodChange < 0);

    fundSparklineEl.setAttribute("aria-label", `KLP AksjeGlobal Indeks P trend ${current.label}`);

    buildSparkline(fundSparklineEl, values, "fund-line", {
      start: "#41c8ff",
      end: "#85d9ff",
    });

    periodButtons.forEach((button) => {
      const isActive = button.dataset.fundPeriod === periodKey;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      renderFundPeriod(button.dataset.fundPeriod || "3m");
    });
  });

  renderFundPeriod("3m");
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
initBitcoinTrend();
initFundTrend();
setInterval(initBitcoinTrend, 5 * 60 * 1000);
