import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import { Bell, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const { farms, selectedFarm, setSelectedFarm } = useFarm();
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';

  useEffect(() => {
    if (!user) return;
    const checkAlerts = async () => {
      try {
        const alerts = await api.getAlerts(true);
        setUnreadAlertsCount(alerts.length);
      } catch (err) {
        // silent catch
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 15000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="flex items-center justify-between" style={{ padding: '1.25rem 2rem 0.5rem 2rem', background: 'transparent' }}>
      <div>
        <div style={{ fontSize: '0.85rem', color: '#6B8074', fontWeight: 600 }}>{currentDate}</div>
        <h1 style={{ fontSize: '1.75rem', color: '#183D2D', fontWeight: 800, marginTop: '0.1rem' }}>
          Good morning, {firstName}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Farm Selector */}
        {farms.length > 0 && (
          <div style={{ position: 'relative' }}>
            <select
              className="form-control"
              style={{
                padding: '0.45rem 2rem 0.45rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: '#FFFFFF',
                border: '1px solid #E2ECE5',
                borderRadius: '9999px',
                cursor: 'pointer',
                color: '#183D2D',
                boxShadow: '0 2px 8px rgba(24, 61, 45, 0.04)'
              }}
              value={selectedFarm ? selectedFarm._id : ''}
              onChange={(e) => {
                const f = farms.find(farm => farm._id === e.target.value);
                if (f) setSelectedFarm(f);
              }}
            >
              {farms.map(farm => (
                <option key={farm._id} value={farm._id}>
                  🏡 {farm.name} ({farm.totalArea} {farm.areaUnit})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notification Bell */}
        <div
          style={{
            position: 'relative',
            cursor: 'pointer',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E2ECE5',
            boxShadow: '0 2px 8px rgba(24, 61, 45, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => navigate('/alerts')}
          title="Alerts & Notifications"
        >
          <Bell size={18} color="#183D2D" />
          {unreadAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#E0533C',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 800,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #FFFFFF'
              }}
            >
              {unreadAlertsCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
