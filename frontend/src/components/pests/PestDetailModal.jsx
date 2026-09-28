import React from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import { Sparkles, CheckCircle2, Calendar, MapPin, ShieldAlert, FileText, Info } from 'lucide-react';

export default function PestDetailModal({ isOpen, onClose, pestRecord, cropName, fieldName }) {
  if (!pestRecord) return null;

  const ai = pestRecord.aiAnalysis;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pest Incident & AI Analysis Detail">
      <div>
        {/* Record Summary Header */}
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: '#FAFBF9' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Incident Record
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                {pestRecord.pestName}
              </h2>
            </div>
            <div className="flex gap-2">
              <Badge type={pestRecord.severity}>{pestRecord.severity}</Badge>
              {ai?.analyzed && (
                <span className="badge badge-primary flex items-center gap-1">
                  <Sparkles size={12} /> AI Analyzed
                </span>
              )}
            </div>
          </div>

          <div className="grid-cols-3" style={{ gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Crop:</strong> {cropName || 'Crop'}
            </div>
            <div>
              <strong>Date Detected:</strong> {pestRecord.dateDetected}
            </div>
            <div>
              <strong>Affected Area:</strong> {pestRecord.affectedArea || 0} Acres
            </div>
          </div>
        </div>

        {/* AI Assessment Breakdown if available */}
        {ai && ai.analyzed ? (
          <div>
            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#92400E', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} />
              <span><strong>AI Advisory Analysis:</strong> Confidence rating is {Math.round((ai.confidence || 0.8) * 100)}%.</span>
            </div>

            {/* Summary */}
            {ai.summary && (
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Diagnostic Summary</label>
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  {ai.summary}
                </div>
              </div>
            )}

            {/* Observations */}
            {ai.observations && ai.observations.length > 0 && (
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Observed Indicators</label>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {ai.observations.map((obs, idx) => (
                    <li key={idx}>{obs}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Actions */}
            {ai.recommendations && ai.recommendations.length > 0 && (
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>AI Recommendations</label>
                <div className="flex flex-col gap-2">
                  {ai.recommendations.map((rec, idx) => (
                    <div key={idx} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065F46' }}>{rec.title}</span>
                        <Badge type={rec.priority}>{rec.priority}</Badge>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#047857', margin: 0 }}>{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Treatment Recorded */}
        <div className="form-group">
          <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Treatment Applied / Action Recorded</label>
          <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            {pestRecord.treatment || 'No treatment recorded yet.'}
          </div>
        </div>

        {/* Additional Notes */}
        {pestRecord.notes && (
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notes</label>
            <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {pestRecord.notes}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
