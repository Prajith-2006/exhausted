import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import Badge from '../components/Badge';
import { 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  Sun, 
  Wind, 
  Droplets, 
  Eye, 
  Gauge, 
  Compass, 
  Thermometer,
  Zap
} from 'lucide-react';

export default function Weather() {
  const { selectedFarm } = useFarm();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  useEffect(() => {
    if (!selectedFarm) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await api.getWeatherForFarm(selectedFarm._id);
        setWeatherData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [selectedFarm]);

  if (loading) return <LoadingSpinner message="Retrieving localized farm weather forecast..." />;

  if (!weatherData) return <EmptyState title="Weather Unavailable" message="Could not fetch weather data for the selected farm." />;

  const current = weatherData.current;
  const forecast = weatherData.forecast || [];

  // Construct 7-day array starting with Today
  const daysList = [
    {
      label: 'Today',
      dayName: 'Today',
      temp: current.temperature,
      condition: current.weatherCondition,
      windSpeed: current.windSpeed,
      humidity: current.humidity,
      rainfall: current.rainfall,
      precipitationProbability: current.precipitationProbability,
      rawDate: new Date()
    },
    ...forecast.map((f, idx) => {
      const dateObj = new Date(f.forecastTime || Date.now() + (idx + 1) * 86400000);
      const dayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      return {
        label: `${dayShort}`,
        dayName: dayShort,
        temp: f.temperature,
        condition: f.weatherCondition,
        windSpeed: f.windSpeed,
        humidity: f.humidity,
        rainfall: f.rainfall,
        precipitationProbability: f.precipitationProbability,
        rawDate: dateObj
      };
    })
  ];

  const activeDay = daysList[activeDayIndex] || daysList[0];

  // Helper to choose Lucide weather icon
  const getWeatherIcon = (condStr, size = 18, color = 'currentColor') => {
    const c = (condStr || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain size={size} color={color} />;
    if (c.includes('clear') || c.includes('sun')) return <Sun size={size} color={color} />;
    if (c.includes('cloud') && c.includes('partly')) return <CloudSun size={size} color={color} />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud size={size} color={color} />;
    return <CloudSun size={size} color={color} />;
  };

  // Helper to retrieve sample real-sky photo background based on weather condition
  const getWeatherBgImage = (condStr) => {
    const c = (condStr || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower') || c.includes('storm')) {
      return 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1000&q=80';
    }
    if (c.includes('clear') || c.includes('sun')) {
      return 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1000&q=80';
    }
    if (c.includes('overcast') || c.includes('fog') || c.includes('mist')) {
      return 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=1000&q=80';
    }
    // Default: Partly Cloudy / Broken Clouds atmospheric sky photo
    return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80';
  };

  // Generate 9 hourly forecast points for selected active day matching user reference picture
  const baseTemp = Math.round(activeDay.temp);
  const hourlyTimes = ['7 p.m', '8 p.m', '9 p.m', '10 p.m', '11 p.m', '12 a.m', '1 a.m', '2 a.m', '3 a.m'];
  const hourlyTemps = [
    baseTemp, 
    baseTemp, 
    baseTemp - 1, 
    baseTemp - 1, 
    baseTemp - 1, 
    baseTemp - 2, 
    baseTemp - 3, 
    baseTemp - 3, 
    baseTemp - 4
  ];

  // Calculate SVG curve points for temperature trend line
  const svgWidth = 650;
  const svgHeight = 120;
  const minTemp = Math.min(...hourlyTemps) - 2;
  const maxTemp = Math.max(...hourlyTemps) + 2;
  
  const points = hourlyTemps.map((temp, index) => {
    const x = (index / (hourlyTemps.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - ((temp - minTemp) / (maxTemp - minTemp)) * (svgHeight - 40) - 20;
    return { x, y, temp };
  });

  // Build cubic bezier path string
  let dPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    dPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  // Calculate dew point estimate
  const dewPoint = Math.round(activeDay.temp - ((100 - activeDay.humidity) / 5));

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Page Title & Farm Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Agricultural Weather Station</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Micro-climate tracking for {selectedFarm?.name} ({selectedFarm?.location?.address || 'Farm location'})
          </p>
        </div>
        <Badge type="success">Active Sync</Badge>
      </div>

      {/* Top 7-Day Forecast Tab Bar (Matching Reference Picture) */}
      <div className="weather-tabs-scroll">
        {daysList.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <div
              key={idx}
              className={`weather-day-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveDayIndex(idx)}
            >
              <span>{day.dayName} {Math.round(day.temp)}°</span>
              {getWeatherIcon(day.condition, 16, isActive ? '#FFFFFF' : 'var(--text-muted)')}
            </div>
          );
        })}
      </div>

      {/* Main Grid: Left Details & Right Hourly Forecast */}
      <div className="weather-main-grid">
        {/* Left Column: Hero Weather Card + 6 Stats Grid */}
        <div>
          {/* Hero Condition Card with Dynamic Real Weather Condition Background */}
          <div 
            className="weather-hero-card"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(15, 28, 38, 0.35) 0%, rgba(15, 28, 38, 0.8) 100%), url(${getWeatherBgImage(activeDay.condition)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'background-image 0.5s ease-in-out'
            }}
          >
            <div className="weather-hero-clouds-bg" />
            
            <div className="weather-hero-top">
              <span className="weather-hero-time">7:25 PM</span>
            </div>

            <div className="weather-hero-bottom">
              <div className="weather-hero-temp">
                {Math.round(activeDay.temp)}°
              </div>
              <div className="weather-hero-condition">
                <div className="weather-hero-condition-title">{activeDay.condition}</div>
                <div className="weather-hero-condition-sub">Feels like {Math.round(activeDay.temp)}°</div>
              </div>
            </div>
          </div>

          {/* 6-Grid Weather Stats Matrix (Matching Reference Picture) */}
          <div className="weather-stats-grid">
            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Wind size={14} color="var(--text-muted)" />
                <span>Wind</span>
              </div>
              <div className="weather-stat-val">
                {activeDay.windSpeed ? `${Math.round(activeDay.windSpeed)} m/s SW` : '4 m/s SW'}
              </div>
            </div>

            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Droplets size={14} color="var(--text-muted)" />
                <span>Humidity</span>
              </div>
              <div className="weather-stat-val">
                {activeDay.humidity}%
              </div>
            </div>

            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Eye size={14} color="var(--text-muted)" />
                <span>Visibility</span>
              </div>
              <div className="weather-stat-val">
                10km
              </div>
            </div>

            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Gauge size={14} color="var(--text-muted)" />
                <span>Pressure</span>
              </div>
              <div className="weather-stat-val">
                1017 hPa
              </div>
            </div>

            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Sun size={14} color="var(--text-muted)" />
                <span>UV Index</span>
              </div>
              <div className="weather-stat-val">
                0 UV
              </div>
            </div>

            <div className="weather-stat-card">
              <div className="weather-stat-header">
                <Thermometer size={14} color="var(--text-muted)" />
                <span>Dew Point</span>
              </div>
              <div className="weather-stat-val">
                {dewPoint}°C
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hourly Forecast Curve + Column Cards */}
        <div className="hourly-chart-card">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
              Hourly forecast
            </h3>

            {/* Spline Line Graph Card */}
            <div style={{ position: 'relative', width: '100%', height: '140px', background: '#FAFBF9', borderRadius: 'var(--radius-sm)', border: '1px solid #E4ECE7', padding: '0.5rem' }}>
              <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#E0533C" />
                  </linearGradient>
                </defs>

                {/* Spline Path */}
                <path
                  d={dPath}
                  fill="none"
                  stroke="url(#lineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#D97706"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* 9-Column Hourly Cards Strip (Matching Reference Picture) */}
          <div className="hourly-grid">
            {hourlyTimes.map((timeLabel, idx) => (
              <div key={idx} className="hourly-column-item">
                <span className="hourly-time">{timeLabel}</span>
                <div style={{ margin: '0.25rem 0' }}>
                  {getWeatherIcon(activeDay.condition, 18, 'rgba(255,255,255,0.7)')}
                </div>
                <span className="hourly-precip">0%</span>
                <span className="hourly-temp">{hourlyTemps[idx]}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

