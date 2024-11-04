 // Custom icons mapping for different weather conditions
const customIcons = {
    Clear: "img/clear.png",
    Clouds: "img/clouds.png",
    Rain: "img/rain.png",
    Snow: "img/snow.png",
    Mist: "img/mist.png",
    // Add more conditions as needed
};

// Function to update the weather icon based on weather condition
function updateWeatherIcon(weatherCondition, iconElement) {
    const iconPath = customIcons[weatherCondition];
    if (iconPath) {
        iconElement.src = iconPath;
    } else {
        iconElement.src = "img/pngwing.com.png"; // Fallback icon
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "576ba0e65ccb31e9eba550e6b2959f2f"; // Use your actual OpenWeatherMap API key here
    const searchButton = document.getElementById("search-btn");
    const cityInput = document.getElementById("city-input");
    const currentLocationBtn = document.querySelector(".current-location-btn");
    const dropdownMenu = document.getElementById("dropdown-menu"); // Ensure this ID matches your HTML

    // Load cities from local storage on page load
    const loadRecentCities = () => {
        const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
        updateDropdownMenu(cities);
    };

    // Function to fetch current weather data for a specific city
    const fetchWeather = (city) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("City not found");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Current weather data:", data); // Log the data for debugging
                updateWeatherUI(data);
                addCityToDropdown(city); // Add city to dropdown
                fetchFiveDayForecast(city); // Call 5-day forecast after getting current weather
            })
            .catch((error) => {
                console.error("Error fetching weather data:", error);
                alert("City not found. Please enter a valid city name.");
            });
    };

    // Function to fetch 5-day forecast data
    const fetchFiveDayForecast = (city) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Forecast data not found");
                }
                return response.json();
            })
            .then((data) => {
                console.log("5-day forecast data:", data); // Log the data for debugging
                updateForecastUI(data);
            })
            .catch((error) => {
                console.error("Error fetching 5-day forecast:", error);
            });
    };

    // Function to update the UI based on the fetched current weather data
    const updateWeatherUI = (data) => {
        document.getElementById("current-date").textContent = new Date().toLocaleDateString();
        document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById("weather-description").textContent = data.weather[0].description;
        document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
        document.getElementById("wind-speed").textContent = `Wind: ${data.wind.speed} km/h`;
        document.getElementById("country").textContent = `Country: ${data.sys.country}`;

        // Update the weather icon based on the fetched data
        const weatherCondition = data.weather[0].main;
        const iconElement = document.getElementById("weather-icon");
        updateWeatherIcon(weatherCondition, iconElement);
    };

    // Function to add city to dropdown and local storage
    const addCityToDropdown = (city) => {
        let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

        // Avoid duplicates
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem("recentCities", JSON.stringify(cities));
            updateDropdownMenu(cities);
        }
    };

    // Function to update the dropdown menu with recently searched cities
    const updateDropdownMenu = (cities) => {
        dropdownMenu.innerHTML = ""; // Clear existing items
        cities.forEach((city) => {
            const cityItem = document.createElement("div");
            cityItem.textContent = city;
            cityItem.classList.add("dropdown-item");
            cityItem.onclick = () => {
                cityInput.value = city; // Set the city input to the selected city
                fetchWeather(city); // Fetch weather data for the selected city
            };
            dropdownMenu.appendChild(cityItem);
        });
    };

    // Function to update the 5-day forecast UI
    const updateForecastUI = (data) => {
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = ""; // Clear existing forecast data

        const dailyData = {};
        data.list.forEach((forecast) => {
            const date = forecast.dt_txt.split(" ")[0];
            if (!dailyData[date]) {
                dailyData[date] = {
                    temp: forecast.main.temp,
                    humidity: forecast.main.humidity,
                    wind: forecast.wind.speed,
                    weather: forecast.weather[0].main,
                    icon: forecast.weather[0].icon,
                };
            }
        });

        Object.keys(dailyData).slice(0, 5).forEach((date) => {
            const day = dailyData[date];
            const dayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

            const forecastHTML = `
                <div class="forecast-day">
                    <p>${dayName}</p>
                    <p>${Math.round(day.temp)}°C</p>
                    <p>Humidity: ${day.humidity}%</p>
                    <p>Wind: ${day.wind} km/h</p>
                    <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather}">
                    <p>${new Date(date).toLocaleDateString()}</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastHTML;
        });
    };

    // Event listener for the search button
    searchButton.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            alert("Please enter a city name.");
        }
    });

    // Function to fetch weather based on current location
    const fetchCurrentLocationWeather = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Location data not found");
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log("Location weather data:", data); // Log for debugging
                        updateWeatherUI(data);
                        fetchFiveDayForecast(data.name); // Fetch 5-day forecast for the location
                    })
                    .catch((error) => {
                        console.error("Error fetching location weather data:", error);
                        alert("Unable to fetch weather for your location.");
                    });
            }, () => {
                alert("Unable to retrieve your location. Please allow location access.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // Event listener for the current location button
    currentLocationBtn.addEventListener("click", fetchCurrentLocationWeather);

    // Load recent cities on page load
    loadRecentCities();
});
