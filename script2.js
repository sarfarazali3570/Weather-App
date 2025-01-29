const apiKey = "a8830878ee9e21be926d98657a39310d"; // Get API key from OpenWeatherMap

document.getElementById("searchBtn").addEventListener("click", fetchWeather);

// Load recent searches
const recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
const recentDropdown = document.getElementById("recentSearches");
if (recentSearches.length > 0) {
    recentDropdown.classList.remove("hidden");
    recentSearches.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.innerText = city;
        recentDropdown.appendChild(option);
    });

    recentDropdown.addEventListener("change", function () {
        document.getElementById("cityInput").value = this.value;
        fetchWeather();
    });
}

function fetchWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then(data => {
            updateWeatherUI(data);
            saveToRecentSearches(city);
            fetchForecast(city);
        })
        .catch(error => showError(error.message));
}

function updateWeatherUI(data) {
    document.getElementById("weatherInfo").classList.remove("hidden");
    document.getElementById("location").innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById("temperature").innerText = `Temperature: ${data.main.temp}°C`;
    document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
    document.getElementById("windSpeed").innerText = `Wind Speed: ${data.wind.speed} m/s`;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

function fetchForecast(city) {
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    fetch(forecastApiUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("forecast").classList.remove("hidden");
            const forecastContainer = document.getElementById("forecastContainer");
            forecastContainer.innerHTML = "";

            for (let i = 0; i < data.list.length; i += 8) {
                const day = data.list[i];
                const forecastDiv = document.createElement("div");
                forecastDiv.classList.add("bg-gray-200", "p-2", "rounded-md", "text-center");
                forecastDiv.innerHTML = `
                    <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
                    <p>${day.main.temp}°C</p>
                    <p>${day.wind.speed} m/s</p>
                    <p>${day.main.humidity}% Humidity</p>
                `;
                forecastContainer.appendChild(forecastDiv);
            }
        })
        .catch(error => showError("Error fetching forecast."));
}

function saveToRecentSearches(city) {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
}

function showError(message) {
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.innerText = message;
    errorMsg.classList.remove("hidden");
}