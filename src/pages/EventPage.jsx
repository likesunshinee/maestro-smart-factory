import React, { useState } from 'react';
import useFactoryStore from '../store/factoryStore';

export default function EventPage() {
  const events = useFactoryStore(s => s.events);
  const [filter, setFilter] = useState('Semua');

  const filters = ['Semua', 'Produksi', 'Mesin', 'Vision', 'MES', 'ERP', 'Sistem'];

  const filteredEvents = filter === 'Semua' 
    ? events 
    : events.filter(e => e.type === filter);

  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    warning: events.filter(e => e.severity === 'warning').length,
    info: events.filter(e => e.severity === 'info').length,
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Event & Alert Center</h2>
        <span className="mono text-muted text-xs">Sistem Log Terpusat</span>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="metric-card accent-blue">
          <div className="metric-label">Total Event</div>
          <div className="metric-value">{stats.total}</div>
        </div>
        <div className="metric-card accent-green">
          <div className="metric-label">Info (Normal)</div>
          <div className="metric-value">{stats.info}</div>
        </div>
        <div className="metric-card" style={{ borderLeft: '3px solid var(--status-waspada)' }}>
          <div className="metric-label">Warning</div>
          <div className="metric-value">{stats.warning}</div>
        </div>
        <div className="metric-card" style={{ borderLeft: '3px solid var(--status-kritis)' }}>
          <div className="metric-label">Critical</div>
          <div className="metric-value">{stats.critical}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '12px 16px' }}>
          <div className="filter-tabs" style={{ margin: 0, background: 'transparent' }}>
            {filters.map(f => (
              <button 
                key={f} 
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                style={{ 
                  background: filter === f ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  border: '1px solid var(--border-light)' 
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body" style={{ minHeight: 400, overflow: 'auto' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
              Tidak ada event untuk filter ini.
            </div>
          ) : (
            <div className="event-timeline">
              {filteredEvents.map((e, i) => (
                <div key={i} className="event-item" style={{ padding: '10px 0', alignItems: 'center' }}>
                  <span className="event-time" style={{ fontSize: '0.75rem', minWidth: 80 }}>{e.time}</span>
                  <span className={`event-dot ${e.severity}`} style={{ width: 8, height: 8, marginTop: 0 }} />
                  <span className="event-type" style={{ minWidth: 80, textAlign: 'center' }}>{e.type}</span>
                  <span className="event-message" style={{ 
                    fontWeight: e.severity !== 'info' ? 600 : 400,
                    color: e.severity === 'critical' ? 'var(--status-kritis)' : 
                           e.severity === 'warning' ? 'var(--status-waspada)' : 'inherit'
                  }}>
                    {e.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
