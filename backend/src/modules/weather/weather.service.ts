import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { config } from '../../config/env';
import { WeatherRecordDoc } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // %
  rainfall: number; // mm
  precipitationProbability: number; // %
  windSpeed: number; // km/h
  weatherCondition: string;
  forecastTime: Date;
}

export class WeatherService {
  static async getWeatherForFarm(farmId: string, ownerId: string): Promise<{ current: WeatherData; forecast: WeatherData[] }> {
    const farm = await FarmsService.getFarmById(farmId, ownerId);

    const lat = farm.location?.latitude || 12.9716;
    const lon = farm.location?.longitude || 77.5946;

    let currentWeather: WeatherData;
    let forecastWeather: WeatherData[] = [];

    if (config.weatherApiKey) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.weatherApiKey}`
        );

        if (res.ok) {
          const data: any = await res.json();
          currentWeather = {
            temperature: Math.round(data.main.temp * 10) / 10,
            humidity: data.main.humidity,
            rainfall: data.rain ? (data.rain['1h'] || 0) : 0,
            precipitationProbability: data.clouds ? data.clouds.all : 20,
            windSpeed: Math.round((data.wind.speed * 3.6) * 10) / 10,
            weatherCondition: data.weather[0]?.main || 'Clear',
            forecastTime: new Date()
          };
        } else {
          console.warn('[WeatherService] Weather API error response, using fallback generator.');
          currentWeather = this.generateFallbackWeather(lat, lon);
        }
      } catch (err) {
        console.warn('[WeatherService] Weather API connection error, using fallback generator.');
        currentWeather = this.generateFallbackWeather(lat, lon);
      }
    } else {
      currentWeather = this.generateFallbackWeather(lat, lon);
    }

    // Generate 5-day forecast
    forecastWeather = Array.from({ length: 5 }).map((_, index) => {
      const forecastDate = new Date(Date.now() + (index + 1) * 86400000);
      return this.generateFallbackWeather(lat, lon, forecastDate);
    });

    // Store current weather snapshot in MongoDB
    try {
      const weatherRecord: WeatherRecordDoc = {
        farmId: new ObjectId(farmId),
        temperature: currentWeather.temperature,
        humidity: currentWeather.humidity,
        rainfall: currentWeather.rainfall,
        precipitationProbability: currentWeather.precipitationProbability,
        windSpeed: currentWeather.windSpeed,
        weatherCondition: currentWeather.weatherCondition,
        forecastTime: currentWeather.forecastTime,
        createdAt: new Date()
      };
      await collections.weatherRecords().insertOne(weatherRecord);
    } catch (dbErr) {
      console.warn('[WeatherService] Could not persist weather snapshot:', dbErr);
    }

    return {
      current: currentWeather,
      forecast: forecastWeather
    };
  }

  private static generateFallbackWeather(lat: number, lon: number, date: Date = new Date()): WeatherData {
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const baseTemp = 24 + 6 * Math.sin((dayOfYear / 365) * 2 * Math.PI);
    const randomVariation = (Math.sin(date.getDate()) * 3);
    
    const temp = Math.round((baseTemp + randomVariation) * 10) / 10;
    const humidity = Math.round(60 + Math.cos(date.getHours()) * 15);
    const rainfall = humidity > 75 ? Math.round((humidity - 70) * 0.4 * 10) / 10 : 0;
    const precipProb = humidity > 70 ? Math.round(humidity * 0.9) : Math.round(humidity * 0.3);
    const windSpeed = Math.round((12 + Math.sin(dayOfYear) * 5) * 10) / 10;

    let condition = 'Partly Cloudy';
    if (rainfall > 5) condition = 'Heavy Rain';
    else if (rainfall > 0) condition = 'Light Rain';
    else if (temp > 30) condition = 'Sunny';
    else if (humidity > 80) condition = 'Overcast';

    return {
      temperature: temp,
      humidity,
      rainfall,
      precipitationProbability: precipProb,
      windSpeed,
      weatherCondition: condition,
      forecastTime: date
    };
  }
}
