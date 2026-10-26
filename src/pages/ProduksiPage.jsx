import React from 'react';
import useFactoryStore from '../store/factoryStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProduksiPage() {
  const production = useFactoryStore(s => s.production);
  const addProduction = useFactoryStore(s => s.addProduction);
  const addReject = useFactoryStore(s => s.addReject);
  const getOEE = useFactoryStore(s => s.getOEE);
  const machine = useFactoryStore(s => s.machine);
  const objectHistory = useFactoryStore(s => s.objectHistory);
  const oee = getOEE();
  const progress = production.target > 0 ? ((production.output / production.target) * 100).toFixed(1) : 0;

  const hourlyData = [];
  for (let h = 6; h <= new Date().getHours(); h++) {
    hourlyData.push({
      jam: `${String(h).padStart(2, '0')}:00`,
      output: Math.round(production.output / (new Date().getHours() - 5) + (Math.random() - 0.5) * 10),
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Produksi</h2>
          <span className="mono text-muted text-xs">Work Order: {production.currentOrder} — {production.orderProduct}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={addProduction} disabled={machine.status === 'KRITIS'}>
            + Produksi
          </button>
          <button className="btn btn-outline btn-sm" onClick={addReject} style={{ borderColor: 'var(--status-kritis)', color: 'var(--status-kritis)' }}>
            + Reject
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="metric-card accent-orange">
          <div className="metric-label">Output</div>
          <div className="metric-value">{production.output.toLocaleString('id-ID')}</div>
          <div className="metric-sub">dari target {production.target.toLocaleString('id-ID')}</div>
        </div>
        <div className="metric-card accent-orange">
          <div className="metric-label">Reject</div>
          <div className="metric-value">{production.reject}</div>
          <div className="metric-sub">{production.output > 0 ? ((production.reject / production.output) * 100).toFixed(1) : 0}% reject rate</div>
        </div>
        <div className="metric-card accent-blue">
          <div className="metric-label">Progress</div>
          <div className="metric-value">{progress}<span className="metric-unit">%</span></div>
        </div>
        <div className="metric-card accent-green">
          <div className="metric-label">Availability</div>
          <div className="metric-value">{oee.availability}<span className="metric-unit">%</span></div>
        </div>
        <div className="metric-card accent-cyan">
          <div className="metric-label">Performance</div>
          <div className="metric-value">{oee.performance}<span className="metric-unit">%</span></div>
        </div>
        <div className="metric-card accent-blue">
          <div className="metric-label">OEE</div>
          <div className="metric-value">{oee.oee}<span className="metric-unit">%</span></div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">Progress Produksi</span>
          <span className="mono text-muted text-xs">{production.output} / {production.target}</span>
        </div>
        <div className="card-body">
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill orange" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span className="text-xs text-muted">Mulai: {production.startTime}</span>
            <span className="text-xs text-muted">Rate: ~{production.rate} unit/jam</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-sidebar" style={{ marginTop: 16 }}>
        {/* Hourly chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Output per Jam</span>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E5" />
                  <XAxis dataKey="jam" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', borderRadius: 4 }} />
                  <Bar dataKey="output" fill="#FF6A00" radius={[2, 2, 0, 0]} name="Output" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent objects */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Objek Terakhir</span>
          </div>
          <div className="card-body" style={{ overflow: 'auto', maxHeight: 240 }}>
            {objectHistory.length === 0 ? (
              <div className="text-muted text-sm" style={{ textAlign: 'center', padding: 20 }}>
                Belum ada objek terdeteksi.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Kelas</th>
                    <th>Dimensi</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {objectHistory.slice(0, 10).map(obj => (
                    <tr key={obj.id + obj.timestamp}>
                      <td className="mono">{obj.id}</td>
                      <td>{obj.kelas}</td>
                      <td className="mono">{obj.panjang}×{obj.lebar}×{obj.tinggi}</td>
                      <td>
                        <span className={`status-badge ${obj.status === 'LULUS' ? 'normal' : 'kritis'}`} style={{ fontSize: '0.65rem' }}>
                          {obj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Production flow */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">Alur Produksi</span>
        </div>
        <div className="card-body">
          <div className="closed-loop-flow">
            {[
              { label: 'MATERIAL', sub: 'Tersedia' },
              { label: 'KONVEYOR', sub: machine.status },
              { label: 'INSPEKSI', sub: 'Vision + ML' },
              { label: 'PRODUKSI', sub: `${production.output} unit` },
              { label: 'GUDANG', sub: 'Output' },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="loop-step active">
                  <span className="loop-step-label">{s.label}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{s.sub}</span>
                </div>
                {i < 4 && <span className="loop-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
