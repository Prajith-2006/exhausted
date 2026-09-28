import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/EmptyState';
import Badge from '../components/Badge';
import {
  Home,
  Wheat,
  Cpu,
  Bell,
  CloudSun,
  Sparkles,
  Bug,
  SunMedium,
  ArrowUpRight,
  Droplets,
  Wind,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { farms, selectedFarm } = useFarm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    crops: [],
    sensors: [],
    pests: [],
    alerts: [],
    recommendations: [],
    weather: null
  });

  useEffect(() => {
    if (!selectedFarm) {
      setLoading(false);
      return;
    }
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const farmId = selectedFarm._id;
        const [crops, sensors, pests, alerts, recommendations, weather] = await Promise.all([
          api.getCrops(farmId).catch(() => []),
          api.getSensors(farmId).catch(() => []),
          api.getPests(farmId).catch(() => []),
          api.getAlerts(true).catch(() => []),
          api.getRecommendations(farmId).catch(() => []),
          api.getWeatherForFarm(farmId).catch(() => null)
        ]);

        setSummary({ crops, sensors, pests, alerts, recommendations, weather });
      } catch (err) {
        console.error('Error loading dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [selectedFarm]);

  if (loading) return <LoadingSpinner message="Aggregating Fieldnote telemetry & signals..." />;

  const activeCrops = summary.crops.filter(c => c.status === 'ACTIVE');
  const activeSensors = summary.sensors.filter(s => s.status === 'ACTIVE');

  return (
    <div>
      {/* FIELD PULSE Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #183D2D 0%, #0F2B1E 100%)',
          borderRadius: '20px',
          padding: '2.25rem 2.5rem',
          color: '#FFFFFF',
          marginBottom: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(24, 61, 45, 0.15)'
        }}
      >
        {/* Background decorative circles */}
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '40px', top: '10px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

        <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#A2CBB5', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              FIELD PULSE
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
              Your farm, at a glance.
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#C2DEC8', fontWeight: 400 }}>
              Small signals become better decisions when they are all in one place.
            </p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(8px)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SunMedium size={42} color="#A2CBB5" />
          </div>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid-cols-3" style={{ marginBottom: '1.75rem' }}>
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.5rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.85rem', fontWeight: 600 }}>Farms</span>
          <h2 style={{ fontSize: '2rem', color: '#183D2D', fontWeight: 800, margin: '0.3rem 0 0.1rem 0' }}>{farms.length}</h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>Growing places</span>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.5rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.85rem', fontWeight: 600 }}>Active crops</span>
          <h2 style={{ fontSize: '2rem', color: '#183D2D', fontWeight: 800, margin: '0.3rem 0 0.1rem 0' }}>{activeCrops.length}</h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>This season</span>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.5rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.85rem', fontWeight: 600 }}>Unread alerts</span>
          <h2 style={{ fontSize: '2rem', color: summary.alerts.length > 0 ? '#E0533C' : '#183D2D', fontWeight: 800, margin: '0.3rem 0 0.1rem 0' }}>
            {summary.alerts.length}
          </h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>Needs your attention</span>
        </div>
      </div>

      {/* Middle Section: Places & Latest Alerts */}
      <div className="grid-cols-3" style={{ marginBottom: '1.75rem' }}>
        {/* Your Places: Farms & fields */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B8074', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                YOUR PLACES
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#183D2D', fontWeight: 800 }}>Farms & fields</h3>
            </div>
            <button className="btn btn-secondary btn-sm flex items-center gap-1" onClick={() => navigate('/farms')}>
              <span>View all</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {farms.map((f) => (
              <div
                key={f._id}
                className="flex items-center justify-between"
                style={{
                  padding: '1rem 1.2rem',
                  background: '#F8FAF8',
                  borderRadius: '14px',
                  border: '1px solid #E4ECE7',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/farms')}
              >
                <div className="flex items-center gap-3">
                  <div style={{ background: '#E6F2EB', padding: '0.6rem', borderRadius: '10px', display: 'flex' }}>
                    <Wheat size={20} color="#183D2D" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#183D2D', fontWeight: 700 }}>{f.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#6B8074' }}>{f.location?.address || 'Primary Farm'} • {f.totalArea} {f.areaUnit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: '9999px', border: '1px solid #C8E2D3' }}>
                    Healthy
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention: Latest Alerts */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B8074', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ATTENTION
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#183D2D', fontWeight: 800 }}>Latest alerts</h3>
              </div>
              <Bell size={18} color="#6B8074" />
            </div>

            {summary.alerts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {summary.alerts.slice(0, 2).map((a) => (
                  <div key={a._id} style={{ background: '#FFF9F8', border: '1px solid #F8DFDB', borderRadius: '12px', padding: '0.9rem 1rem' }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.3rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E0533C' }} />
                      <h5 style={{ fontSize: '0.9rem', color: '#183D2D', fontWeight: 700 }}>{a.title}</h5>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#5C7064', lineHeight: 1.4 }}>{a.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="#183D2D" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#183D2D' }}>All fields optimal</span>
                <span style={{ fontSize: '0.78rem', color: '#6B8074', marginTop: '0.2rem' }}>No critical alerts requiring intervention</span>
              </div>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alerts')} style={{ marginTop: '1rem', width: '100%' }}>
            View all alerts
          </button>
        </div>
      </div>

      {/* Bottom Section: Weather & AI Recommendation */}
      <div className="grid-cols-3">
        {/* Weather Forecast */}
        <div className="glass-card flex flex-col justify-between" style={{ gridColumn: 'span 1' }}>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="flex items-center gap-2" style={{ fontSize: '1.05rem', color: '#183D2D', fontWeight: 700 }}>
                <CloudSun size={20} color="#183D2D" />
                <span>Live Weather</span>
              </h3>
              <span className="badge badge-success">Local Sync</span>
            </div>

            {summary.weather?.current ? (
              <div>
                <div className="flex items-center justify-between" style={{ padding: '0.5rem 0' }}>
                  <div>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#183D2D' }}>{summary.weather.current.temperature}°C</span>
                    <div style={{ color: '#5C7064', fontSize: '0.85rem' }}>{summary.weather.current.weatherCondition}</div>
                  </div>
                  <div className="flex flex-col gap-1" style={{ textAlign: 'right', fontSize: '0.82rem', color: '#5C7064' }}>
                    <div className="flex items-center gap-1 justify-between">
                      <Droplets size={14} color="#183D2D" />
                      <span>{summary.weather.current.humidity}% Humidity</span>
                    </div>
                    <div className="flex items-center gap-1 justify-between">
                      <Wind size={14} color="#183D2D" />
                      <span>{summary.weather.current.windSpeed} km/h</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid #E2ECE5' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6B8074', fontWeight: 700, textTransform: 'uppercase' }}>5-DAY FORECAST</span>
                  <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
                    {summary.weather.forecast.map((f, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                        <div style={{ color: '#6B8074' }}>+{i+1}d</div>
                        <div style={{ fontWeight: 700, color: '#183D2D', margin: '0.1rem 0' }}>{f.temperature}°</div>
                        <div style={{ color: '#829489', fontSize: '0.65rem' }}>{f.precipitationProbability}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#6B8074', fontSize: '0.85rem', padding: '1rem 0' }}>Weather telemetry unavailable</div>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/weather')} style={{ marginTop: '1.25rem', width: '100%' }}>
            <span>Detailed Forecast</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* AI Recommendation */}
        <div className="glass-card flex flex-col justify-between" style={{ gridColumn: 'span 2' }}>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 className="flex items-center gap-2" style={{ fontSize: '1.05rem', color: '#183D2D', fontWeight: 700 }}>
                <Sparkles size={20} color="#183D2D" />
                <span>AI Agronomic Recommendation</span>
              </h3>
              {summary.recommendations.length > 0 && (
                <span className="badge badge-warning">
                  {summary.recommendations[0].severity} SEVERITY
                </span>
              )}
            </div>

            {summary.recommendations.length > 0 ? (
              <div style={{ background: '#F8FAF8', padding: '1.2rem', borderRadius: '14px', border: '1px solid #E4ECE7' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#183D2D', fontWeight: 700, marginBottom: '0.4rem' }}>
                  {summary.recommendations[0].title}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#5C7064', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {summary.recommendations[0].recommendation}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#6B8074' }}>
                  <strong>Agronomic Reasons:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.3rem', color: '#5C7064' }}>
                    {summary.recommendations[0].reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ color: '#6B8074', padding: '1.5rem 0', textAlign: 'center' }}>
                No active AI recommendations. Click "Run AI Agronomist" above to generate insights.
              </div>
            )}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/recommendations')} style={{ marginTop: '1.25rem', alignSelf: 'flex-end' }}>
            <span>All Recommendations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
