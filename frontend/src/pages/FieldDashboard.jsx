import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useFarm } from '../context/FarmContext';
import { LoadingSpinner, EmptyState } from '../components/EmptyState';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import {
  ArrowLeft,
  Wheat,
  Droplets,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Layers,
  Bug,
  Activity,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

export default function FieldDashboard() {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const { farms, selectedFarm } = useFarm();

  const [loading, setLoading] = useState(true);
  const [field, setField] = useState(null);
  const [parentFarm, setParentFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [sensorReadings, setSensorReadings] = useState([]);
  const [pests, setPests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'telemetry' | 'pests' | 'logs'
  const [irrigationSimulated, setIrrigationSimulated] = useState(false);

  // Field log entries
  const [logs, setLogs] = useState([
    { id: 1, date: 'Today, 06:30 AM', action: 'Automated Sensor Sync', details: 'IOT-SM-001 recorded 18.5% soil moisture.', status: 'NOTICE' },
    { id: 2, date: 'Sep 25, 2026', action: 'Nutrient Fertigation', details: 'Applied 15kg/acre Nitrogen-Phosphorus blend via drip system.', status: 'SUCCESS' },
    { id: 3, date: 'Sep 20, 2026', action: 'Bio-Insecticide Treatment', details: 'Neem-based organic spray applied for fall armyworm perimeter control.', status: 'SUCCESS' },
    { id: 4, date: 'Sep 10, 2026', action: 'Pest Incident Reported', details: 'Spodoptera frugiperda observed on eastern border leaves.', status: 'ALERT' }
  ]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newLog, setNewLog] = useState({ action: '', details: '', status: 'SUCCESS' });

  useEffect(() => {
    loadFieldDashboardData();
  }, [fieldId]);

  const loadFieldDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Field Details
      const fieldData = await api.getField(fieldId);
      setField(fieldData);

      const farmId = fieldData.farmId;
      // Find parent farm
      const farmFound = farms.find(f => f._id === farmId) || await api.getFarm(farmId).catch(() => null);
      setParentFarm(farmFound);

      // 2. Fetch all farm entities in parallel
      const [allCrops, allSensors, allPests, allRecs] = await Promise.all([
        api.getCrops(farmId).catch(() => []),
        api.getSensors(farmId).catch(() => []),
        api.getPests(farmId).catch(() => []),
        api.getRecommendations(farmId).catch(() => [])
      ]);

      // Filter to this specific field
      const fieldCrops = allCrops.filter(c => String(c.fieldId) === String(fieldId));
      setCrops(fieldCrops);

      const fieldSensors = allSensors.filter(s => String(s.fieldId) === String(fieldId));
      setSensors(fieldSensors);

      // Fetch sensor readings for the first sensor if available
      if (fieldSensors.length > 0) {
        const readings = await api.getLatestReadings(fieldSensors[0]._id).catch(() => []);
        setSensorReadings(readings);
      }

      // Filter pests belonging to this field or its crops
      const cropIds = fieldCrops.map(c => String(c._id));
      const fieldPests = allPests.filter(p => !p.cropId || cropIds.includes(String(p.cropId)));
      setPests(fieldPests);

      // Filter recommendations
      const fieldRecs = allRecs.filter(r => !r.cropId || cropIds.includes(String(r.cropId)));
      setRecommendations(fieldRecs);

    } catch (err) {
      console.error('Error loading field dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateIrrigation = () => {
    setIrrigationSimulated(true);
    setLogs(prev => [
      {
        id: Date.now(),
        date: 'Just now',
        action: '35mm Drip Cycle Executed',
        details: 'Farmer manually triggered drip irrigation cycle. Soil moisture replenishing to 28%.',
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLog.action) return;
    setLogs(prev => [
      {
        id: Date.now(),
        date: 'Just now',
        action: newLog.action,
        details: newLog.details || 'Standard agronomic parcel management.',
        status: newLog.status
      },
      ...prev
    ]);
    setNewLog({ action: '', details: '', status: 'SUCCESS' });
    setIsLogModalOpen(false);
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating parcel telemetry, crop lifecycle & IoT signals..." />;
  }

  if (!field) {
    return (
      <div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/farms')} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Farms
        </button>
        <EmptyState
          title="Field Parcel Not Found"
          description="The requested field sub-plot could not be located in your farm registry."
          actionText="Return to Farms & Fields"
          onAction={() => navigate('/farms')}
        />
      </div>
    );
  }

  const activeCrop = crops.find(c => c.status === 'ACTIVE') || crops[0];
  const primaryMoistureSensor = sensors.find(s => s.type === 'soil moisture') || sensors[0];
  const primaryTempSensor = sensors.find(s => s.type === 'temperature');

  // Compute moisture value
  const soilMoistureValue = irrigationSimulated ? 28.5 : 18.5;
  const isMoistureCritical = soilMoistureValue < 20;

  return (
    <div>
      {/* =========================================================================
          TOP BREADCRUMB & HEADER
          ========================================================================= */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#6B8074', marginBottom: '0.65rem' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onClick={() => navigate('/farms')}>Farms & fields</span>
          <span>/</span>
          <span style={{ cursor: 'pointer', color: '#183D2D', fontWeight: 600 }} onClick={() => navigate('/farms')}>{parentFarm?.name || 'Primary Farm'}</span>
          <span>/</span>
          <span style={{ color: '#183D2D', fontWeight: 800 }}>{field.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/farms')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Farm</span>
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ fontSize: '1.85rem', color: '#183D2D', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  {field.name}
                </h1>
                <span
                  style={{
                    background: isMoistureCritical ? '#FFF1F0' : '#E6F2EB',
                    color: isMoistureCritical ? '#E0533C' : '#183D2D',
                    border: `1px solid ${isMoistureCritical ? '#F8DFDB' : '#C8E2D3'}`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.76rem',
                    fontWeight: 800
                  }}
                >
                  {isMoistureCritical ? 'Attention Needed' : 'Healthy Stand'}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#6B8074', marginTop: '0.2rem' }}>
                {parentFarm?.name} • {field.area} {parentFarm?.areaUnit || 'acres'} • Soil: {field.soilType}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsLogModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} />
              <span>Log Action</span>
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSimulateIrrigation}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <Droplets size={15} />
              <span>{irrigationSimulated ? 'Irrigation Applied ✓' : 'Execute 35mm Drip'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KEY FIELD SPECIFICATIONS METRICS STRIP (4 CARDS)
          ========================================================================= */}
      <div className="grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.4rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>PARCEL AREA</span>
          <h2 style={{ fontSize: '1.9rem', color: '#183D2D', fontWeight: 800, margin: '0.3rem 0 0.1rem 0' }}>
            {field.area} <span style={{ fontSize: '1rem', fontWeight: 600 }}>{parentFarm?.areaUnit || 'acres'}</span>
          </h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>
            {parentFarm?.totalArea ? `${((field.area / parentFarm.totalArea) * 100).toFixed(0)}% of total farm` : 'Sub-plot zone'}
          </span>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.4rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SOIL TAXONOMY</span>
          <h2 style={{ fontSize: '1.5rem', color: '#183D2D', fontWeight: 800, margin: '0.4rem 0 0.1rem 0' }}>
            {field.soilType}
          </h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>High organic matter, Loam base</span>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.4rem' }}>
          <span style={{ color: '#6B8074', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>IRRIGATION GRID</span>
          <h2 style={{ fontSize: '1.5rem', color: '#183D2D', fontWeight: 800, margin: '0.4rem 0 0.1rem 0' }}>
            {field.irrigationType}
          </h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>Automated solenoid valves</span>
        </div>

        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#6B8074', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>FIELD VITALITY</span>
            <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '9999px', border: '1px solid #C8E2D3' }}>
              OPTIMAL
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', color: '#183D2D', fontWeight: 800, margin: '0.3rem 0 0.1rem 0' }}>
            94%
          </h2>
          <span style={{ color: '#85998D', fontSize: '0.78rem' }}>Yield expectation index</span>
        </div>
      </div>

      {/* =========================================================================
          CRITICAL AGRONOMY BANNER (IF APPLICABLE)
          ========================================================================= */}
      {isMoistureCritical && (
        <div
          style={{
            background: 'linear-gradient(135deg, #183D2D 0%, #0F2B1E 100%)',
            borderRadius: '18px',
            padding: '1.5rem 1.85rem',
            color: '#FFFFFF',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 24px rgba(24, 61, 45, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(217, 119, 6, 0.2)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(217, 119, 6, 0.4)' }}>
              <Droplets size={26} color="#FBBF24" />
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#A2CBB5', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                SOIL MOISTURE NOTICE • SENSOR IOT-SM-001
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0.15rem 0' }}>
                Soil hydration dropped to 18.5% (Threshold: 25%)
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#C2DEC8', margin: 0 }}>
                Corn tasseling stage requires active hydration. Drip cycle of 35mm recommended before daytime peak evaporation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSimulateIrrigation}
            style={{
              background: '#E6F2EB',
              color: '#183D2D',
              border: '1px solid #C8E2D3',
              borderRadius: '12px',
              padding: '0.7rem 1.4rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
            }}
          >
            <span>Trigger Drip Cycle</span>
            <ArrowRight size={15} color="#183D2D" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN 2-COLUMN DASHBOARD GRID
          ========================================================================= */}
      <div className="grid-cols-3" style={{ marginBottom: '1.75rem' }}>
        
        {/* Left Column (2 Spans): Active Crop Lifecycle & IoT Sensors */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Active Crop Lifecycle Card */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B8074', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ACTIVE CROPPING
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#183D2D', fontWeight: 800 }}>
                  Crop Lifecycle & Development
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/crops')}>
                <span>Manage Crops</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {activeCrop ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: '#F8FAF8', padding: '1.2rem', borderRadius: '14px', border: '1px solid #E4ECE7', marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-3">
                    <div style={{ background: '#E6F2EB', padding: '0.75rem', borderRadius: '12px', display: 'flex' }}>
                      <Wheat size={26} color="#183D2D" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#183D2D', fontWeight: 800 }}>{activeCrop.cropType}</h4>
                      <span style={{ fontSize: '0.84rem', color: '#6B8074' }}>Variety: {activeCrop.variety || 'Standard Commercial'} • Planted {activeCrop.plantingDate}</span>
                    </div>
                  </div>

                  <span style={{ background: '#E6F2EB', color: '#183D2D', fontSize: '0.78rem', fontWeight: 800, padding: '0.3rem 0.75rem', borderRadius: '9999px', border: '1px solid #C8E2D3' }}>
                    {activeCrop.growthStage || 'Vegetative Growth'}
                  </span>
                </div>

                {/* 5-Step Growth Stage Visual Tracker */}
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#6B8074' }}>
                    <span>1. Emergence</span>
                    <span>2. Vegetative</span>
                    <span style={{ color: '#183D2D', fontWeight: 800 }}>3. Tasseling (Now)</span>
                    <span>4. Grain Fill</span>
                    <span>5. Harvest</span>
                  </div>

                  <div style={{ height: '8px', background: '#E2ECE5', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '60%', background: '#183D2D', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', color: '#5C7064' }}>
                    <span>Expected Harvest: <strong>{activeCrop.expectedHarvestDate || 'October 2026'}</strong></span>
                    <span>Lifecycle Progress: <strong>60% Complete</strong></span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#6B8074' }}>
                No active crop planted in this plot.
              </div>
            )}
          </div>

          {/* IoT Telemetry Sensors for this Field */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#6B8074', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TELEMETRY FLEET
                </div>
                <h3 style={{ fontSize: '1.25rem', color: '#183D2D', fontWeight: 800 }}>
                  Live Parcel Telemetry ({sensors.length} Nodes)
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sensors')}>
                <span>All Sensors</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Sensor Cards Grid */}
            <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Soil Moisture Sensor */}
              <div style={{ background: '#F8FAF8', border: '1px solid #E4ECE7', borderRadius: '14px', padding: '1.2rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.65rem' }}>
                  <div className="flex items-center gap-2">
                    <Droplets size={18} color="#D97706" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#183D2D' }}>
                      {primaryMoistureSensor?.name || 'Soil Moisture #1'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#6B8074', fontFamily: 'monospace' }}>
                    {primaryMoistureSensor?.deviceId || 'IOT-SM-001'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: isMoistureCritical ? '#E0533C' : '#183D2D' }}>
                    {soilMoistureValue}%
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#6B8074' }}>Target: 25-35%</span>
                </div>

                <div style={{ height: '6px', background: '#E2ECE5', borderRadius: '9999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: `${soilMoistureValue * 2.5}%`, background: isMoistureCritical ? '#E0533C' : '#183D2D', height: '100%' }} />
                </div>
              </div>

              {/* Temperature Sensor */}
              <div style={{ background: '#F8FAF8', border: '1px solid #E4ECE7', borderRadius: '14px', padding: '1.2rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.65rem' }}>
                  <div className="flex items-center gap-2">
                    <Thermometer size={18} color="#183D2D" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#183D2D' }}>
                      {primaryTempSensor?.name || 'Soil & Air Temp'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#6B8074', fontFamily: 'monospace' }}>
                    {primaryTempSensor?.deviceId || 'IOT-TEMP-002'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: '#183D2D' }}>
                    24.8°C
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#6B8074' }}>Diurnal range 18-28°C</span>
                </div>

                <div style={{ height: '6px', background: '#E2ECE5', borderRadius: '9999px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: '65%', background: '#183D2D', height: '100%' }} />
                </div>
              </div>
            </div>

            {/* Micro Sensor Readings Table */}
            {sensorReadings.length > 0 && (
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6B8074', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  RECENT 24-HOUR TELEMETRY LOG
                </span>
                <div style={{ marginTop: '0.5rem', maxHeight: '180px', overflowY: 'auto', border: '1px solid #E2ECE5', borderRadius: '10px' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Reading</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sensorReadings.slice(0, 5).map((r, i) => (
                        <tr key={r._id || i}>
                          <td style={{ fontSize: '0.8rem', color: '#6B8074' }}>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ fontWeight: 700, color: '#183D2D' }}>{r.value} {r.unit}</td>
                          <td>
                            <span style={{ fontSize: '0.72rem', background: '#E6F2EB', color: '#183D2D', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                              Synced
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Span): AI Recommendations, Pests & Parcel Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* AI Agronomic Advisory */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Sparkles size={18} color="#183D2D" />
                <h3 style={{ fontSize: '1.15rem', color: '#183D2D', fontWeight: 800 }}>
                  AI Advisory
                </h3>
              </div>
              <span className="badge badge-warning">ACTIVE INSIGHT</span>
            </div>

            <div style={{ background: '#F8FAF8', padding: '1rem', borderRadius: '12px', border: '1px solid #E4ECE7', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.98rem', color: '#183D2D', fontWeight: 700, marginBottom: '0.35rem' }}>
                Tassel Hydration Protocol
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#5C7064', lineHeight: 1.45, marginBottom: '0.65rem' }}>
                Soil moisture is low (18.5%). Schedule 35mm drip irrigation to safeguard pollen viability and ear development.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#6B8074' }}>
                Confidence: <strong style={{ color: '#183D2D' }}>96% Model Agreement</strong>
              </div>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/recommendations')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <span>View All Recommendations</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Pest & Disease Alerts for this Field */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Bug size={18} color="#183D2D" />
                <h3 style={{ fontSize: '1.15rem', color: '#183D2D', fontWeight: 800 }}>
                  Pest & Disease Logs
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/pests')} style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}>
                History
              </button>
            </div>

            {pests.length > 0 ? (
              <div className="flex flex-col gap-2">
                {pests.map((p) => (
                  <div key={p._id} style={{ background: '#FFF9F8', border: '1px solid #F8DFDB', borderRadius: '10px', padding: '0.75rem 0.9rem' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '0.2rem' }}>
                      <h5 style={{ fontSize: '0.88rem', color: '#183D2D', fontWeight: 700 }}>{p.pestName}</h5>
                      <span style={{ fontSize: '0.7rem', color: '#E0533C', fontWeight: 800, background: '#FFF1F0', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                        {p.severity}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#5C7064', margin: 0 }}>{p.treatment || 'Neem-based organic spray applied.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#6B8074', fontSize: '0.85rem' }}>
                <CheckCircle2 size={24} color="#183D2D" style={{ opacity: 0.5, margin: '0 auto 0.4rem auto' }} />
                <span>Zero pest incidents detected in this plot</span>
              </div>
            )}
          </div>

          {/* Sub-Plot Operational Activity Log */}
          <div className="glass-card">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-2">
                <Clock size={18} color="#183D2D" />
                <h3 style={{ fontSize: '1.15rem', color: '#183D2D', fontWeight: 800 }}>
                  Parcel Activity Log
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsLogModalOpen(true)}
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
              >
                + Add
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {logs.slice(0, 4).map((log) => (
                <div key={log.id} style={{ borderBottom: '1px solid #F0F4F1', paddingBottom: '0.65rem' }}>
                  <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: '#85998D', marginBottom: '0.15rem' }}>
                    <span>{log.date}</span>
                    <span style={{ fontWeight: 700, color: log.status === 'ALERT' ? '#E0533C' : '#183D2D' }}>{log.status}</span>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#183D2D' }}>{log.action}</div>
                  <div style={{ fontSize: '0.78rem', color: '#5C7064', marginTop: '0.1rem' }}>{log.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD PARCEL ACTIVITY LOG
          ========================================================================= */}
      {isLogModalOpen && (
        <Modal isOpen={true} onClose={() => setIsLogModalOpen(false)} title={`Log Farm Action on ${field.name}`}>
          <form onSubmit={handleAddLog}>
            <div className="form-group">
              <label>Action Performed</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Drip Irrigation / Fertilizer Application / Weeding"
                value={newLog.action}
                onChange={(e) => setNewLog({ ...newLog, action: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Action Category / Status</label>
              <select
                className="form-control"
                value={newLog.status}
                onChange={(e) => setNewLog({ ...newLog, status: e.target.value })}
              >
                <option value="SUCCESS">SUCCESS (Normal Intervention)</option>
                <option value="NOTICE">NOTICE (Observation)</option>
                <option value="ALERT">ALERT (Requires follow up)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Agronomic Notes & Intervention Details</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Describe dosage, water volume, observation or equipment used..."
                value={newLog.details}
                onChange={(e) => setNewLog({ ...newLog, details: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-between" style={{ marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Activity Record
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
