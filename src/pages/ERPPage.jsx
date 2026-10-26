import React from 'react';
import useFactoryStore from '../store/factoryStore';

export default function ERPPage() {
  const inventory = useFactoryStore(s => s.inventory);
  const production = useFactoryStore(s => s.production);

  const totalCost = (production.output * 125000).toLocaleString('id-ID');
  const estimatedCost = (production.target * 125000).toLocaleString('id-ID');

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Enterprise Resource Planning</h2>
        <span className="mono text-muted text-xs">ERP-01 / Inventory & Resource Management</span>
      </div>

      <div className="dashboard-grid dashboard-grid-main">
        {/* Inventory Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <span className="card-icon">📦</span> Status Inventory Bahan Baku
            </span>
            <span className="card-badge mono" style={{ background: 'var(--bg-tertiary)' }}>GUDANG UTAMA</span>
          </div>
          <div className="card-body" style={{ overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Material</th>
                  <th>Nama Material</th>
                  <th>Stok Aktual</th>
                  <th>Batas Minimum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const isLow = item.stok <= item.minimum;
                  const percent = Math.min(100, Math.max(0, (item.stok / (item.minimum * 3)) * 100));
                  return (
                    <tr key={item.id}>
                      <td className="mono fw-600">{item.id}</td>
                      <td>{item.nama}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="mono">{item.stok.toLocaleString('id-ID')} {item.satuan}</span>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className={`progress-fill ${isLow ? 'orange' : 'green'}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="mono text-muted">{item.minimum.toLocaleString('id-ID')} {item.satuan}</td>
                      <td>
                        <span className={`status-badge ${isLow ? 'waspada' : 'normal'}`} style={{ fontSize: '0.65rem' }}>
                          {isLow ? 'STOK MENIPIS' : 'AMAN'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost & Resource Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Estimasi Biaya Operasional</span>
            </div>
            <div className="card-body">
              <div className="inspection-panel">
                <div className="inspection-row">
                  <span className="inspection-label">Work Order</span>
                  <span className="inspection-value">{production.currentOrder}</span>
                </div>
                <div className="inspection-row">
                  <span className="inspection-label">Biaya per Unit (Est.)</span>
                  <span className="inspection-value">Rp 125.000</span>
                </div>
                <div className="inspection-row">
                  <span className="inspection-label">Biaya Aktual</span>
                  <span className="inspection-value text-blue fw-700">Rp {totalCost}</span>
                </div>
                <div className="inspection-row">
                  <span className="inspection-label">Proyeksi Total</span>
                  <span className="inspection-value text-muted">Rp {estimatedCost}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Pemakaian Material (Live)</span>
            </div>
            <div className="card-body">
              <div className="inspection-panel">
                {inventory.slice(0, 3).map(item => {
                  const used = (production.output * item.usage_per_unit).toFixed(1);
                  return (
                    <div key={item.id} className="inspection-row">
                      <span className="inspection-label">{item.nama}</span>
                      <span className="inspection-value">-{used} {item.satuan}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-12 text-xs text-muted">
                * Pemakaian material dihitung otomatis berdasarkan produksi unit aktual ({production.output} unit).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
