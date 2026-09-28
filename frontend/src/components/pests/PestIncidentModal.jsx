import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Badge from '../Badge';
import CameraCapture from './CameraCapture';
import PdfUpload from './PdfUpload';
import { api } from '../../services/api';
import { 
  FileText, 
  Camera, 
  Edit3, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ArrowLeft, 
  ShieldAlert, 
  Info, 
  Loader2 
} from 'lucide-react';

export default function PestIncidentModal({ isOpen, onClose, farm, crops, fields, onSaved, autoStartCamera = false }) {
  // Workflow step: 1 = Choose Input Method, 2 = Fill Form & Capture, 3 = AI Loading, 4 = AI Result Review, 5 = Manual Edit
  const [step, setStep] = useState(autoStartCamera ? 2 : 1);
  const [activeMethods, setActiveMethods] = useState({ manual: !autoStartCamera, pdf: false, camera: !!autoStartCamera });

  // Form inputs
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [dateDetected, setDateDetected] = useState(new Date().toISOString().split('T')[0]);
  const [initialSeverity, setInitialSeverity] = useState('MEDIUM');
  const [affectedArea, setAffectedArea] = useState(0.5);
  const [areaUnit, setAreaUnit] = useState('Acres');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  // Files
  const [pdfFile, setPdfFile] = useState(null);
  const [cameraFile, setCameraFile] = useState(null);

  // AI Result & Edit State
  const [aiResult, setAiResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Pre-filled edit state before saving to MongoDB
  const [confirmForm, setConfirmForm] = useState({
    pestName: '',
    severity: 'MEDIUM',
    dateDetected: new Date().toISOString().split('T')[0],
    affectedArea: 0.5,
    treatment: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && autoStartCamera) {
      setStep(2);
      setActiveMethods({ manual: false, pdf: false, camera: true });
    }
  }, [isOpen, autoStartCamera]);

  useEffect(() => {
    if (crops && crops.length > 0 && !selectedCropId) {
      setSelectedCropId(crops[0]._id);
    }
    if (fields && fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0]._id);
    }
  }, [crops, fields]);

  const resetState = () => {
    setStep(1);
    setActiveMethods({ manual: true, pdf: false, camera: false });
    setSymptoms('');
    setNotes('');
    setPdfFile(null);
    setCameraFile(null);
    setAiResult(null);
    setSubmitting(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const toggleMethod = (method) => {
    setActiveMethods(prev => {
      const updated = { ...prev, [method]: !prev[method] };
      if (!updated.manual && !updated.pdf && !updated.camera) {
        updated[method] = true;
      }
      return updated;
    });
  };

  const proceedToForm = (method) => {
    setActiveMethods({
      manual: method === 'manual',
      pdf: method === 'pdf',
      camera: method === 'camera'
    });
    setStep(2);
  };

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!farm || !selectedCropId) {
      setErrorMsg('Please select a valid farm and crop.');
      return;
    }

    if (activeMethods.camera && !activeMethods.manual && !activeMethods.pdf && !cameraFile) {
      setErrorMsg('Please capture or select a crop photo file before analyzing.');
      return;
    }

    if (activeMethods.pdf && !activeMethods.manual && !activeMethods.camera && !pdfFile) {
      setErrorMsg('Please select a valid PDF report document before analyzing.');
      return;
    }

    if (activeMethods.manual && !symptoms && !cameraFile && !pdfFile) {
      setErrorMsg('Please describe observed symptoms or attach a photo / PDF report.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setStep(3); // Show AI loading state

    try {
      const formData = new FormData();
      formData.append('farmId', farm._id);
      formData.append('cropId', selectedCropId);
      if (selectedFieldId) formData.append('fieldId', selectedFieldId);
      formData.append('symptoms', symptoms);
      formData.append('notes', notes);
      formData.append('initialSeverity', initialSeverity);
      formData.append('affectedArea', affectedArea);
      formData.append('areaUnit', areaUnit);
      formData.append('dateDetected', dateDetected);

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }
      if (cameraFile) {
        formData.append('image', cameraFile);
      }

      const result = await api.analyzePest(formData);
      setAiResult(result);
      
      // Pre-fill editable record form with AI identification
      const pestName = result.identification?.name !== 'Uncertain' ? result.identification?.name : 'Unidentified Foliar Damage';
      const firstRec = result.recommendations?.[0]?.description || '';
      
      setConfirmForm({
        pestName: pestName,
        severity: result.severity || initialSeverity || 'MEDIUM',
        dateDetected: dateDetected,
        affectedArea: affectedArea,
        treatment: firstRec,
        notes: result.summary || symptoms || ''
      });

      setStep(4); // Move to AI result review
    } catch (err) {
      console.error('[PestIncidentModal] Analysis error:', err);
      setErrorMsg(err.message || 'Failed to analyze incident report.');
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmAndSave = async (e) => {
    if (e) e.preventDefault();
    if (!farm || !selectedCropId) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await api.createPest({
        farmId: farm._id,
        fieldId: selectedFieldId || undefined,
        cropId: selectedCropId,
        pestName: confirmForm.pestName,
        severity: confirmForm.severity,
        dateDetected: confirmForm.dateDetected,
        affectedArea: Number(confirmForm.affectedArea),
        treatment: confirmForm.treatment,
        notes: confirmForm.notes,
        aiAnalysis: aiResult || undefined
      });

      if (onSaved) await onSaved();
      handleClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save pest record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI-Assisted Pest & Disease Incident Report">
      {/* STEP 1: Choose Input Method */}
      {step === 1 && (
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Choose how you would like to report the crop abnormality. You can use manual details, upload a PDF report, or take a photo with your device camera.
          </p>

          <div className="grid-cols-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div
              className={`glass-card ${activeMethods.manual ? 'active-card' : ''}`}
              onClick={() => proceedToForm('manual')}
              style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
            >
              <div style={{ background: '#E0E7FF', color: '#3730A3', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Edit3 size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Enter Details</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Describe what you observed manually</p>
            </div>

            <div
              className={`glass-card ${activeMethods.pdf ? 'active-card' : ''}`}
              onClick={() => proceedToForm('pdf')}
              style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
            >
              <div style={{ background: '#FEF3C7', color: '#92400E', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Upload PDF</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload an inspection or lab report</p>
            </div>

            <div
              className={`glass-card ${activeMethods.camera ? 'active-card' : ''}`}
              onClick={() => proceedToForm('camera')}
              style={{ padding: '1.25rem', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.2s ease' }}
            >
              <div style={{ background: '#D1FAE5', color: '#065F46', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Camera size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Use Camera</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Take a photo of affected crop</p>
            </div>
          </div>

          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Tip: Select a method above to report using photo, PDF report, or text observations.
            </span>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              <span>Continue</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Input Form & File Captures */}
      {step === 2 && (
        <form onSubmit={handleAnalyze}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>
              <ArrowLeft size={14} /> Back to Method Options
            </button>
            <div className="flex gap-2">
              <span className={`badge ${activeMethods.manual ? 'badge-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleMethod('manual')}>📝 Form</span>
              <span className={`badge ${activeMethods.pdf ? 'badge-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleMethod('pdf')}>📄 PDF</span>
              <span className={`badge ${activeMethods.camera ? 'badge-primary' : ''}`} style={{ cursor: 'pointer' }} onClick={() => toggleMethod('camera')}>📷 Photo</span>
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Farm, Field, Crop & Date Selection - Only shown in manual form mode */}
          {activeMethods.manual && (
            <>
              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Farm</label>
                  <input type="text" className="form-control" value={farm?.name || 'Selected Farm'} disabled />
                </div>

                <div className="form-group">
                  <label>Affected Crop</label>
                  <select
                    className="form-control"
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    required
                  >
                    {crops.map(c => (
                      <option key={c._id} value={c._id} style={{ background: '#111c24' }}>
                        {c.cropType} ({c.variety}) - Stage: {c.growthStage || 'Active'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Field Location (Optional)</label>
                  <select
                    className="form-control"
                    value={selectedFieldId}
                    onChange={(e) => setSelectedFieldId(e.target.value)}
                  >
                    <option value="" style={{ background: '#111c24' }}>All / Unspecified Field</option>
                    {fields.map(f => (
                      <option key={f._id} value={f._id} style={{ background: '#111c24' }}>
                        {f.name} ({f.area} Acres)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Detected</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dateDetected}
                    onChange={(e) => setDateDetected(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Camera Capture Section if active */}
          {activeMethods.camera && (
            <div className="form-group">
              <label className="flex items-center gap-2">
                <Camera size={16} color="var(--primary)" />
                <span>Crop Photo Capture / Upload</span>
              </label>
              <CameraCapture
                initialImage={cameraFile}
                autoStart={true}
                onCapture={(file) => setCameraFile(file)}
                onClear={() => setCameraFile(null)}
              />
            </div>
          )}

          {/* PDF Upload Section if active */}
          {activeMethods.pdf && (
            <div className="form-group">
              <label className="flex items-center gap-2">
                <FileText size={16} color="var(--accent-amber)" />
                <span>Inspection / Agricultural PDF Report</span>
              </label>
              <PdfUpload
                initialFile={pdfFile}
                onFileSelect={(file) => setPdfFile(file)}
                onClear={() => setPdfFile(null)}
              />
            </div>
          )}

          {/* Manual Observations & Extra Details if active */}
          {activeMethods.manual && (
            <>
              <div className="form-group">
                <label>Symptoms / Observations</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe observed leaf spots, feeding holes, insects, or plant wilting..."
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Estimated Affected Area (Acres)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={affectedArea}
                    onChange={(e) => setAffectedArea(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Severity Assessment</label>
                  <select
                    className="form-control"
                    value={initialSeverity}
                    onChange={(e) => setInitialSeverity(e.target.value)}
                  >
                    <option value="LOW" style={{ background: '#111c24' }}>LOW - Minor spot infestation</option>
                    <option value="MEDIUM" style={{ background: '#111c24' }}>MEDIUM - Moderate foliar damage</option>
                    <option value="HIGH" style={{ background: '#111c24' }}>HIGH - Spreading rapidly across rows</option>
                    <option value="CRITICAL" style={{ background: '#111c24' }}>CRITICAL - Severe field yield threat</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem', fontSize: '1rem' }}
          >
            <Sparkles size={18} />
            <span>Analyze with Agricultural AI</span>
          </button>
        </form>
      )}

      {/* STEP 3: Honest Indeterminate Loading UI */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={48} className="animate-spin" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Analyzing your report...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Processing crop observations, weather forecast trends, and image/document content against agronomic intelligence models.
          </p>
          <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-block' }}>
            ✨ Multi-spectral symptom check in progress
          </div>
        </div>
      )}

      {/* STEP 4: AI Assessment Result Screen */}
      {step === 4 && aiResult && (
        <div>
          {/* PRODUCT RULE NOTICE: AI Assessment Advisory Disclaimer */}
          <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.25rem', color: '#92400E', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>AI Decision Support Advisory:</strong> This analysis provides diagnostic decision support based on available evidence. Serious or spreading crop infestations should be verified by a qualified local agronomist.
            </div>
          </div>

          {/* Assessment Overview Card */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', background: '#FAFBF9' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Possible Identification
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  {aiResult.identification?.name || 'Unidentified Condition'}
                </h2>
              </div>
              <div className="flex gap-2">
                <Badge type={aiResult.identification?.category === 'DISEASE' ? 'HIGH' : 'MEDIUM'}>
                  {aiResult.identification?.category || 'PEST'}
                </Badge>
                <Badge type={aiResult.severity || 'MEDIUM'}>
                  {aiResult.severity || 'MEDIUM'} SEVERITY
                </Badge>
              </div>
            </div>

            {/* Confidence Bar */}
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>AI Identification Confidence</span>
                <span style={{ fontWeight: 700, color: aiResult.confidence >= 0.7 ? '#10B981' : '#D97706' }}>
                  {Math.round((aiResult.confidence || 0.5) * 100)}% ({aiResult.confidence >= 0.75 ? 'High Confidence' : aiResult.confidence >= 0.5 ? 'Moderate Confidence' : 'Uncertain / Low Evidence'})
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.round((aiResult.confidence || 0.5) * 100)}%`,
                    height: '100%',
                    background: aiResult.confidence >= 0.75 ? '#10B981' : aiResult.confidence >= 0.5 ? '#F59E0B' : '#EF4444',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>

            {/* Summary */}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {aiResult.summary}
            </p>
          </div>

          {/* Observations & Alternatives */}
          <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>What the AI Observed</span>
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {(aiResult.observations || []).map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={16} color="#D97706" />
                <span>Possible Alternatives</span>
              </h4>
              {(aiResult.possibleAlternatives || []).length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {aiResult.possibleAlternatives.map((alt, idx) => (
                    <li key={idx}>
                      <strong>{alt.name}</strong> ({Math.round(alt.confidence * 100)}%)
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No strong alternative pathogens detected.</p>
              )}
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Recommended Actions
            </h4>
            <div className="flex flex-col gap-2">
              {(aiResult.recommendations || []).map((rec, idx) => (
                <div key={idx} style={{ background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rec.title}</span>
                    <Badge type={rec.priority}>{rec.priority}</Badge>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between" style={{ gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Edit Inputs
            </button>

            <div className="flex gap-2">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(5)}>
                <Edit3 size={16} /> Edit Before Saving
              </button>

              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleConfirmAndSave}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                <CheckCircle2 size={18} />
                <span>Confirm & Save Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Manual Edit Form Before Saving */}
      {step === 5 && (
        <form onSubmit={handleConfirmAndSave}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Review & Edit Pest Record Details
          </h3>

          <div className="form-group">
            <label>Pest or Disease Name</label>
            <input
              type="text"
              className="form-control"
              value={confirmForm.pestName}
              onChange={(e) => setConfirmForm({ ...confirmForm, pestName: e.target.value })}
              required
            />
          </div>

          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Severity Level</label>
              <select
                className="form-control"
                value={confirmForm.severity}
                onChange={(e) => setConfirmForm({ ...confirmForm, severity: e.target.value })}
              >
                <option value="LOW" style={{ background: '#111c24' }}>LOW</option>
                <option value="MEDIUM" style={{ background: '#111c24' }}>MEDIUM</option>
                <option value="HIGH" style={{ background: '#111c24' }}>HIGH</option>
                <option value="CRITICAL" style={{ background: '#111c24' }}>CRITICAL</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date Detected</label>
              <input
                type="date"
                className="form-control"
                value={confirmForm.dateDetected}
                onChange={(e) => setConfirmForm({ ...confirmForm, dateDetected: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Affected Area (Acres)</label>
            <input
              type="number"
              step="any"
              className="form-control"
              value={confirmForm.affectedArea}
              onChange={(e) => setConfirmForm({ ...confirmForm, affectedArea: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Treatment / Recommended Action</label>
            <textarea
              className="form-control"
              rows="3"
              value={confirmForm.treatment}
              onChange={(e) => setConfirmForm({ ...confirmForm, treatment: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              className="form-control"
              rows="2"
              value={confirmForm.notes}
              onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStep(4)}>
              <ArrowLeft size={16} /> Back to AI Result
            </button>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle2 size={18} />
              <span>Confirm & Save Official Record</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
