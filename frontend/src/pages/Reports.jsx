import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Badge from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { FileText, Download, Code, Layers, Wheat, Cpu, CloudSun, Bug, Sparkles } from 'lucide-react';

export default function Reports() {
  const { selectedFarm } = useFarm();
  const [activeTab, setActiveTab] = useState('FARM');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);

  const fetchReport = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      let data = null;
      const farmId = selectedFarm._id;
      if (activeTab === 'FARM') data = await api.getFarmReport(farmId);
      else if (activeTab === 'SENSOR') data = await api.getSensorReport(farmId);
      else if (activeTab === 'WEATHER') data = await api.getWeatherReport(farmId);
      else if (activeTab === 'PEST') data = await api.getPestReport(farmId);
      else if (activeTab === 'RECOMMENDATION') data = await api.getRecommendationReport(farmId);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedFarm, activeTab]);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Analytical Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Structured data summaries aggregated directly from MongoDB records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowRawJson(!showRawJson)}>
            <Code size={16} /> {showRawJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        {[
          { id: 'FARM', label: 'Farm Summary', icon: Layers },
          { id: 'SENSOR', label: 'Sensors Telemetry', icon: Cpu },
          { id: 'WEATHER', label: 'Weather Metrics', icon: CloudSun },
          { id: 'PEST', label: 'Pest Incidents', icon: Bug },
          { id: 'RECOMMENDATION', label: 'AI Advisory Log', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn"
              style={{
                background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '0.85rem',
                padding: '0.5rem 1rem'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner message="Aggregating MongoDB report analytics..." />
      ) : reportData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Visual Metric Summary */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>{activeTab} Analytical Summary</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Generated: {new Date(reportData.generatedAt).toLocaleString()}
              </span>
            </div>

            {/* Content per tab */}
            {activeTab === 'FARM' && (
              <div>
                <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FIELDS</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{reportData.metrics?.fieldsCount}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE CROPS</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{reportData.metrics?.activeCrops}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SENSORS</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{reportData.metrics?.sensorsCount}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALERTS LOGGED</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{reportData.metrics?.alertsCount}</div>
                  </div>
                </div>

                <h4>Crops Overview</h4>
                <div className="table-container" style={{ marginTop: '0.5rem' }}>
                  <table className="data-table">
                    <thead>
                      <tr><th>Crop</th><th>Variety</th><th>Growth Stage</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {reportData.cropsSummary?.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.cropType}</td>
                          <td>{c.variety}</td>
                          <td>{c.stage}</td>
                          <td><Badge type={c.status}>{c.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'SENSOR' && (
              <div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Sensor Name</th><th>Type</th><th>Status</th><th>Avg Value</th><th>Min</th><th>Max</th></tr>
                    </thead>
                    <tbody>
                      {reportData.sensors?.map(s => (
                        <tr key={s.sensorId}>
                          <td style={{ fontWeight: 600 }}>{s.name}</td>
                          <td><Badge type="info">{s.type}</Badge></td>
                          <td><Badge type={s.status}>{s.status}</Badge></td>
                          <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.averageValue} {s.unit}</td>
                          <td>{s.minValue} {s.unit}</td>
                          <td>{s.maxValue} {s.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'WEATHER' && (
              <div>
                <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AVERAGE TEMPERATURE</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{reportData.avgTemperature}°C</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL RECORDED RAINFALL</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>{reportData.totalRainfallRecorded} mm</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'PEST' && (
              <div>
                <div className="grid-cols-4" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem' }}>LOW</span><h3>{reportData.severityBreakdown?.LOW}</h3></div>
                  <div className="glass-card" style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem' }}>MEDIUM</span><h3>{reportData.severityBreakdown?.MEDIUM}</h3></div>
                  <div className="glass-card" style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem' }}>HIGH</span><h3 style={{ color: 'var(--accent-rose)' }}>{reportData.severityBreakdown?.HIGH}</h3></div>
                  <div className="glass-card" style={{ padding: '1rem' }}><span style={{ fontSize: '0.75rem' }}>CRITICAL</span><h3 style={{ color: 'var(--accent-rose)' }}>{reportData.severityBreakdown?.CRITICAL}</h3></div>
                </div>
              </div>
            )}

            {activeTab === 'RECOMMENDATION' && (
              <div>
                <div className="flex items-center justify-between" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  <span>Total Recommendations Generated: <strong>{reportData.totalRecommendations}</strong></span>
                  <span>Reviewed by Farmer: <strong>{reportData.reviewedCount}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Raw JSON Inspector */}
          {showRawJson && (
            <div className="glass-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                MongoDB Aggregation JSON Endpoint Response
              </h4>
              <pre style={{ background: '#0a1218', padding: '1rem', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.85rem', color: '#34d399' }}>
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <EmptyState title="Report Generation Error" message="Unable to build report data for the selected farm." />
      )}
    </div>
  );
}
