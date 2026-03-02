# min-startside

Moderne personlig dashboard i ren HTML, CSS og JavaScript.

## Funksjoner

- Mørk modus som standard (med `Lys / Mørk` toggle).
- Stor digital klokke som oppdateres hvert sekund.
- Vær for Stathelle via MET/Yr API med fallback-lenke til Yr.
- Favorittlenker som rendres fra ett array i `app.js`.
- Glassmorphism-design, myk gradientbakgrunn og subtile animasjoner.
- Fungerer lokalt ved å åpne `index.html` direkte.

## Filer

- `index.html`: Struktur for dashboard.
- `styles.css`: Design, glasskort, grid, animasjoner, responsivitet.
- `app.js`: Favoritter, klokke, tema og værhenting.

## Bruk

1. Åpne `index.html` med dobbelklikk.
2. Oppdater siden med `Cmd+R` etter endringer.

## Endre favoritter

Rediger `favorites`-arrayen i `app.js`:

```js
const favorites = [
  { title, desc, url, icon },
];
```

Alle kort åpnes i ny fane med `target="_blank"` og `rel="noopener noreferrer"`.

## Om værdata

Været hentes fra:

- `https://api.met.no/weatherapi/locationforecast/2.0/compact`

Hvis API-kall feiler, vises en fallback-melding og lenke til Yr for Stathelle.
