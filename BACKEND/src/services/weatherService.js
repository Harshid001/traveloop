/**
 * @fileoverview OpenWeatherMap API proxy service.
 * Wraps current weather, forecast, and convenience summary endpoints.
 * Returns normalized weather objects; falls back gracefully when unavailable.
 */

const axios = require('axios');
const env = require('../config/env');

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map an OpenWeatherMap weather code to a simplified condition string.
 * @param {number} id - OWM weather condition ID
 * @returns {string} Simplified condition
 */
const mapCondition = (id) => {
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rainy';
  if (id >= 600 && id < 700) return 'snowy';
  if (id >= 700 && id < 800) return 'foggy';
  if (id === 800) return 'sunny';
  if (id > 800) return 'cloudy';
  return 'unknown';
};

/**
 * Normalize a raw OWM weather response into the app-standard shape.
 * @param {object} data - Raw OWM response object
 * @returns {object} Normalized weather object
 */
const normalizeWeather = (data) => {
  const weather = data.weather?.[0] || {};
  return {
    temp: data.main?.temp ?? null,
    feelsLike: data.main?.feels_like ?? null,
    humidity: data.main?.humidity ?? null,
    description: weather.description || '',
    icon: weather.icon || '',
    iconUrl: weather.icon
      ? `https://openweathermap.org/img/wn/${weather.icon}@2x.png`
      : '',
    windSpeed: data.wind?.speed ?? null,
    clouds: data.clouds?.all ?? null,
    condition: weather.id ? mapCondition(weather.id) : 'unknown',
    sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
    sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
  };
};

/** Standard fallback when the weather API is unavailable. */
const FALLBACK_WEATHER = {
  temp: null,
  feelsLike: null,
  humidity: null,
  description: 'Weather data unavailable',
  icon: '',
  iconUrl: '',
  windSpeed: null,
  clouds: null,
  condition: 'unknown',
  sunrise: null,
  sunset: null,
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get current weather for a location.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Normalized weather object
 */
const getCurrentWeather = async (lat, lng) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat,
        lon: lng,
        appid: env.OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });

    return {
      ...normalizeWeather(data),
      location: data.name || '',
      country: data.sys?.country || '',
    };
  } catch (error) {
    console.error('weatherService.getCurrentWeather error:', error.message);
    return { ...FALLBACK_WEATHER, location: '', country: '' };
  }
};

/**
 * Get a multi-day weather forecast for a location.
 * OpenWeatherMap free tier returns 3-hour intervals; cnt controls the number
 * of intervals returned (8 intervals ≈ 1 day).
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} [days=5] - Number of forecast days (max 5 on free tier)
 * @returns {Promise<object>} { location, country, forecasts: normalizedWeather[] }
 */
const getWeatherForecast = async (lat, lng, days = 5) => {
  try {
    const cnt = Math.min(days, 5) * 8; // 8 intervals per day
    const { data } = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon: lng,
        appid: env.OPENWEATHER_API_KEY,
        units: 'metric',
        cnt,
      },
    });

    const forecasts = (data.list || []).map((item) => ({
      ...normalizeWeather(item),
      dateTime: item.dt_txt || new Date(item.dt * 1000).toISOString(),
    }));

    return {
      location: data.city?.name || '',
      country: data.city?.country || '',
      forecasts,
    };
  } catch (error) {
    console.error('weatherService.getWeatherForecast error:', error.message);
    return { location: '', country: '', forecasts: [] };
  }
};

/**
 * Get a simplified weather summary for a destination.
 * Combines current weather with a short forecast overview.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Weather summary
 */
const getWeatherSummary = async (lat, lng) => {
  try {
    const [current, forecast] = await Promise.all([
      getCurrentWeather(lat, lng),
      getWeatherForecast(lat, lng, 3),
    ]);

    // Aggregate upcoming conditions for a quick glance
    const upcomingConditions = forecast.forecasts
      .filter((_, i) => i % 8 === 4) // pick midday reading per day
      .map((f) => ({
        date: f.dateTime,
        temp: f.temp,
        condition: f.condition,
        description: f.description,
      }));

    return {
      current,
      upcoming: upcomingConditions,
      location: current.location,
      country: current.country,
    };
  } catch (error) {
    console.error('weatherService.getWeatherSummary error:', error.message);
    return {
      current: FALLBACK_WEATHER,
      upcoming: [],
      location: '',
      country: '',
    };
  }
};

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherSummary,
};
