/* =========================
   ELEMENTS
========================= */
const ddlUnits = document.querySelector("#ddlUnits");
const ddlDay = document.querySelector("#ddlDay");
const txtSearch = document.querySelector("#txtSearch");
const btnSearch = document.querySelector("#btnSearch");

const dvCityCountry = document.querySelector("#dvCityCountry");
const dvCurrDate = document.querySelector("#dvCurrDate");
const dvCurrTemp = document.querySelector("#dvCurrTemp");

const pFeelsLike = document.querySelector("#pFeelsLike");
const pHumidity = document.querySelector("#pHumidity");
const pWind = document.querySelector("#pWind");
const pPrecipitation = document.querySelector("#pPrecipitation");

let cityName, countryName, weatherData;

/* =========================
   MOBILE MENU
========================= */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  mobileMenu.style.display =
    mobileMenu.style.display === "flex" ? "none" : "flex";
});

/* =========================
   GEOLOCATION (LOAD FIRST)
========================= */
function getUserLocation() {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
      const response = await fetch(url);
      const result = await response.json();

      loadLocationData([result]);
      getWeatherData(lat, lon);
    },
    (error) => {
      console.error("Location permission denied", error);
    }
  );
}

/* =========================
   SEARCH LOCATION
========================= */
async function getGeoData() {
  const search = txtSearch.value.trim();
  if (!search) return;

  const url = `https://nominatim.openstreetmap.org/search?q=${search}&format=jsonv2&addressdetails=1`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (!result.length) return;

    const lat = result[0].lat;
    const lon = result[0].lon;

    loadLocationData(result);
    getWeatherData(lat, lon);
  } catch (error) {
    console.error(error.message);
  }
}

/* =========================
   LOCATION INFO
========================= */
function loadLocationData(locationData) {
  const location = locationData[0].address || locationData[0];

  cityName =
    location.city ||
    location.town ||
    location.village ||
    location.suburb ||
    location.county ||
    "Unknown";

  countryName = location.country_code
    ? location.country_code.toUpperCase()
    : "??";

  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
  };

  dvCityCountry.textContent = `${cityName}, ${countryName}`;
  dvCurrDate.textContent = new Intl.DateTimeFormat(
    "en-US",
    dateOptions
  ).format(new Date());

  txtSearch.value = cityName;
}

/* =========================
   WEATHER API
========================= */
async function getWeatherData(lat, lon) {
  let tempUnit = "celsius";
  let windUnit = "kmh";
  let precipUnit = "mm";

  if (ddlUnits.value === "F") {
    tempUnit = "fahrenheit";
    windUnit = "mph";
    precipUnit = "inch";
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&wind_speed_unit=${windUnit}&temperature_unit=${tempUnit}&precipitation_unit=${precipUnit}`;

  try {
    const response = await fetch(url);
    weatherData = await response.json();

    loadCurrentWeather();
    loadDailyForecast();
    loadHourlyForecast();
  } catch (error) {
    console.error(error.message);
  }
}

/* =========================
   CURRENT WEATHER
========================= */
function loadCurrentWeather() {
  dvCurrTemp.textContent = Math.round(weatherData.current.temperature_2m);
  pFeelsLike.textContent = Math.round(weatherData.current.apparent_temperature);
  pHumidity.textContent = weatherData.current.relative_humidity_2m;

  pWind.textContent = `${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m.replace("mp/h", "mph")}`;
  pPrecipitation.textContent = `${weatherData.current.precipitation} ${weatherData.current_units.precipitation.replace("inch", "in")}`;
}

/* =========================
   DAILY FORECAST
========================= */
function loadDailyForecast() {
  const daily = weatherData.daily;

  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const day = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(date);

    const dv = document.querySelector(`#dvForecastDay${i + 1}`);
    dv.innerHTML = "";

    addDailyElement("p", "daily__day-title", day, "", dv);
    addDailyElement(
      "img",
      "daily__day-icon",
      "",
      getWeatherCodeName(daily.weather_code[i]),
      dv
    );

    const temps = document.createElement("div");
    temps.className = "daily__day-temps";

    temps.innerHTML = `
      <p class="daily__day-high">${Math.round(
        daily.temperature_2m_max[i]
      )}°</p>
      <p class="daily__day-low">${Math.round(
        daily.temperature_2m_min[i]
      )}°</p>
    `;

    dv.appendChild(temps);
  }
}

/* =========================
   HOURLY FORECAST
========================= */
function loadHourlyForecast() {
  const dayIndex = parseInt(ddlDay.value, 10);
  const start = dayIndex * 24;
  const end = start + 23;

  let id = 1;

  for (let h = start; h <= end; h++) {
    const dv = document.querySelector(`#dvForecastHour${id}`);
    dv.innerHTML = "";

    addDailyElement(
      "img",
      "hourly__hour-icon",
      "",
      getWeatherCodeName(weatherData.hourly.weather_code[h]),
      dv
    );

    addDailyElement(
      "p",
      "hourly__hour-time",
      new Date(weatherData.hourly.time[h]).toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
      }),
      "",
      dv
    );

    addDailyElement(
      "p",
      "hourly__hour-temp",
      `${Math.round(weatherData.hourly.temperature_2m[h])}°`,
      "",
      dv
    );

    id++;
  }
}

/* =========================
   HELPERS
========================= */
function addDailyElement(tag, className, content, icon, parent) {
  const el = document.createElement(tag);
  el.className = className;

  if (content) el.textContent = content;

  if (tag === "img") {
    el.src = `/images/weather-image/icon-${icon}.webp`;
    el.alt = icon;
  }

  parent.appendChild(el);
}

function getWeatherCodeName(code) {
  const map = {
    0: "sunny",
    1: "partly-cloudy",
    2: "partly-cloudy",
    3: "overcast",
    45: "fog",
    48: "fog",
    51: "drizzle",
    53: "drizzle",
    55: "drizzle",
    61: "rain",
    63: "rain",
    65: "rain",
    71: "snow",
    73: "snow",
    75: "snow",
    95: "storm",
    96: "storm",
    99: "storm",
  };

  return map[code] || "sunny";
}

/* =========================
   DAY SELECT
========================= */
function populateDayOfWeek() {
  let date = new Date();

  for (let i = 0; i < 7; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);

    ddlDay.appendChild(option);
    date.setDate(date.getDate() + 1);
  }
}

/* =========================
   INIT
========================= */
populateDayOfWeek();
getUserLocation();

btnSearch.addEventListener("click", getGeoData);
ddlUnits.addEventListener("change", getGeoData);
ddlDay.addEventListener("change", loadHourlyForecast);
