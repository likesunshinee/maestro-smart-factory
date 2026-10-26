import React from 'react';
import { TrendingUp, Calendar, BarChart2 } from 'lucide-react';

export default function ProductionForecastingPage() {
  return (
    <div className="page-container">
      <h2 style={{ marginBottom: 20 }}>Production Forecasting</h2>
      
      <div className="metric-grid">
        <div className="metric-card accent-green">
          <div className="metric-label">Target Harian</div>
          <div className="metric-value">1,200<span className="metric-unit"> unit</span></div>
        </div>
        <div className="metric-card accent-blue">
          <div className="metric-label">Estimasi Akhir Hari</div>
          <div className="metric-value">1,185<span className="metric-unit"> unit</span></div>
        </div>
        <div className="metric-card accent-orange">
          <div className="metric-label">Akurasi Prediksi AI</div>
          <div className="metric-value">94.2<span className="metric-unit">%</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><TrendingUp size={16} className="card-icon" /> AI Demand Forecasting</div>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.85rem' }}>
            Model prediksi menggunakan data historis 3 bulan terakhir dan tren pesanan ERP untuk mengestimasi kebutuhan produksi minggu depan.
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Prediksi Pesanan (Unit)</th>
                <th>Rekomendasi Kapasitas</th>
                <th>Status Kesiapan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Senin, 5 Okt</td>
                <td className="mono">1,100</td>
                <td>Shift Normal (100%)</td>
                <td><span className="status-badge normal"><span className="badge-dot" /> SIAP</span></td>
              </tr>
              <tr>
                <td>Selasa, 6 Okt</td>
                <td className="mono">1,450</td>
                <td>Lembur / Tambah Kapasitas (+20%)</td>
                <td><span className="status-badge waspada"><span className="badge-dot" /> PERLU TINDAKAN</span></td>
              </tr>
              <tr>
                <td>Rabu, 7 Okt</td>
                <td className="mono">1,050</td>
                <td>Shift Normal (100%)</td>
                <td><span className="status-badge normal"><span className="badge-dot" /> SIAP</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
