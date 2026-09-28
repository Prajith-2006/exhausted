import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle, Upload, X } from 'lucide-react';

export function analyzePixelData(imgData) {
  const data = imgData.data;
  let totalPixels = data.length / 4;
  let skinPixels = 0;
  let foliagePixels = 0;
  let soilPixels = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Skin color detection rule (normalized RGB + YCbCr skin map)
    const isSkinRGB = r > 95 && g > 40 && b > 20 && (max - min) > 15 && Math.abs(r - g) > 15 && r > g && r > b;
    const Y = 0.299 * r + 0.587 * g + 0.114 * b;
    const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    const isSkinYCbCr = Y > 80 && Cb >= 85 && Cb <= 135 && Cr >= 135 && Cr <= 180;

    if (isSkinRGB || isSkinYCbCr) {
      skinPixels++;
    }

    // Green Foliage / Vegetation (Excess Green ExG = 2G - R - B > 15)
    const exg = 2 * g - r - b;
    if (g > r && g > b && exg > 15) {
      foliagePixels++;
    }

    // Brown Soil / Earth tones
    if (r > 80 && g > 50 && b < 120 && r > g && (r - b) > 25) {
      soilPixels++;
    }
  }

  const sampledTotal = totalPixels / 4;
  const skinRatio = skinPixels / sampledTotal;
  const foliageRatio = foliagePixels / sampledTotal;
  const soilRatio = soilPixels / sampledTotal;
  const agroRatio = foliageRatio + soilRatio;

  console.log(`[PixelAnalyzer] skinRatio: ${(skinRatio * 100).toFixed(1)}%, agroRatio: ${(agroRatio * 100).toFixed(1)}%`);

  if (skinRatio > 0.06 || agroRatio < 0.12) {
    return {
      isFarm: false,
      reason: skinRatio > 0.06 ? 'HUMAN_FACE' : 'NON_AGRICULTURAL',
      skinRatio,
      agroRatio,
      error: skinRatio > 0.06
        ? 'Human Face / Portrait Detected! Please point your camera away from faces and capture a real farm field, soil landscape, or crop area (faces & non-farm objects are rejected).'
        : 'Non-Agricultural Object / Room Detected! The camera image does not contain sufficient green foliage or farm soil. Please capture a real farm field or crop landscape.'
    };
  }

  return {
    isFarm: true,
    skinRatio,
    agroRatio,
    foliageRatio,
    soilRatio
  };
}

export default function CameraCapture({ onCapture, initialImage, onClear, autoStart = false }) {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(initialImage ? URL.createObjectURL(initialImage) : null);
  const [capturedFile, setCapturedFile] = useState(initialImage || null);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(newStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.warn('[CameraCapture] Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. Please allow camera permission in your browser settings or select an image file below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device detected. Please upload an image file instead.');
      } else {
        setCameraError('Unable to initialize camera. Please check device settings or upload an image file.');
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (autoStart && !capturedPreview) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const visualAnalysis = analyzePixelData(imgData);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `crop_inspection_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);
          setCapturedFile(file);
          setCapturedPreview(previewUrl);
          stopCamera();
          if (onCapture) onCapture(file, visualAnalysis);
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    if (onClear) onClear();
    startCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCapturedFile(file);
      setCapturedPreview(previewUrl);
      stopCamera();

      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.width || 640;
        offCanvas.height = img.height || 480;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
        const imgData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const visualAnalysis = analyzePixelData(imgData);
        if (onCapture) onCapture(file, visualAnalysis);
      };
      img.src = previewUrl;
    }
  };

  const toggleCameraFacing = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  return (
    <div className="camera-capture-container" style={{ margin: '1rem 0' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Captured Image Preview State */}
      {capturedPreview ? (
        <div style={{ position: 'relative', textAlign: 'center', background: '#0D171E', borderRadius: 'var(--radius-md)', padding: '0.75rem', border: '1px solid var(--border-color)' }}>
          <img
            src={capturedPreview}
            alt="Captured Farm Scene"
            style={{ maxHeight: '280px', width: 'auto', margin: '0 auto', borderRadius: 'var(--radius-sm)', objectFit: 'contain' }}
          />
          <div className="flex items-center justify-center gap-3" style={{ marginTop: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRetake}
            >
              <RefreshCw size={14} />
              <span>Retake Photo</span>
            </button>
            <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={16} /> Photo Captured
            </span>
          </div>
        </div>
      ) : isCameraActive ? (
        /* Live Video Camera Feed State */
        <div style={{ position: 'relative', background: '#000000', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--primary)' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
          />

          {/* Live Indicator Badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', color: '#FFFFFF', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>
            <span>LIVE CAMERA</span>
          </div>

          {/* Controls Bar */}
          <div style={{ position: 'absolute', bottom: '12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={toggleCameraFacing}
              title="Switch Camera"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
            >
              <RefreshCw size={14} />
            </button>

            <button
              type="button"
              onClick={handleCapturePhoto}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '4px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              title="Take Photo"
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)' }} />
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={stopCamera}
              style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Standby / Start Camera / Fallback File Picker */
        <div style={{ background: '#F8FAFC', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
          {cameraError ? (
            <div style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{cameraError}</span>
            </div>
          ) : (
            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Position device camera towards farm field landscape
            </div>
          )}

          <div className="flex items-center justify-center gap-3" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => startCamera()}
            >
              <Camera size={18} />
              <span>Open Device Camera</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              <span>Select Photo File</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}
    </div>
  );
}
