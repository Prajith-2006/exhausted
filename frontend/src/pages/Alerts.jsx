import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Badge from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { Bell, CheckCheck, BellOff, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browserPermission, setBrowserPermission] = useState(Notification.permission);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts(false);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markAlertRead(id);
      await loadAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      await loadAlerts();
    } catch (err) {
      alert(err.message);
    }
  };

  const requestBrowserNotification = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        new Notification('Smart Farmer Alerts', {
          body: 'Browser notifications activated for critical farm telemetry alerts!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  if (loading) return <LoadingSpinner message="Fetching system alerts..." />;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Alerts & Telemetry Warnings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Automatic threshold alerts for soil moisture, extreme climate, and pest risks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {browserPermission !== 'granted' && (
            <button className="btn btn-secondary btn-sm" onClick={requestBrowserNotification}>
              <Bell size={16} /> Enable Desktop Notifications
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={16} /> Mark All Read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map(alertItem => (
          <div
            key={alertItem._id}
            className="glass-card flex items-center justify-between"
            style={{
              opacity: alertItem.read ? 0.65 : 1,
              background: alertItem.read ? 'rgba(18, 28, 36, 0.4)' : 'var(--bg-card)',
              borderLeft: alertItem.severity === 'HIGH' || alertItem.severity === 'CRITICAL'
                ? '4px solid var(--accent-rose)'
                : '4px solid var(--accent-amber)'
            }}
          >
            <div className="flex items-start gap-3">
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem', borderRadius: 'var(--radius-sm)' }}>
                {alertItem.type === 'LOW_SOIL_MOISTURE' && <ShieldAlert color="var(--accent-rose)" size={20} />}
                {alertItem.type === 'HIGH_TEMPERATURE' && <AlertTriangle color="var(--accent-amber)" size={20} />}
                {alertItem.type === 'PEST_RISK' && <ShieldAlert color="var(--accent-rose)" size={20} />}
                {!['LOW_SOIL_MOISTURE', 'HIGH_TEMPERATURE', 'PEST_RISK'].includes(alertItem.type) && <Info color="var(--secondary)" size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.2rem' }}>
                  <Badge type={alertItem.severity}>{alertItem.severity}</Badge>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{alertItem.type}</span>
                  {!alertItem.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-rose)' }}></span>}
                </div>
                <h4 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>{alertItem.title}</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{alertItem.message}</p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
                  {new Date(alertItem.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {!alertItem.read && (
              <button className="btn btn-secondary btn-sm" onClick={() => handleMarkRead(alertItem._id)}>
                Dismiss
              </button>
            )}
          </div>
        ))}

        {alerts.length === 0 && (
          <EmptyState title="No System Alerts" message="All sensor parameters and climate indicators are operating within normal limits." />
        )}
      </div>
    </div>
  );
}
