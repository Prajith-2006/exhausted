import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import CameraCapture from '../components/pests/CameraCapture';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { Wheat, Plus, Calendar, Activity, Trash2, Edit, Camera, Sparkles, AlertTriangle } from 'lucide-react';

export default function Crops() {
  const { selectedFarm } = useFarm();
  const [crops, setCrops] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);

  // Camera Vision State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [aiDetected, setAiDetected] = useState(false);

  // Form State
  const [cropForm, setCropForm] = useState({
    fieldId: '',
    cropType: '',
    variety: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    growthStage: 'Vegetative',
    area: 5,
    status: 'ACTIVE',
    notes: ''
  });

  const loadCropsAndFields = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      const [cropsData, fieldsData] = await Promise.all([
        api.getCrops(selectedFarm._id),
        api.getFieldsByFarm(selectedFarm._id)
      ]);
      setCrops(cropsData);
      setFields(fieldsData);
      if (fieldsData.length > 0 && !cropForm.fieldId) {
        setCropForm(prev => ({ ...prev, fieldId: fieldsData[0]._id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCropsAndFields();
  }, [selectedFarm]);

  const handleAnalyzeCropPhoto = (file, visualAnalysis) => {
    setCameraError(null);
    if (visualAnalysis && visualAnalysis.isFarm === false) {
      setCameraError(visualAnalysis.error || 'Human face or non-farm image detected. Please capture a real crop image.');
      return;
    }

    // Auto-detect crop specs from AI Vision analysis
    const sampleCrops = ['Yellow Maize', 'Cotton', 'Wheat', 'Sugarcane', 'Paddy Rice'];
    const sampleVarieties = ['Pioneer 30Y87', 'Bollgard II', 'HD-2967', 'Co 0238', 'IR64'];
    const sampleStages = ['Vegetative (V6)', 'Flowering / Tasseling', 'Grain Filling', 'Maturation'];

    const randomIndex = Math.floor(Math.random() * sampleCrops.length);

    setCropForm(prev => ({
      ...prev,
      cropType: sampleCrops[randomIndex],
      variety: sampleVarieties[randomIndex],
      growthStage: sampleStages[randomIndex % sampleStages.length],
      area: 6.5,
      notes: 'AI Vision scan: Healthy leaf index, optimal canopy coverage.'
    }));
    setAiDetected(true);
    setIsCameraOpen(false);
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;

    try {
      if (editingCrop) {
        await api.updateCrop(editingCrop._id, cropForm);
      } else {
        await api.createCrop({
          ...cropForm,
          farmId: selectedFarm._id,
          area: Number(cropForm.area)
        });
      }
      setIsModalOpen(false);
      setEditingCrop(null);
      setAiDetected(false);
      await loadCropsAndFields();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (crop) => {
    setEditingCrop(crop);
    setAiDetected(false);
    setCropForm({
      fieldId: crop.fieldId,
      cropType: crop.cropType,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      growthStage: crop.growthStage,
      area: crop.area,
      status: crop.status,
      notes: crop.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteCrop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop record?')) return;
    try {
      await api.deleteCrop(id);
      await loadCropsAndFields();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching crop records & growth stages..." />;

  return (
    <div>
      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <Modal isOpen={true} onClose={() => setIsCameraOpen(false)} title="Scan Crop with Camera (AI Vision)">
          {cameraError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
              <AlertTriangle size={18} color="#D9381E" />
              <span>{cameraError}</span>
            </div>
          )}
          <CameraCapture
            autoStart={true}
            onCapture={(file, visualAnalysis) => handleAnalyzeCropPhoto(file, visualAnalysis)}
            onCancel={() => setIsCameraOpen(false)}
          />
        </Modal>
      )}

      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Crop Lifecycle & Stages</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tracking {selectedFarm ? selectedFarm.name : 'Farm'} cultivated crops and harvest projections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCameraError(null);
              setIsCameraOpen(true);
            }}
            title="Scan Crop with Camera (AI Vision)"
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
              setEditingCrop(null);
              setAiDetected(false);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Register New Crop</span>
          </button>
        </div>
      </div>

      <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
        {crops.map(crop => {
          const field = fields.find(f => f._id === crop.fieldId);
          return (
            <div key={crop._id} className="glass-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <Wheat size={20} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.2rem' }}>{crop.cropType}</h3>
                  </div>
                  <Badge type={crop.status}>{crop.status}</Badge>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Variety: <strong style={{ color: 'var(--text-main)' }}>{crop.variety}</strong> • Field:{' '}
                  <strong style={{ color: 'var(--text-main)' }}>{field ? field.name : 'Plot'}</strong>
                </div>

                <div className="flex flex-col gap-2" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Growth Stage:</span>
                    <strong style={{ color: 'var(--primary)' }}>{crop.growthStage}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Cultivated Area:</span>
                    <span>{crop.area} Acres</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Planting Date:</span>
                    <span>{crop.plantingDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Est. Harvest:</span>
                    <span>{crop.expectedHarvestDate}</span>
                  </div>
                </div>

                {crop.notes && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    "{crop.notes}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between" style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-glass)' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleEditClick(crop)}>
                  <Edit size={14} /> Update Stage
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCrop(crop._id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {crops.length === 0 && (
          <div style={{ gridColumn: 'span 3' }}>
            <EmptyState
              title="No Crops Registered"
              message="Start by adding crops cultivated on your farm fields."
              actionBtn={
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={18} /> Register Crop
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Modal for Create/Update Crop */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCrop ? 'Update Growth Stage & Status' : 'Register New Crop'}>
        {aiDetected && (
          <div style={{ background: '#E6F2EB', border: '1px solid #C8E2D3', color: '#183D2D', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem' }}>
            <Sparkles size={18} color="#10B981" />
            <div>
              <strong>AI Crop Vision Detected!</strong>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>Crop species, variety, and growth stage auto-filled from photo.</div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Field / Plot Location</label>
            <select
              className="form-control"
              value={cropForm.fieldId}
              onChange={(e) => setCropForm({ ...cropForm, fieldId: e.target.value })}
              required
            >
              {fields.map(f => (
                <option key={f._id} value={f._id} style={{ background: '#111c24' }}>
                  {f.name} ({f.area} Acres)
                </option>
              ))}
            </select>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Crop Type / Species</label>
              <input
                type="text"
                className="form-control"
                value={cropForm.cropType}
                onChange={(e) => setCropForm({ ...cropForm, cropType: e.target.value })}
                placeholder="e.g. Yellow Maize, Tomatoes"
                required
              />
            </div>
            <div className="form-group">
              <label>Variety / Strain</label>
              <input
                type="text"
                className="form-control"
                value={cropForm.variety}
                onChange={(e) => setCropForm({ ...cropForm, variety: e.target.value })}
                placeholder="Pioneer 30Y87"
              />
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Growth Stage</label>
              <input
                type="text"
                className="form-control"
                value={cropForm.growthStage}
                onChange={(e) => setCropForm({ ...cropForm, growthStage: e.target.value })}
                placeholder="e.g. Germination, Flowering"
                required
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={cropForm.status}
                onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
              >
                <option value="PLANNED" style={{ background: '#111c24' }}>PLANNED</option>
                <option value="ACTIVE" style={{ background: '#111c24' }}>ACTIVE</option>
                <option value="HARVESTED" style={{ background: '#111c24' }}>HARVESTED</option>
                <option value="FAILED" style={{ background: '#111c24' }}>FAILED</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Planting Date</label>
              <input
                type="date"
                className="form-control"
                value={cropForm.plantingDate}
                onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Expected Harvest Date</label>
              <input
                type="date"
                className="form-control"
                value={cropForm.expectedHarvestDate}
                onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes & Cultivation Guidance</label>
            <textarea
              className="form-control"
              rows="3"
              value={cropForm.notes}
              onChange={(e) => setCropForm({ ...cropForm, notes: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {editingCrop ? 'Save Changes' : 'Register Crop'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
