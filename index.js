const API_KEY = "b930039805e75bc110c14d25aa3a7389";

const input = document.getElementById("myInput");
const btn = document.getElementById("myBtn");
const currentLoc = document.getElementById("currentLoc");
const forecast = document.getElementById("forecastContainer");
const loader = document.getElementById("loading");

function displayLoading() {
  loader.classList.add("display");

  setTimeout(() => {
    loader.classList.remove("display");
  }, 5000);
}

function hideLoading() {
  loader.classList.remove("display");
}

async function getDefault() {
  let storedCity = localStorage.getItem("lastcity");
  let myCity = JSON.parse(storedCity);

  renderData(myCity);
}

async function getCity(city) {
  if (!city) {
    alert("Please enter a city name");

    return;
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;

  const options = {
    method: "GET",
    headers: {},
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!result.coord) {
      alert("You are looking for a not existing city");
      return;
    }

    return {
      lat: result.coord.lat,
      lon: result.coord.lon,
    };
  } catch (error) {
    console.error(error);
  }
}

async function getWeather(coords) {
  if (!coords) {
    return;
  }

  const lat = coords.lat;
  const lon = coords.lon;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const options = {
    method: "GET",
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    const storedCity = JSON.stringify(result);
    localStorage.setItem("lastcity", storedCity);

    return result;
  } catch (error) {
    console.error(error);
  }
}

async function getWeatherByInput() {
  try {
    displayLoading();

    forecast.style.visibility = "hidden";

    const coord = await getCity(input.value);

    const data = await getWeather(coord);
    hideLoading();
    forecast.style.visibility = "visible";
    input.value = "";
    renderData(data);
  } catch (e) {
    console.log(e);
  }
}

async function renderForecastMyLocation() {
  try {
    forecast.style.visibility = "hidden";
    displayLoading();

    const position = await getLocation();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const data = await getWeather({ lat, lon });
    hideLoading();
    forecast.style.visibility = "visible";

    const storedCity = JSON.stringify(data);
    localStorage.setItem("lastcity", storedCity);

    renderData(data);
  } catch (err) {
    console.log(err);
  }
}

function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

function renderData(data) {
  try {
    document.getElementById("city").innerHTML = `${data.name}`;

    document.getElementById("temp").innerText = `${data.main.temp} °C `;

    document.getElementById(
      "desc"
    ).innerText = `${data.weather[0].description}`;

    document.getElementById("wind_img").innerHTML =
      "<img src=./pictures/wind.png width=15px height=15px /> " +
      `${Math.round(data.wind.speed)}m/s`;

    const picture = data.weather[0].icon;

    document.getElementById(
      "weather"
    ).innerHTML = `<img src='./pictures/${picture}.png' width="150" height="150"/>`;
  } catch (e) {
    console.log(e);
  }
}

getDefault();
btn.addEventListener("click", getWeatherByInput);
currentLoc.addEventListener("click", renderForecastMyLocation);

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    btn.click();
  }
});
