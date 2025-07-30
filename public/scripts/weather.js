document.addEventListener('DOMContentLoaded', () => {
  // Get references to HTML elements by their IDs
  const cityInput = document.getElementById('city-input'); // Input box for city name
  const searchBtn = document.getElementById('search-btn'); // Button to search by city
  const locationBtn = document.getElementById('location-btn'); // Button to use current location
  const weatherDisplay = document.getElementById('weather-display'); // Container for current weather
  const forecastContainer = document.getElementById('forecast-container'); // Container for forecast
  const errorElement = document.getElementById('error-message'); // Element to show errors

  // Elements for displaying weather details
  const cityName = document.getElementById('city-name');
  const temperature = document.getElementById('temperature');
  const weatherIcon = document.getElementById('weather-icon');
  const weatherDescription = document.getElementById('weather-description');
  const humidity = document.getElementById('humidity');
  const windSpeed = document.getElementById('wind-speed');
  const feelsLike = document.getElementById('feels-like');

  // Function to fetch weather data from your server
  async function fetchWeather(endpoint, params) {
    try {
      // Build the query string from parameters
      const query = new URLSearchParams(params).toString();
      // Make a request to your backend server
      const response = await fetch(`${endpoint}?${query}`);
      // Full Render URL (if frontend/backend are separate)
      //const response = await fetch(`https://your-weather-app.onrender.com${endpoint}?${query}`);
      
      // If the response is not OK, handle the error
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch data');
      }
      
      // Return the JSON data
      return await response.json();
    } catch (error) {
      showError(error.message); // Show error to user
      throw error; // Also throw error for debugging
    }
  }

  // Function to update the current weather section in the UI
  function updateCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys?.country || ''}`; // City and country
    temperature.textContent = `${Math.round(data.main.temp)}°C`; // Temperature
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`; // Weather icon
    weatherDescription.textContent = data.weather[0].description; // Description (e.g., "clear sky")
    humidity.textContent = `${data.main.humidity}%`; // Humidity
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Wind speed (converted to km/h)
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`; // "Feels like" temperature
  }

  // Function to update the forecast section in the UI
  function updateForecast(data) {
    forecastContainer.innerHTML = ''; // Clear previous forecast

    // Get one forecast per day (API returns every 3 hours, so every 8th item is a new day)
    const dailyData = data.list.filter((_, index) => index % 8 === 0);

    dailyData.forEach(item => {
      const date = new Date(item.dt * 1000); // Convert timestamp to JS Date
      const dayElement = document.createElement('div');
      dayElement.className = 'forecast-day';
      dayElement.innerHTML = `
        <div>${date.toLocaleDateString('en', { weekday: 'short' })}</div> <!-- Day of week -->
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"> <!-- Weather icon -->
        <div>${Math.round(item.main.temp_max)}°/${Math.round(item.main.temp_min)}°</div> <!-- Max/Min temp -->
      `;
      forecastContainer.appendChild(dayElement); // Add to forecast container
    });
  }

  // Function to show error messages to the user
  function showError(message) {
    errorElement.textContent = message; // Display error
    setTimeout(() => errorElement.textContent = '', 5000); // Clear after 5 seconds
  }

  // Handler for searching weather by city name
  async function handleSearch() {
    const city = cityInput.value.trim(); // Get city from input
    if (!city) return; // Do nothing if input is empty
    
    try {
      // Fetch current weather and forecast in parallel
      const [current, forecast] = await Promise.all([
        fetchWeather('/api/weather', { city }),
        fetchWeather('/api/forecast', { city })
      ]);
      
      updateCurrentWeather(current); // Update current weather section
      updateForecast(forecast); // Update forecast section
    } catch (error) {
      console.error('Error:', error); // Log error for debugging
    }
  }

  // Handler for searching weather by user's current location
  async function handleLocation() {
    if (!navigator.geolocation) {
      showError('Geolocation not supported'); // If browser doesn't support geolocation
      return;
    }
    
    // Get user's current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords; // Get lat/lon
          // Fetch current weather and forecast for location
          const [current, forecast] = await Promise.all([
            fetchWeather('/api/weather', { lat, lon }),
            fetchWeather('/api/forecast', { lat, lon })
          ]);
          
          updateCurrentWeather(current); // Update current weather section
          updateForecast(forecast); // Update forecast section
          cityInput.value = current.name; // Set input to city name
        } catch (error) {
          console.error('Location error:', error); // Log error for debugging
        }
      },
      (error) => showError(`Location access denied: ${error.message}`) // If user denies location access
    );
  }

  // Add event listeners to buttons and input
  searchBtn.addEventListener('click', handleSearch); // Search button
  locationBtn.addEventListener('click', handleLocation); // Location button
  cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch()); // Enter key in input

  // Automatically search for weather when page loads (default city if input is pre-filled)
  handleSearch();
});