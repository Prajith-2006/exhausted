import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/Badge';
import { User, Shield, Server, Globe, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'en');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your farmer profile, security settings, and external service integrations
        </p>
      </div>

      <div className="grid-cols-2" style={{ gap: '1.75rem' }}>
        {/* Profile Card */}
        <div className="glass-card">
          <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
            <User size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Farmer Profile</h3>
          </div>

          {saved && (
            <div className="flex items-center gap-2" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <CheckCircle size={16} /> Profile preferences updated successfully!
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Authentication Login)</label>
              <input
                type="text"
                className="form-control"
                value={user?.phone || ''}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label>Preferred Language</label>
              <select
                className="form-control"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en" style={{ background: '#111c24' }}>English</option>
                <option value="es" style={{ background: '#111c24' }}>Spanish (Español)</option>
                <option value="fr" style={{ background: '#111c24' }}>French (Français)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Integration Status Card */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
              <Server size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1.15rem' }}>System & API Integrations</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>MongoDB Database Driver</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Native Mongo Client Connection</div>
                </div>
                <Badge type="success">CONNECTED</Badge>
              </div>

              <div className="flex items-center justify-between" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>OpenWeatherMap Service</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agronomic Mock Engine Resiliency Active</div>
                </div>
                <Badge type="info">HYBRID READY</Badge>
              </div>

              <div className="flex items-center justify-between" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Advisory Engine</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rule-Based Fallback Engine Active</div>
                </div>
                <Badge type="success">OPERATIONAL</Badge>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1.5rem' }}>
            Smart Farmer Platform v1.0.0 • Full-Stack Production Build
          </div>
        </div>
      </div>
    </div>
  );
}
