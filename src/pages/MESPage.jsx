import React from 'react';
import useFactoryStore from '../store/factoryStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function OEEGauge({ value, label, color }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;

  return (
    <div className="oee-gauge">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#E2E8E5" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={circumference - progress}
          strokeLinecap="round" />
      </svg>
      <div className="oee-gauge-value">{value}%</div>
      <div className="oee-gauge-label">{label}</div>
    </div>
  );
}

export default function MESPage() {
  const production = useFactoryStore(s => s.production);
  const mes = useFactoryStore(s => s.mes);
  const machine = useFactoryStore(s => s.machine);
  const getOEE = useFactoryStore(s => s.getOEE);
  const oee = getOEE();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Manufacturing Execution System</h2>
        <span className="mono text-muted text-xs">MES-01 / Production Tracking & OEE Analysis</span>
      </div>

      {/* OEE Section */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">
            <span className="card-icon">◉</span> Overall Equipment Effectiveness (OEE)
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
            <OEEGauge value={oee.availability} label="Availability" color="var(--status-normal)" />
            <OEEGauge value={oee.performance} label="Performance" color="var(--accent-blue)" />
            <OEEGauge value={oee.quality} label="Quality" color="var(--accent-cyan)" />
            <OEEGauge value={oee.oee} label="OEE" color="var(--accent-orange)" />
          </div>
          <div style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--text-tertiary)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            OEE = Availability ({oee.availability}%) × Performance ({oee.performance}%) × Quality ({oee.quality}%) = {oee.oee}%
          </div>
        </div>
      </div>

      {/* Job Orders */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Job Order</span>
        </div>
        <div className="card-body" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Produk</th>
                <th>Target</th>
                <th>Aktual</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mes.jobs.map(job => {
                const prog = job.target > 0 ? ((job.aktual / job.target) * 100).toFixed(1) : 0;
                return (
                  <tr key={job.id}>
                    <td className="mono fw-600">{job.id}</td>
                    <td>{job.produk}</td>
                    <td className="mono">{job.target.toLocaleString('id-ID')}</td>
                    <td className="mono">{job.aktual.toLocaleString('id-ID')}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill orange" style={{ width: `${Math.min(prog, 100)}%` }} />
                        </div>
                        <span className="mono text-xs">{prog}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${job.status === 'Selesai' ? 'normal' : job.status === 'Berjalan' ? 'waspada' : ''}`}
                        style={job.status === 'Menunggu' ? { background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' } : {}}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Status + Machine */}
      <div className="dashboard-grid dashboard-grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Status Produksi</span>
          </div>
          <div className="card-body">
            <div className="inspection-panel">
              <div className="inspection-row">
                <span className="inspection-label">Work Order Aktif</span>
                <span className="inspection-value">{production.currentOrder}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Produk</span>
                <span className="inspection-value">{production.orderProduct}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Output</span>
                <span className="inspection-value">{production.output.toLocaleString('id-ID')} unit</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Reject</span>
                <span className="inspection-value" style={{ color: production.reject > 20 ? 'var(--status-kritis)' : 'inherit' }}>
                  {production.reject} unit
                </span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Rate</span>
                <span className="inspection-value">~{production.rate} unit/jam</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Cycle</span>
                <span className="inspection-value">
                  <span className="status-badge normal"><span className="badge-dot" /> Berjalan</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Status Mesin</span>
          </div>
          <div className="card-body">
            <div className="inspection-panel">
              <div className="inspection-row">
                <span className="inspection-label">Mesin</span>
                <span className="inspection-value">CONVEYOR-01 / MOTOR-01</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Status</span>
                <span className={`status-badge ${machine.status.toLowerCase()}`}>
                  <span className="badge-dot" /> {machine.status}
                </span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">RPM</span>
                <span className="inspection-value">{machine.rpm.toLocaleString('id-ID')}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Suhu</span>
                <span className="inspection-value">{machine.suhu} °C</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Load</span>
                <span className="inspection-value">{machine.motor_load}%</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Uptime</span>
                <span className="inspection-value">14 jam 28 menit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
