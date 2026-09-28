import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Badge from '../components/Badge';
import PestIncidentModal from '../components/pests/PestIncidentModal';
import PestDetailModal from '../components/pests/PestDetailModal';
import { LoadingSpinner } from '../components/EmptyState';
import { Plus, Trash2, Sparkles, Eye, Info, Camera } from 'lucide-react';

export default function PestHistory() {
  const { selectedFarm } = useFarm();
  const [pests, setPests] = useState([]);
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [autoStartCamera, setAutoStartCamera] = useState(false);
  const [selectedPestRecord, setSelectedPestRecord] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadData = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      const [pestsData, cropsData, fieldsData] = await Promise.all([
        api.getPests(selectedFarm._id),
        api.getCrops(selectedFarm._id),
        api.getFieldsByFarm(selectedFarm._id)
      ]);
      setPests(pestsData);
      setCrops(cropsData);
      setFields(fieldsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => loadData();
    window.addEventListener('pest-record-saved', handleRefresh);
    return () => window.removeEventListener('pest-record-saved', handleRefresh);
  }, [selectedFarm]);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete pest record?')) return;
    try {
      await api.deletePest(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openDetail = (pest, e) => {
    if (e) e.stopPropagation();
    setSelectedPestRecord(pest);
    setIsDetailModalOpen(true);
  };

  if (loading) return <LoadingSpinner message="Fetching pest & disease records..." />;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Pest & Disease Records</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-assisted incident reporting, diagnostic history, and field treatments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setAutoStartCamera(true);
              setIsIncidentModalOpen(true);
            }}
            title="Scan Pest/Disease with Camera (AI Vision)"
            style={{
              border: '1px solid #10B981',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#10B981',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Camera size={20} color="#10B981" />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setAutoStartCamera(false);
              setIsIncidentModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>+ Report Incident</span>
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date Detected</th>
                <th>Pest / Disease</th>
                <th>Crop</th>
                <th>Severity</th>
                <th>Affected Area</th>
                <th>Treatment</th>
                <th>AI Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pests.map(p => {
                const crop = crops.find(c => c._id === p.cropId);
                const hasAi = p.aiAnalysis && p.aiAnalysis.analyzed;
                return (
                  <tr
                    key={p._id}
                    onClick={() => openDetail(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{p.dateDetected}</td>
                    <td style={{ fontWeight: 700 }}>
                      <div className="flex items-center gap-2">
                        <span>{p.pestName}</span>
                      </div>
                    </td>
                    <td>{crop ? crop.cropType : 'Crop'}</td>
                    <td><Badge type={p.severity}>{p.severity}</Badge></td>
                    <td>{p.affectedArea} Acres</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.treatment || 'No treatment recorded'}
                    </td>
                    <td>
                      {hasAi ? (
                        <span className="badge badge-primary flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
                          <Sparkles size={12} /> AI Analyzed ({Math.round((p.aiAnalysis.confidence || 0.8) * 100)}%)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manual Record</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-sm" onClick={(e) => openDetail(p, e)} title="View Details">
                          <Eye size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(p._id, e)} title="Delete Record">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pests.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    No pest or disease incidents recorded. Click <strong>+ Report Incident</strong> to submit manual, PDF, or camera reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Assisted Incident Reporting Modal */}
      <PestIncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        farm={selectedFarm}
        crops={crops}
        fields={fields}
        onSaved={loadData}
        autoStartCamera={autoStartCamera}
      />

      {/* Pest Record Detail Modal */}
      <PestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        pestRecord={selectedPestRecord}
        cropName={crops.find(c => c._id === selectedPestRecord?.cropId)?.cropType}
        fieldName={fields.find(f => f._id === selectedPestRecord?.fieldId)?.name}
      />
    </div>
  );
}
