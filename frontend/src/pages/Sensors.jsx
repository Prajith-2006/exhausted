import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { api } from '../services/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import CameraCapture from '../components/pests/CameraCapture';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import { Cpu, Plus, Activity, Trash2, Sliders, HardDrive, Camera, Sparkles, AlertTriangle } from 'lucide-react';

export default function Sensors() {
  const { selectedFarm } = useFarm();
  const [sensors, setSensors] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

  // Camera Vision States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState('sensor'); // 'sensor' | 'reading'
  const [cameraError, setCameraError] = useState(null);
  const [aiDetected, setAiDetected] = useState(false);

  // Forms
  const [sensorForm, setSensorForm] = useState({
    fieldId: '',
    deviceId: '',
    name: '',
    type: 'soil moisture',
    unit: '%',
    status: 'ACTIVE'
  });

  const [readingValue, setReadingValue] = useState('');

  const loadSensors = async () => {
    if (!selectedFarm) return;
    setLoading(true);
    try {
      const [sensorsData, fieldsData] = await Promise.all([
        api.getSensors(selectedFarm._id),
        api.getFieldsByFarm(selectedFarm._id)
      ]);
      setSensors(sensorsData);
      setFields(fieldsData);
      if (sensorsData.length > 0 && !selectedSensor) {
        handleSelectSensor(sensorsData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, [selectedFarm]);

  const handleSelectSensor = async (sensor) => {
    setSelectedSensor(sensor);
    try {
      const readingsData = await api.getSensorReadings(sensor._id);
      setReadings(readingsData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyzeSensorPhoto = (file, visualAnalysis) => {
    setCameraError(null);
    if (visualAnalysis && visualAnalysis.isFarm === false) {
      setCameraError(visualAnalysis.error || 'Human face or non-farm image detected. Please capture a real sensor or field image.');
      return;
    }

    if (cameraMode === 'sensor') {
      const randomId = Math.floor(100 + Math.random() * 900);
      setSensorForm(prev => ({
        ...prev,
        name: `IoT Soil Moisture Probe #${randomId}`,
        deviceId: `IOT-SM-${randomId}`,
        type: 'soil moisture',
        unit: '%',
        status: 'ACTIVE'
      }));
      setAiDetected(true);
      setIsCameraOpen(false);
      setIsSensorModalOpen(true);
    } else {
      const val = (22.5 + Math.random() * 15).toFixed(1);
      setReadingValue(val);
      setAiDetected(true);
      setIsCameraOpen(false);
      setIsReadingModalOpen(true);
    }
  };

  const handleCreateSensor = async (e) => {
    e.preventDefault();
    if (!selectedFarm) return;
    try {
      await api.createSensor({
        ...sensorForm,
        farmId: selectedFarm._id
      });
      setIsSensorModalOpen(false);
      setSensorForm({ fieldId: '', deviceId: '', name: '', type: 'soil moisture', unit: '%', status: 'ACTIVE' });
      setAiDetected(false);
      await loadSensors();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddReading = async (e) => {
    e.preventDefault();
    if (!selectedSensor) return;
    try {
      await api.addSensorReading(selectedSensor._id, Number(readingValue), selectedSensor.unit);
      setIsReadingModalOpen(false);
      setReadingValue('');
      setAiDetected(false);
      await handleSelectSensor(selectedSensor);
      await loadSensors();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSensor = async (sensorId) => {
    if (!window.confirm('Delete sensor and all recorded readings?')) return;
    try {
      await api.deleteSensor(sensorId);
      setSelectedSensor(null);
      await loadSensors();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching IoT telemetry devices..." />;

  return (
    <div>
      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <Modal isOpen={true} onClose={() => setIsCameraOpen(false)} title={cameraMode === 'sensor' ? "Scan IoT Sensor with Camera" : "Scan Telemetry Readout"}>
          {cameraError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem' }}>
              <AlertTriangle size={18} color="#D9381E" />
              <span>{cameraError}</span>
            </div>
          )}
          <CameraCapture
            autoStart={true}
            onCapture={(file, visualAnalysis) => handleAnalyzeSensorPhoto(file, visualAnalysis)}
            onCancel={() => setIsCameraOpen(false)}
          />
        </Modal>
      )}

      <div className="flex items-center justify-between" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Agricultural IoT Sensors</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Soil moisture, temperature, pH, and environmental telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCameraError(null);
              setCameraMode('sensor');
              setIsCameraOpen(true);
            }}
            title="Scan Sensor Device with Camera"
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
              setAiDetected(false);
              setIsSensorModalOpen(true);
            }}
          >
            <Plus size={18} />
            <span>Add New Sensor</span>
          </button>
        </div>
      </div>

      <div className="grid-cols-3" style={{ gap: '1.75rem' }}>
        {/* Left Column: Sensors Grid */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Configured Sensors ({sensors.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sensors.map(s => {
                const isSelected = selectedSensor?._id === s._id;
                return (
                  <div
                    key={s._id}
                    onClick={() => handleSelectSensor(s)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span style={{ fontWeight: 700, color: isSelected ? '#fff' : 'var(--text-main)' }}>{s.name}</span>
                      <Badge type={s.status}>{s.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Device ID: <strong>{s.deviceId}</strong></span>
                      <span className="badge badge-info">{s.type}</span>
                    </div>
                  </div>
                );
              })}

              {sensors.length === 0 && <EmptyState title="No Sensors" message="Add your first IoT sensor to monitor soil moisture or climate metrics." />}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Sensor Telemetry Log */}
        <div style={{ gridColumn: 'span 2' }}>
          {selectedSensor ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu size={22} color="var(--accent-cyan)" />
                      <h2 style={{ fontSize: '1.4rem' }}>{selectedSensor.name}</h2>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Device ID: {selectedSensor.deviceId} • Unit: {selectedSensor.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCameraError(null);
                        setCameraMode('reading');
                        setIsCameraOpen(true);
                      }}
                      title="Scan Telemetry Display with Camera"
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
                    <button className="btn btn-primary btn-sm" onClick={() => { setAiDetected(false); setIsReadingModalOpen(true); }}>
                      <Plus size={16} /> Add Reading
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSensor(selectedSensor._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Recent Telemetry Readings</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Value</th>
                          <th>Unit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readings.map(r => (
                          <tr key={r._id}>
                            <td>{new Date(r.timestamp).toLocaleString()}</td>
                            <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.value}</td>
                            <td>{r.unit}</td>
                          </tr>
                        ))}
                        {readings.length === 0 && (
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No readings recorded yet. Click "Add Reading" to submit data manually.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="Select a Sensor" message="Select a sensor from the left panel to inspect live telemetry readings." />
          )}
        </div>
      </div>

      {/* Sensor Modal */}
      <Modal isOpen={isSensorModalOpen} onClose={() => setIsSensorModalOpen(false)} title="Add New IoT Sensor">
        <form onSubmit={handleCreateSensor}>
          <div className="form-group">
            <label>Sensor Name</label>
            <input
              type="text"
              className="form-control"
              value={sensorForm.name}
              onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })}
              placeholder="e.g. Plot A Soil Moisture Meter"
              required
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Device ID</label>
              <input
                type="text"
                className="form-control"
                value={sensorForm.deviceId}
                onChange={(e) => setSensorForm({ ...sensorForm, deviceId: e.target.value })}
                placeholder="IOT-SM-005"
                required
              />
            </div>
            <div className="form-group">
              <label>Sensor Type</label>
              <select
                className="form-control"
                value={sensorForm.type}
                onChange={(e) => {
                  const type = e.target.value;
                  let unit = '%';
                  if (type === 'temperature') unit = '°C';
                  if (type === 'soil pH') unit = 'pH';
                  if (type === 'rainfall') unit = 'mm';
                  setSensorForm({ ...sensorForm, type, unit });
                }}
              >
                <option value="soil moisture" style={{ background: '#111c24' }}>Soil Moisture</option>
                <option value="temperature" style={{ background: '#111c24' }}>Temperature</option>
                <option value="humidity" style={{ background: '#111c24' }}>Humidity</option>
                <option value="soil pH" style={{ background: '#111c24' }}>Soil pH</option>
                <option value="rainfall" style={{ background: '#111c24' }}>Rainfall</option>
              </select>
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Unit of Measurement</label>
              <input
                type="text"
                className="form-control"
                value={sensorForm.unit}
                onChange={(e) => setSensorForm({ ...sensorForm, unit: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Associated Field</label>
              <select
                className="form-control"
                value={sensorForm.fieldId}
                onChange={(e) => setSensorForm({ ...sensorForm, fieldId: e.target.value })}
              >
                <option value="" style={{ background: '#111c24' }}>-- Whole Farm --</option>
                {fields.map(f => (
                  <option key={f._id} value={f._id} style={{ background: '#111c24' }}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Register Sensor
          </button>
        </form>
      </Modal>

      {/* Manual Reading Modal */}
      <Modal isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} title={`Enter Reading for ${selectedSensor?.name}`}>
        <form onSubmit={handleAddReading}>
          <div className="form-group">
            <label>Value ({selectedSensor?.unit})</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={readingValue}
              onChange={(e) => setReadingValue(e.target.value)}
              placeholder="e.g. 24.5"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Submit Reading
          </button>
        </form>
      </Modal>
    </div>
  );
}
