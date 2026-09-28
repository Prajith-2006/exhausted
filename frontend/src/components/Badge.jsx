import React from 'react';

export default function Badge({ type = 'neutral', children }) {
  const map = {
    active: 'badge-success',
    planned: 'badge-info',
    harvested: 'badge-neutral',
    failed: 'badge-danger',
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-danger',
    critical: 'badge-danger',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    neutral: 'badge-neutral'
  };

  const badgeClass = map[String(type).toLowerCase()] || 'badge-neutral';

  return (
    <span className={`badge ${badgeClass}`}>
      {children}
    </span>
  );
}
