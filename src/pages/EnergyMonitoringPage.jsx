import React from 'react';
import { Zap, Activity } from 'lucide-react';

export default function EnergyMonitoringPage() {
  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 20 }}>Energy Monitoring</h2>
      
      <div className="metric-grid">
        <div className="metric-card accent-orange">
          <div className="metric-label">Konsumsi Total (Hari Ini)</div>
          <div className="metric-value">450<span className="metric-unit"> kWh</span></div>
        </div>
        <div className="metric-card accent-cyan">
          <div className="metric-label">Rata-rata Daya</div>
          <div className="metric-value">18.5<span className="metric-unit"> kW</span></div>
        </div>
        <div className="metric-card accent-blue">
          <div className="metric-label">Efisiensi Energi (vs Baseline)</div>
          <div className="metric-value">+4.2<span className="metric-unit">%</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Zap size={16} className="card-icon" /> Pemakaian per Mesin</div>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.8rem' }}>
              <span>Motor Conveyor Utama</span>
              <span className="mono">120 kWh</span>
            </div>
            <div className="progress-bar"><div className="progress-fill orange" style={{ width: '45%' }}></div></div>
          </div>
          <div style={{ marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.8rem' }}>
              <span>Lengan Robot Assembly</span>
              <span className="mono">85 kWh</span>
            </div>
            <div className="progress-bar"><div className="progress-fill cyan" style={{ width: '30%' }}></div></div>
          </div>
          <div style={{ marginBottom: 15 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.8rem' }}>
              <span>Sistem Pendingin</span>
              <span className="mono">210 kWh</span>
            </div>
            <div className="progress-bar"><div className="progress-fill blue" style={{ width: '70%' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
