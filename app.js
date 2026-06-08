// Weather code to emoji mapping (WMO codes)
const weatherEmojis = {
    0: '☀️',    // Clear sky
    1: '🌤️',   // Mainly clear
    2: '⛅',    // Partly cloudy
    3: '☁️',    // Overcast
    45: '🌫️',   // Foggy
    48: '🌫️',   // Foggy (with hoarfrost)
    51: '🌧️',   // Light drizzle
    53: '🌧️',   // Moderate drizzle
    55: '🌧️',   // Dense drizzle
    61: '🌧️',   // Slight rain
    63: '🌧️',   // Moderate rain
    65: '🌧️',   // Heavy rain
    71: '❄️',    // Slight snow
    73: '❄️',    // Moderate snow
    75: '❄️',    // Heavy snow
    80: '🌧️',   // Slight rain showers
    81: '🌧️',   // Moderate rain showers
    82: '🌧️',   // Violent rain showers
    85: '❄️',    // Slight snow showers
    86: '❄️',    // Heavy snow showers
    95: '⛈️',    // Thunderstorm
    96: '⛈️',    // Thunderstorm with hail
    99: '⛈️'     // Thunderstorm with hail
};

// Major US cities for fallback
const fallbackCities = [
    { name: 'New York City', lat: 40.7128, lon: -74.0060 },
    { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 }
];

function getWeatherEmoji(code) {
    return weatherEmojis[code] || '🌈';
}

function celsiusToFahrenheit(c) {
    return Math.round((c * 9 / 5) + 32);
}

function renderWeatherCard(temp, tempF, emoji, location) {
    return `
        <div class="weather-item">
            <div class="weather-emoji">${emoji}</div>
            <div class="weather-info">
                <div class="weather-location">${location}</div>
                <div class="weather-temps">
                    <span class="temp-c">${temp}°C</span>
                    <span class="temp-divider">/</span>
                    <span class="temp-f">${tempF}°F</span>
                </div>
            </div>
        </div>
    `;
}

function fetchWeatherForLocation(latitude, longitude, locationName, isUserLocation = false) {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const temp = Math.round(data.current.temperature_2m);
            const tempF = celsiusToFahrenheit(temp);
            const weatherCode = data.current.weather_code;
            const emoji = getWeatherEmoji(weatherCode);
            const location = isUserLocation ? '📍 Your Location' : locationName;

            return renderWeatherCard(temp, tempF, emoji, location);
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            return null;
        });
}

function displayFallbackCities() {
    const weatherWidget = document.getElementById('weather-widget');
    const promises = fallbackCities.map(city =>
        fetchWeatherForLocation(city.lat, city.lon, city.name)
    );

    Promise.all(promises).then(results => {
        const validResults = results.filter(r => r !== null);
        if (validResults.length > 0) {
            weatherWidget.innerHTML = `
                <div class="weather-header">
                    <p>Enable location access to see your weather</p>
                </div>
                <div class="weather-cities">
                    ${validResults.join('')}
                </div>
            `;
        } else {
            weatherWidget.innerHTML = `
                <div class="weather-error">
                    <p>Unable to load weather</p>
                </div>
            `;
        }
    });
}

if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherForLocation(latitude, longitude, null, true)
                .then(html => {
                    if (html) {
                        const weatherWidget = document.getElementById('weather-widget');
                        weatherWidget.innerHTML = `
                            <div class="weather-content">
                                ${html}
                            </div>
                        `;
                    }
                });
        },
        (error) => {
            console.log('Geolocation error:', error);
            displayFallbackCities();
        }
    );
} else {
    displayFallbackCities();
}
