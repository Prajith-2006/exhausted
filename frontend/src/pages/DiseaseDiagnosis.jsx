import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';

export default function DiseaseDiagnosis() {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const reloadIframe = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Top Header */}
      <div className="flex items-center justify-between" style={{ padding: '0.25rem 0' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#183D2D', margin: 0 }}>
              Plant Disease Diagnostic System
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '0.25rem 0.6rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={11} /> SmartAgro MobileNetV2
            </span>
          </div>
          <p style={{ color: '#52665A', fontSize: '0.86rem', marginTop: '0.25rem' }}>
            Integrated Deep Learning Leaf Scanner, 3-Tier Differential Diagnosis & Calibrated Pesticide Prescriptions
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={reloadIframe}
            title="Reload AI Engine"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '0.45rem 0.8rem',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#374151'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Reload</span>
          </button>
          <a
            href="http://localhost:5005/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              background: '#183D2D',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            <span>Open Standalone</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Embedded SmartAgro AI Dashboard Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 180px)',
          minHeight: '680px',
          background: '#0A0F0D',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
          border: '1px solid #204B38'
        }}
      >
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0A0F0D',
              color: '#34D399',
              zIndex: 10,
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(52, 211, 153, 0.2)',
                borderTopColor: '#34D399',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Connecting to SmartAgro AI Engine...</span>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="http://localhost:5005/?embedded=true"
          title="SmartAgro AI Plant Disease Diagnosis System"
          onLoad={() => setIsLoading(false)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          allow="camera; microphone; clipboard-write;"
        />
      </div>
    </div>
  );
}
