(() => {
  "use strict";

  /* ---------- Theme ----------
     data-theme is always set explicitly so CSS never has to duplicate the
     palette in a prefers-color-scheme block. The system preference is only
     followed until the visitor makes a choice of their own. */
  const root = document.documentElement;
  const STORE = "theme";
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const stored = localStorage.getItem(STORE);
  const initial = stored === "light" || stored === "dark"
    ? stored
    : (systemDark.matches ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  systemDark.addEventListener("change", (e) => {
    if (localStorage.getItem(STORE)) return; // visitor has chosen; leave it alone
    root.setAttribute("data-theme", e.matches ? "dark" : "light");
    syncToggle();
  });

  let toggle = null;

  function syncToggle() {
    if (!toggle) return;
    const dark = root.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-checked", String(dark));
  }

  /* ---------- Colophon weather ----------
     Open-Meteo: no API key, no tracking, CORS-open. If it fails for any
     reason the line simply stays as the location on its own. */
  const WILTSHIRE = { lat: 51.35, lon: -1.99 };

  const CONDITION = {
    0: "clear", 1: "mainly clear", 2: "partly cloudy", 3: "overcast",
    45: "foggy", 48: "foggy",
    51: "drizzly", 53: "drizzly", 55: "drizzly",
    56: "freezing drizzle", 57: "freezing drizzle",
    61: "rainy", 63: "rainy", 65: "rainy",
    66: "freezing rain", 67: "freezing rain",
    71: "snowy", 73: "snowy", 75: "snowy", 77: "snowy",
    80: "showery", 81: "showery", 82: "showery",
    85: "snowy", 86: "snowy",
    95: "thundery", 96: "thundery", 99: "thundery"
  };

  async function loadWeather() {
    const el = document.getElementById("colophon");
    if (!el) return;

    const url = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + WILTSHIRE.lat
      + "&longitude=" + WILTSHIRE.lon
      + "&current=temperature_2m,weather_code";

    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) return;
      const data = await res.json();
      const temp = Math.round(data?.current?.temperature_2m);
      const code = data?.current?.weather_code;
      const condition = CONDITION[code];
      if (!Number.isFinite(temp) || !condition) return;

      el.textContent =
        "Made in Wiltshire, UK, where the weather is " + temp + "°C and " + condition + ".";
    } catch {
      /* offline, blocked, or rate-limited — the fallback text stands */
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      syncToggle();
      toggle.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem(STORE, next);
        syncToggle();
      });
    }
    loadWeather();
  });
})();
