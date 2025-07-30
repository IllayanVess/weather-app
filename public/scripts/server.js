// Load environment variables from .env file (for API keys, etc.)
// require('dotenv').config(); not required for render hosting, but can be used locally

// Import required modules
const express = require('express'); // Web server framework
const axios = require('axios');     // For making HTTP requests
const path = require('path');       // For handling file paths
const cors = require('cors');       // To allow cross-origin requests (frontend can call backend)

// Create an Express app
const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Middleware
app.use(cors()); // Enable CORS so browser can access API
app.use(express.static(path.join(__dirname, 'public/'))); // Serve static files (HTML, CSS, JS) from public directory

// Weather Endpoint - handles requests for current weather
app.get('/api/weather', async (req, res) => {
  try {
    // Get query parameters from the request (city name or latitude/longitude)
    const { city, lat, lon } = req.query;
    
    // Check if API key is available
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('API key not configured');
    }

    // Build the OpenWeatherMap API URL
    let url = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    if (city) url += `&q=${city}`;           // Add city to URL if provided
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`; // Add coordinates if provided

    // Make request to OpenWeatherMap API
    const response = await axios.get(url);
    res.json(response.data); // Send weather data back to browser
  } catch (error) {
    // If there's an error, log it and send an error message to browser
    console.error('API Error:', error.message);
    res.status(500).json({ 
      error: error.response?.data?.message || 'Weather data unavailable' 
    });
  }
});

// Forecast Endpoint - handles requests for weather forecast
app.get('/api/forecast', async (req, res) => {
  try {
    // Get query parameters from the request
    const { city, lat, lon } = req.query;

    // Check if API key is available
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error('API key not configured');
    }

    // Build the OpenWeatherMap API URL for forecast
    let url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    if (city) url += `&q=${city}`;
    if (lat && lon) url += `&lat=${lat}&lon=${lon}`;

    // Make request to OpenWeatherMap API
    const response = await axios.get(url);
    res.json(response.data); // Send forecast data back to browser
  } catch (error) {
    // If there's an error, log it and send an error message to browser
    console.error('API Error:', error.message);
    res.status(500).json({
      error: error.response?.data?.message || 'Forecast data unavailable'
    });
  }
});

// Start Server - listen for requests
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Test: http://localhost:${PORT}/api/weather?city=Paris`);
});