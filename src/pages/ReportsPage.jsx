import React from 'react';
import { FileText, Download, Filter } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Dynamic Reports</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline"><Filter size={14} /> Filter</button>
          <button className="btn btn-primary"><Download size={14} /> Export Semua</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><FileText size={16} className="card-icon" /> Laporan Tersedia</div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Laporan</th>
                <th>Tipe</th>
                <th>Terakhir Diperbarui</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Laporan Produksi Harian (Shift 1)</td>
                <td><span className="status-badge normal">PDF</span></td>
                <td>Hari ini, 14:00</td>
                <td>
                  <button className="btn btn-sm btn-secondary"><Download size={12} style={{marginRight: 4}}/> Unduh</button>
                </td>
              </tr>
              <tr>
                <td>Ringkasan OEE (Overall Equipment Effectiveness)</td>
                <td><span className="status-badge normal" style={{background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)'}}>CSV</span></td>
                <td>Kemarin, 23:59</td>
                <td>
                  <button className="btn btn-sm btn-secondary"><Download size={12} style={{marginRight: 4}}/> Unduh</button>
                </td>
              </tr>
              <tr>
                <td>Log Anomali & Predictive Maintenance</td>
                <td><span className="status-badge normal" style={{background: 'var(--bg-sidebar)', color: 'var(--text-inverse)'}}>JSON</span></td>
                <td>Hari ini, 15:30</td>
                <td>
                  <button className="btn btn-sm btn-secondary"><Download size={12} style={{marginRight: 4}}/> Unduh</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
