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
    title: "RKstudio",
    desc: "Lokal spilleliste fra SSD-en.",
    url: "spilleliste.html",
    icon: "🎧",
    local: true,
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
const BTC_HOLDINGS = 0.755;
const KLP_GLOBAL_HISTORY = [
  { date: "2025-05-13", value: 3220.0 },
  { date: "2025-06-13", value: 3268.0 },
  { date: "2025-07-13", value: 3352.0 },
  { date: "2025-08-13", value: 3422.0 },
  { date: "2025-09-13", value: 3508.0 },
  { date: "2025-10-13", value: 3618.0 },
  { date: "2025-11-13", value: 3701.0 },
  { date: "2025-12-31", value: 3744.86 },
  { date: "2026-01-13", value: 3808.0 },
  { date: "2026-02-13", value: 3768.0 },
  { date: "2026-03-13", value: 3712.0 },
  { date: "2026-04-13", value: 3635.0 },
  { date: "2026-04-29", value: 3608.22 },
  { date: "2026-05-08", value: 3667.0 },
  { date: "2026-05-13", value: 3693.18 },
];
const FUND_TRENDS = [
  {
    id: "klp-global",
    name: "KLP AksjeGlobal Indeks P",
    isin: "NO0010776040",
    units: 2267.4217,
    nav: 1782.07,
    navDate: "2026-05-18",
    link: "https://www.klp.no/fond/vare-fond/NO0010776040?virksomhet=true",
    history: KLP_GLOBAL_HISTORY,
    defaultPeriod: "3m",
  },
  {
    id: "klp-frn",
    name: "KLP FRN N",
    isin: "NO0012445834",
    units: 959.3111,
    nav: 1031,
    navDate: "2026-05-13",
    monthlySaving: 8000,
    link: "https://www.kron.no/fond/NO0012445834",
    returns: {
      "1m": 0.5,
      "6m": 2.5,
      "1y": 5.6,
    },
    defaultPeriod: "6m",
  },
  {
    id: "klp-obligasjon",
    name: "KLP Obligasjon 3 år N",
    isin: "NO0012445701",
    units: 800.6039,
    nav: 1023,
    navDate: "2026-05-13",
    monthlySaving: 4000,
    link: "https://www.kron.no/fond/NO0012445701",
    returns: {
      "1m": 0.2,
      "6m": 0.3,
      "1y": 2.8,
    },
    defaultPeriod: "6m",
  },
  {
    id: "first-global-focus",
    name: "FIRST Global Focus",
    isin: "NO0010802556",
    units: 52.702,
    nav: 3097.1,
    navDate: "2026-05-13",
    link: "https://firstfondene.no/fond/first-global-focus/",
    returns: {
      "1d": 0.36,
      "ytd": -12.89,
      "1y": 7.66,
    },
    defaultPeriod: "1y",
  },
];
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
const fundTrendsEl = document.getElementById("fund-trends");

