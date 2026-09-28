import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Badge from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { Sparkles, CheckCircle, AlertTriangle, HelpCircle, Layers, RefreshCw } from 'lucide-react';

export default function Recommendations() {
  const { selectedFarm } = useFarm();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const loadRecommendations = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      const data = await api.getRecommendations(selectedFarm._id);
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedFarm]);

  const handleRunAnalysis = async () => {
    if (!selectedFarm) return;
    setAnalyzing(true);
    try {
      await api.analyzeFarm(selectedFarm._id);
      await loadRecommendations();
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMarkReviewed = async (id) => {
    try {
      await api.markRecommendationReviewed(id);
      await loadRecommendations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Consulting AI Agronomic Advisory Engine..." />;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>AI Agronomic Recommendation Engine</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Multi-factor synthesis of farm soil, crop stage, IoT sensors, weather, and pest vectors
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={analyzing}>
          <Sparkles size={18} />
          <span>{analyzing ? 'Analyzing Context...' : 'Run New AI Analysis'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {recommendations.map(rec => (
          <div
            key={rec._id}
            className="glass-card"
            style={{
              borderLeft: rec.severity === 'HIGH' || rec.severity === 'CRITICAL'
                ? '4px solid var(--accent-rose)'
                : '4px solid var(--primary)'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <span className="badge badge-info">{rec.type}</span>
                <Badge type={rec.severity}>{rec.severity} SEVERITY</Badge>
                {rec.reviewed && <Badge type="neutral">REVIEWED</Badge>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Generated: {new Date(rec.generatedAt).toLocaleString()}
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {rec.title}
            </h3>

            {/* AI Disclaimer & Advice */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Actionable Guidance
              </div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                {rec.recommendation}
              </p>
            </div>

            {/* Structured Reasons */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Observed Data & Agronomic Reasoning:</span>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {rec.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.2rem' }}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Statistical Confidence: <strong style={{ color: 'var(--primary)' }}>{Math.round(rec.confidence * 100)}%</strong> (AI Generated)
              </div>
              {!rec.reviewed && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleMarkReviewed(rec._id)}>
                  <CheckCircle size={16} /> Mark as Reviewed
                </button>
              )}
            </div>
          </div>
        ))}

        {recommendations.length === 0 && (
          <EmptyState
            title="No AI Recommendations Yet"
            message="Click 'Run New AI Analysis' to analyze farm telemetry, weather, and crop health."
            actionBtn={
              <button className="btn btn-primary" onClick={handleRunAnalysis}>
                <Sparkles size={18} /> Analyze Farm Telemetry
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
