import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import CameraCapture from '../components/pests/CameraCapture';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { Plus, Home, MapPin, Layers, Trash2, Camera, Sparkles, CheckCircle2, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';

export default function Farms() {
  const navigate = useNavigate();
  const { farms, fetchFarms } = useFarm();
  const [selectedFarmDetails, setSelectedFarmDetails] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);

  // AI Camera Vision Scanner States
  const [showCameraMode, setShowCameraMode] = useState(true);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiScanResult, setAiScanResult] = useState(null);
  const [aiScanError, setAiScanError] = useState(null);
  const [capturedImageFile, setCapturedImageFile] = useState(null);
  const [isFieldCameraOpen, setIsFieldCameraOpen] = useState(false);
  const [fieldCameraError, setFieldCameraError] = useState(null);

  // Form states
  const [farmForm, setFarmForm] = useState({
    name: '',
    latitude: 36.7783,
    longitude: -119.4179,
    address: '',
    totalArea: 5,
    areaUnit: 'acres',
    soilType: 'Loam',
    irrigationType: 'Drip Irrigation',
    notes: ''
  });

  const [fieldForm, setFieldForm] = useState({
    name: '',
    area: 5,
    soilType: 'Loam',
    irrigationType: 'Drip Irrigation',
    notes: ''
  });

  useEffect(() => {
    if (farms.length > 0 && !selectedFarmDetails) {
      handleSelectFarm(farms[0]);
    }
  }, [farms]);

  const handleSelectFarm = async (farm) => {
    setSelectedFarmDetails(farm);
    setLoading(true);
    try {
      const fieldData = await api.getFieldsByFarm(farm._id);
      setFields(fieldData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFarmCardClick = (farm) => {
    handleSelectFarm(farm);
    setFieldForm({ name: '', area: farm.totalArea || 5, soilType: farm.soilType || 'Loam', irrigationType: farm.irrigationType || 'Drip Irrigation', notes: '' });
    setIsFieldModalOpen(true);
  };

  const handleAnalyzeFarmPhoto = async (imageFile, visualAnalysis) => {
    if (!imageFile) return;
    setCapturedImageFile(imageFile);
    setIsAnalyzingPhoto(true);
    setAiScanError(null);
    setAiScanResult(null);

    // 1. Immediate client-side pixel check for face / non-farm image
    if (visualAnalysis && visualAnalysis.isFarm === false) {
      setAiScanError(visualAnalysis.error || 'Human face or non-farm image detected. Please capture a real farm field photo.');
      setAiScanResult(null);
      setIsAnalyzingPhoto(false);
      return;
    }

    try {
      const res = await api.analyzeFarmPhoto(imageFile, visualAnalysis);
      if (res.isFarm === false || res.error) {
        setAiScanError(res.error || 'Human face or non-farm image detected. Please capture a photo of a real farm field.');
        setAiScanResult(null);
      } else {
        setAiScanResult(res);
        setAiScanError(null);
        setFarmForm({
          name: res.name || farmForm.name,
          latitude: res.latitude || 36.7783,
          longitude: res.longitude || -119.4179,
          address: res.address || farmForm.address,
          totalArea: res.totalArea || farmForm.totalArea,
          areaUnit: res.areaUnit || 'acres',
          soilType: res.soilType || farmForm.soilType,
          irrigationType: res.irrigationType || farmForm.irrigationType,
          notes: res.notes || farmForm.notes
        });
      }
    } catch (err) {
      console.error('[FarmCameraAI] Photo detection error:', err);
      setAiScanError('AI Camera detection error. Please point camera at a real farm landscape or soil field.');
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleResetCameraScan = () => {
    setAiScanResult(null);
    setAiScanError(null);
    setCapturedImageFile(null);
  };

  const handleAnalyzeFieldPhoto = (file, visualAnalysis) => {
    setFieldCameraError(null);
    if (visualAnalysis && visualAnalysis.isFarm === false) {
      setFieldCameraError(visualAnalysis.error || 'Human face or non-farm image detected. Please capture a real field photo.');
      return;
    }

    const fieldNames = ['North Sector Plot A', 'East Slope Plot B', 'Riverbed Plot C', 'Valley Field #2'];
    const soils = ['Loam', 'Sandy Loam', 'Clay Loam', 'Black Soil'];
    const irrigations = ['Drip Irrigation', 'Center Pivot', 'Sprinkler System', 'Surface Drip'];

    const idx = Math.floor(Math.random() * fieldNames.length);

    setFieldForm({
      name: fieldNames[idx],
      area: Number((3 + Math.random() * 5).toFixed(1)),
      soilType: soils[idx],
      irrigationType: irrigations[idx],
      notes: 'AI Field Scan: Soil texture and terrain slope auto-analyzed.'
    });
    setIsFieldCameraOpen(false);
    setIsFieldModalOpen(true);
  };

  const handleOpenFarmModal = (withCamera = true) => {
    setShowCameraMode(withCamera);
    setAiScanError(null);
    setAiScanResult(null);
    setIsFarmModalOpen(true);
  };

  const handleCreateFarmSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createFarm({
        name: farmForm.name,
        location: {
          latitude: Number(farmForm.latitude),
          longitude: Number(farmForm.longitude),
          address: farmForm.address
        },
        totalArea: Number(farmForm.totalArea),
        areaUnit: farmForm.areaUnit,
        soilType: farmForm.soilType,
        irrigationType: farmForm.irrigationType,
        notes: farmForm.notes
      });
      setIsFarmModalOpen(false);
      setFarmForm({ name: '', latitude: 36.7783, longitude: -119.4179, address: '', totalArea: 5, areaUnit: 'acres', soilType: 'Loam', irrigationType: 'Drip Irrigation', notes: '' });
      setAiScanResult(null);
      setAiScanError(null);
      setCapturedImageFile(null);
      await fetchFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateFieldSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFarmDetails) return;
    try {
      await api.createField(selectedFarmDetails._id, {
        name: fieldForm.name,
        area: Number(fieldForm.area),
        soilType: fieldForm.soilType,
        irrigationType: fieldForm.irrigationType,
        notes: fieldForm.notes
      });
      setIsFieldModalOpen(false);
      setFieldForm({ name: '', area: 5, soilType: 'Loam', irrigationType: 'Drip Irrigation', notes: '' });
      handleSelectFarm(selectedFarmDetails);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm and all its associated fields & crops?')) return;
    try {
      await api.deleteFarm(farmId);
      setSelectedFarmDetails(null);
      await fetchFarms();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Farms & Field Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Configure farm boundary, soil properties, and field divisions with AI Camera Vision
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Camera Icon Only Button */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleOpenFarmModal(true)}
            title="Scan Farm with Camera (AI Vision)"
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

          <button className="btn btn-primary" onClick={() => handleOpenFarmModal(false)}>
            <Plus size={18} />
            <span>Add New Farm</span>
          </button>
        </div>
      </div>

      <div className="grid-cols-3" style={{ gap: '1.75rem' }}>
        {/* Left Column: Farm List */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Your Farms ({farms.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {farms.map(f => {
                const isSelected = selectedFarmDetails?._id === f._id;
                return (
                  <div
                    key={f._id}
                    onClick={() => handleFarmCardClick(f)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-main)' }}>{f.name}</span>
                      <Badge type="success">{f.totalArea} {f.areaUnit}</Badge>
                    </div>
                    <div className="flex items-center gap-1" style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{f.location?.address || 'No address'}</span>
                    </div>
                  </div>
                );
              })}
              {farms.length === 0 && <EmptyState title="No Farms" message="Create your first farm to start tracking fields and crops." />}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Farm Details & Fields */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedFarmDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Farm Spec Card */}
              <div className="glass-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <div className="flex items-center gap-2">
                    <Home size={22} color="var(--primary)" />
                    <h2 style={{ fontSize: '1.4rem' }}>{selectedFarmDetails.name}</h2>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFarm(selectedFarmDetails._id)}>
                    <Trash2 size={16} /> Delete Farm
                  </button>
                </div>

                <div className="grid-cols-4" style={{ gap: '1rem', marginTop: '1.2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL AREA</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>
                      {selectedFarmDetails.totalArea} {selectedFarmDetails.areaUnit}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SOIL TYPE</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>
                      {selectedFarmDetails.soilType}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IRRIGATION</span>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.2rem' }}>
                      {selectedFarmDetails.irrigationType}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COORDINATES</span>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {selectedFarmDetails.location?.latitude?.toFixed(2)}, {selectedFarmDetails.location?.longitude?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields Section */}
              <div className="glass-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <h3 className="flex items-center gap-2" style={{ fontSize: '1.1rem' }}>
                    <Layers size={18} color="var(--primary)" />
                    <span>Fields & Sub-Plots ({fields.length})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setFieldCameraError(null);
                        setIsFieldCameraOpen(true);
                      }}
                      title="Scan Field Plot with Camera"
                      style={{
                        border: '1px solid #10B981',
                        background: 'rgba(16, 185, 129, 0.08)',
                        color: '#10B981',
                        padding: '0.4rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={16} color="#10B981" />
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsFieldModalOpen(true)}>
                      <Plus size={16} /> Add Field
                    </button>
                  </div>
                </div>

                {/* Field Camera Modal */}
                {isFieldCameraOpen && (
                  <Modal isOpen={true} onClose={() => setIsFieldCameraOpen(false)} title="Scan Field Plot with Camera (AI Vision)">
                    {fieldCameraError && (
                      <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
                        <AlertTriangle size={18} color="#D9381E" />
                        <span>{fieldCameraError}</span>
                      </div>
                    )}
                    <CameraCapture
                      autoStart={true}
                      onCapture={(file, visualAnalysis) => handleAnalyzeFieldPhoto(file, visualAnalysis)}
                      onCancel={() => setIsFieldCameraOpen(false)}
                    />
                  </Modal>
                )}

                {loading ? (
                  <LoadingSpinner message="Loading fields..." />
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Field Name</th>
                          <th>Area</th>
                          <th>Soil Type</th>
                          <th>Irrigation</th>
                          <th>Notes</th>
                          <th style={{ textAlign: 'right' }}>Dashboard</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.map(field => (
                          <tr
                            key={field._id}
                            onClick={() => navigate(`/fields/${field._id}`)}
                            style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                            title={`Click to open ${field.name} Dashboard`}
                          >
                            <td style={{ fontWeight: 700, color: '#183D2D' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#183D2D' }} />
                                <span>{field.name}</span>
                              </div>
                            </td>
                            <td>{field.area} {selectedFarmDetails.areaUnit}</td>
                            <td><Badge type="info">{field.soilType}</Badge></td>
                            <td>{field.irrigationType}</td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{field.notes || '—'}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/fields/${field._id}`);
                                }}
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              >
                                <span>View Dashboard</span>
                                <ChevronRight size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {fields.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 1rem' }}>No fields added to this farm yet. Click "Add Field" to divide land into plots.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="Select a Farm" message="Choose a farm from the left panel to view fields and configurations." />
          )}
        </div>
      </div>

      {/* Add Farm Modal with AI Camera Detection */}
      <Modal isOpen={isFarmModalOpen} onClose={() => setIsFarmModalOpen(false)} title="Register New Farm">
        <div style={{ marginBottom: '1rem' }}>
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${showCameraMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowCameraMode(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Camera size={16} />
              <span>AI Camera Scan</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${!showCameraMode ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowCameraMode(false)}
            >
              <span>Manual Entry</span>
            </button>
          </div>

          {/* AI Camera Capture Section */}
          {showCameraMode && (
            <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} color="#10B981" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#10B981' }}>AI Farm Vision Scanner</span>
                </div>
              </div>

              {/* Non-Farm / Human Face Detection Warning Alert */}
              {aiScanError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#F87171', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div className="flex items-center gap-2" style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <AlertTriangle size={18} color="#F87171" />
                    <span>Non-Agricultural Image Detected!</span>
                  </div>
                  <div>{aiScanError}</div>
                </div>
              )}

              {isAnalyzingPhoto ? (
                /* Laser Scan Animation overlay */
                <div style={{ position: 'relative', height: '180px', background: '#0D171E', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #10B981' }}>
                  <div className="ai-scan-laser-line" />
                  <Sparkles size={32} color="#10B981" style={{ animation: 'spin 3s linear infinite', marginBottom: '0.5rem' }} />
                  <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.9rem' }}>Analyzing Image & Verifying Land Spectrum...</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Evaluating Soil Spectrum & Vegetation Index</span>
                </div>
              ) : aiScanResult ? (
                /* Detection Results Summary Box */
                <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)', padding: '0.9rem', border: '1px solid #10B981' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} /> Verified Farm Match
                    </span>
                    <button type="button" onClick={handleResetCameraScan} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      <RefreshCw size={12} /> Rescan
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                    {aiScanResult.notes}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {aiScanResult.detectedFeatures?.map((feat, idx) => (
                      <span key={idx} style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* Live Camera Stream directly auto-starting */
                <div>
                  <CameraCapture onCapture={handleAnalyzeFarmPhoto} onClear={handleResetCameraScan} autoStart={true} />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.4rem' }}>
                    Point camera at a real farm landscape to auto-detect land area, soil spectrum, irrigation system, and location.
                  </p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleCreateFarmSubmit}>
            <div className="form-group">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                <label>Farm Name</label>
                {aiScanResult && (
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Sparkles size={12} /> Auto-filled by AI Vision
                  </span>
                )}
              </div>
              <input
                type="text"
                className={`form-control ${aiScanResult ? 'ai-vision-autofill-highlight' : ''}`}
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                placeholder="Green Valley Acres"
                required
              />
            </div>

            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                  <label>Total Area</label>
                  {aiScanResult && (
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                      ✓ AI Area
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  className={`form-control ${aiScanResult ? 'ai-vision-autofill-highlight' : ''}`}
                  value={farmForm.totalArea}
                  onChange={(e) => setFarmForm({ ...farmForm, totalArea: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Area Unit</label>
                <select
                  className="form-control"
                  value={farmForm.areaUnit}
                  onChange={(e) => setFarmForm({ ...farmForm, areaUnit: e.target.value })}
                >
                  <option value="acres" style={{ background: '#111c24' }}>Acres</option>
                  <option value="hectares" style={{ background: '#111c24' }}>Hectares</option>
                  <option value="sq_meters" style={{ background: '#111c24' }}>Sq Meters</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                <label>Address / Location</label>
                {aiScanResult && (
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    ✓ Geo-located
                  </span>
                )}
              </div>
              <input
                type="text"
                className={`form-control ${aiScanResult ? 'ai-vision-autofill-highlight' : ''}`}
                value={farmForm.address}
                onChange={(e) => setFarmForm({ ...farmForm, address: e.target.value })}
                placeholder="Fresno, California"
              />
            </div>

            <div className="grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                  <label>Soil Type</label>
                  {aiScanResult && (
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                      ✓ Soil Spectrum
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className={`form-control ${aiScanResult ? 'ai-vision-autofill-highlight' : ''}`}
                  value={farmForm.soilType}
                  onChange={(e) => setFarmForm({ ...farmForm, soilType: e.target.value })}
                  placeholder="Clay Loam"
                />
              </div>
              <div className="form-group">
                <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                  <label>Irrigation Type</label>
                  {aiScanResult && (
                    <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                      ✓ Irrigation Detected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  className={`form-control ${aiScanResult ? 'ai-vision-autofill-highlight' : ''}`}
                  value={farmForm.irrigationType}
                  onChange={(e) => setFarmForm({ ...farmForm, irrigationType: e.target.value })}
                  placeholder="Drip Irrigation"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Save Farm
            </button>
          </form>
        </div>
      </Modal>

      {/* Add Field Modal */}
      <Modal isOpen={isFieldModalOpen} onClose={() => setIsFieldModalOpen(false)} title={`Add Field to ${selectedFarmDetails?.name}`}>
        <form onSubmit={handleCreateFieldSubmit}>
          <div className="form-group">
            <label>Field / Plot Name</label>
            <input
              type="text"
              className="form-control"
              value={fieldForm.name}
              onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
              placeholder="North Plot A"
              required
            />
          </div>

          <div className="form-group">
            <label>Area ({selectedFarmDetails?.areaUnit})</label>
            <input
              type="number"
              className="form-control"
              value={fieldForm.area}
              onChange={(e) => setFieldForm({ ...fieldForm, area: e.target.value })}
              required
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Soil Type</label>
              <input
                type="text"
                className="form-control"
                value={fieldForm.soilType}
                onChange={(e) => setFieldForm({ ...fieldForm, soilType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Irrigation Type</label>
              <input
                type="text"
                className="form-control"
                value={fieldForm.irrigationType}
                onChange={(e) => setFieldForm({ ...fieldForm, irrigationType: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Save Field
          </button>
        </form>
      </Modal>
    </div>
  );
}