function renderFavorites() {
  if (!favoritesGrid) return;

  favoritesGrid.innerHTML = favorites
    .map(
      (item, index) => `
      <a
        class="favorite-card favorite-tone-${(index % 6) + 1}"
        href="${item.url}"
        ${item.local ? "" : 'target="_blank" rel="noopener noreferrer"'}
        aria-label="${item.title}${item.local ? "" : " (åpnes i ny fane)"}"
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

function formatDate(value) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function daysBetween(startDate, endDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((endDate - startDate) / millisecondsPerDay);
}

function formatCurrency(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits,
  }).format(value);
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
    const currentPrice = Number(bitcoin?.current_price ?? 0);
    const prices = Array.isArray(chartData?.prices)
      ? chartData.prices
          .map((entry) => Number(entry?.[1]) * BTC_HOLDINGS)
          .filter((value) => Number.isFinite(value))
      : [];
    const portfolioValue = currentPrice * BTC_HOLDINGS;

    btcPriceEl.textContent = `${new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      maximumFractionDigits: 0,
    }).format(portfolioValue)} (${new Intl.NumberFormat("nb-NO", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(BTC_HOLDINGS)} BTC)`;

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

function formatUnits(value) {
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
  }).format(value);
}

function periodLabel(periodKey) {
  return (
    {
      "1d": "siste dag",
      "1m": "siste 1 mnd",
      "3m": "siste 3 mnd",
      "6m": "siste 6 mnd",
      ytd: "hittil i år",
      "1y": "siste 1 år",
    }[periodKey] || periodKey
  );
}

function periodDays(periodKey) {
  return (
    {
      "1d": 1,
      "1m": 31,
      "3m": 92,
      "6m": 183,
      ytd: 138,
      "1y": 366,
    }[periodKey] || 92
  );
}

function normalizedHistory(fund) {
  if (!Array.isArray(fund.history)) return [];

  const rawHistory = fund.history
    .map((point) => ({
      ...point,
      timestamp: new Date(`${point.date}T00:00:00`).getTime(),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
  const navScale = fund.nav / rawHistory[rawHistory.length - 1].value;
  const history = rawHistory.map((point) => ({
    ...point,
    value: point.value * navScale,
  }));

  if (history[history.length - 1].date !== fund.navDate) {
    history.push({
      date: fund.navDate,
      value: fund.nav,
      timestamp: new Date(`${fund.navDate}T00:00:00`).getTime(),
    });
  }

  return history;
}

function valuesFromReturn(fund, periodKey) {
  const change = Number(fund.returns?.[periodKey] ?? 0);
  const startValue = fund.nav / (1 + change / 100);
  const midValue = startValue + (fund.nav - startValue) * 0.48;
  const wiggle = Math.max(Math.abs(fund.nav - startValue) * 0.16, fund.nav * 0.0008);

  return [
    startValue * fund.units,
    (midValue - wiggle) * fund.units,
    (midValue + wiggle * 0.55) * fund.units,
    fund.nav * fund.units,
  ];
}

function valuesFromHistory(fund, periodKey) {
  const history = normalizedHistory(fund);
  const latestPoint = history[history.length - 1];
  const cutoff = latestPoint.timestamp - periodDays(periodKey) * 24 * 60 * 60 * 1000;
  const periodPoints = history.filter((point) => point.timestamp >= cutoff);
  const selectedPoints = periodPoints.length < 2 ? history.slice(-2) : periodPoints;

  return selectedPoints.map((point) => point.value * fund.units);
}

function fundPeriodChange(fund, periodKey, values) {
  if (fund.returns?.[periodKey] !== undefined) {
    return Number(fund.returns[periodKey]);
  }

  return ((values[values.length - 1] - values[0]) / values[0]) * 100;
}

function renderFundCard(fund, periodKey = fund.defaultPeriod) {
  const values = fund.history ? valuesFromHistory(fund, periodKey) : valuesFromReturn(fund, periodKey);
  const periodChange = fundPeriodChange(fund, periodKey, values);
  const currentValue = fund.nav * fund.units;
  const card = document.querySelector(`[data-fund-card="${fund.id}"]`);
  if (!card) return;

  const priceEl = card.querySelector("[data-fund-value]");
  const changeEl = card.querySelector("[data-fund-change]");
  const metaEl = card.querySelector("[data-fund-meta]");
  const sparklineEl = card.querySelector("[data-fund-sparkline]");
  const periodButtons = card.querySelectorAll("[data-fund-period]");

  priceEl.textContent = formatCurrency(currentValue);
  changeEl.textContent = `${periodChange >= 0 ? "▲" : "▼"} ${Math.abs(periodChange).toFixed(2)} % ${periodLabel(periodKey)}`;
  changeEl.classList.toggle("is-up", periodChange >= 0);
  changeEl.classList.toggle("is-down", periodChange < 0);

  const savingText = fund.monthlySaving ? ` · ${formatCurrency(fund.monthlySaving)}/mnd` : "";
  metaEl.textContent = `NAV ${formatCurrency(fund.nav, 2)} · ${formatUnits(fund.units)} andeler${savingText} · ${formatDate(fund.navDate)}`;
  sparklineEl.setAttribute("aria-label", `${fund.name} trend ${periodLabel(periodKey)}`);

  buildSparkline(sparklineEl, values, `${fund.id}-line`, {
    start: "#41c8ff",
    end: "#85d9ff",
  });

  periodButtons.forEach((button) => {
    const isActive = button.dataset.fundPeriod === periodKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function initFundTrends() {
  if (!fundTrendsEl) return;

  fundTrendsEl.innerHTML = FUND_TRENDS.map((fund) => {
    const periods = Object.keys(fund.returns || { "1m": true, "3m": true, "1y": true });
    const periodButtons = periods
      .map(
        (period) =>
          `<button type="button" class="fund-period" data-fund-period="${period}" aria-pressed="false">${period.toUpperCase()}</button>`
      )
      .join("");

    return `
      <article class="fund-card" data-fund-card="${fund.id}">
        <div class="fund-card-head">
          <h3>${fund.name}</h3>
          <a class="fund-card-link" href="${fund.link}" target="_blank" rel="noopener noreferrer" aria-label="Åpne ${fund.name}">Åpne</a>
        </div>
        <p class="fund-value" data-fund-value>--</p>
        <p class="btc-change fund-change" data-fund-change>Henter utvikling…</p>
        <p class="fund-updated" data-fund-meta>Henter siste oppdatering…</p>
        <div class="fund-periods" role="group" aria-label="Velg trendperiode for ${fund.name}">
          ${periodButtons}
        </div>
        <svg
          class="btc-sparkline fund-sparkline"
          data-fund-sparkline
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          role="img"
          aria-label="${fund.name} trend"
        ></svg>
      </article>
    `;
  }).join("");

  FUND_TRENDS.forEach((fund) => {
    const card = document.querySelector(`[data-fund-card="${fund.id}"]`);
    card?.querySelectorAll("[data-fund-period]").forEach((button) => {
      button.addEventListener("click", () => {
        renderFundCard(fund, button.dataset.fundPeriod || fund.defaultPeriod);
      });
    });
    renderFundCard(fund, fund.defaultPeriod);
  });
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
initFundTrends();
setInterval(initBitcoinTrend, 5 * 60 * 1000);
