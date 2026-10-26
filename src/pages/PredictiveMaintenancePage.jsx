import React from 'react';
import { Activity, AlertTriangle, AlertOctagon, CheckCircle2, Wrench, Cpu, Zap, Thermometer, Gauge } from 'lucide-react';
import useFactoryStore from '../store/factoryStore';

export default function PredictiveMaintenancePage() {
  const machine = useFactoryStore(s => s.machine);
  const mlResult = useFactoryStore(s => s.mlResult);
  const mandorAI = useFactoryStore(s => s.mandorAI);

  const isKritis = machine.status === 'KRITIS';
  const isWaspada = machine.status === 'WASPADA';
  const healthScore = isKritis ? 38 : isWaspada ? 72 : 94;
  const etfDays = isKritis ? 2 : isWaspada ? 14 : 45;
  const anomaliesCount = (machine.getaran > 7 ? 1 : 0) + (machine.suhu > 45 ? 1 : 0) + (machine.arus > 1.2 ? 1 : 0);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Predictive Maintenance & Root Cause Analysis (RCA)</h2>
          <span className="mono text-muted text-xs">MANDOR AI — Google Coral Edge TPU Anomaly Assessment</span>
        </div>
        <span className={`status-badge ${machine.status.toLowerCase()}`}>
          <span className="badge-dot" /> AI STATUS: {machine.status} (PWM {machine.pwm ?? (isKritis ? 0 : 255)})
        </span>
      </div>

      {/* KPI Summary Cards */}
      <div className="metric-grid">
        <div className="metric-card accent-blue">
          <div className="metric-label">Health Score Mesin</div>
          <div className="metric-value" style={{ color: isKritis ? 'var(--status-kritis)' : isWaspada ? 'var(--status-waspada)' : 'inherit' }}>
            {healthScore}<span className="metric-unit">%</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Berdasarkan Getaran & Beban Termal
          </div>
        </div>
        <div className="metric-card accent-orange">
          <div className="metric-label">Estimated Time to Failure (ETF)</div>
          <div className="metric-value">
            {etfDays}<span className="metric-unit"> Hari</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Estimasi Prediksi Mandor AI
          </div>
        </div>
        <div className="metric-card accent-cyan">
          <div className="metric-label">Anomali Terdeteksi</div>
          <div className="metric-value" style={{ color: anomaliesCount > 0 ? 'var(--status-kritis)' : 'inherit' }}>
            {anomaliesCount}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            {anomaliesCount > 0 ? 'Perlu tindakan preventif segera' : 'Kondisi operasional aman'}
          </div>
        </div>
      </div>

      {/* Live Sensor Features (4 Fitur Mandor AI) */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="card-title">
            <Cpu size={16} className="card-icon" /> 4 Fitur Masukan Sensor ESP32 (Telemetri Real-Time)
          </div>
          <span className="card-badge mono" style={{ background: 'var(--bg-tertiary)' }}>
            model_mandor_quant.tflite
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1. ARUS (ACS712)</div>
              <div className="mono font-bold" style={{ fontSize: '1.2rem', color: 'var(--accent-blue)', marginTop: 4 }}>
                {machine.arus} <span style={{ fontSize: '0.75rem' }}>A</span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.65rem' }}>Ambang batas aman: &lt; 1.20 A</span>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2. SUHU OBJEK (MLX90614)</div>
              <div className="mono font-bold" style={{ fontSize: '1.2rem', color: machine.suhu > 45 ? 'var(--status-kritis)' : 'var(--accent-orange)', marginTop: 4 }}>
                {machine.suhu} <span style={{ fontSize: '0.75rem' }}>°C</span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.65rem' }}>Ambang batas aman: &lt; 45.0 °C</span>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3. PUTARAN MOTOR (RPM)</div>
              <div className="mono font-bold" style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', marginTop: 4 }}>
                {machine.rpm} <span style={{ fontSize: '0.75rem' }}>RPM</span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.65rem' }}>Status Motor: {machine.rpm > 0 ? 'Berputar' : 'Berhenti (0 RPM)'}</span>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>4. GETARAN RMS (MPU9250)</div>
              <div className="mono font-bold" style={{ fontSize: '1.2rem', color: machine.getaran > 7.0 ? 'var(--status-kritis)' : 'inherit', marginTop: 4 }}>
                {machine.getaran} <span style={{ fontSize: '0.75rem' }}>RMS</span>
              </div>
              <span className="text-muted" style={{ fontSize: '0.65rem' }}>Ambang batas aman: &lt; 4.50 RMS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis (RCA) & AI Explainability */}
      <div className="dashboard-grid dashboard-grid-2" style={{ marginTop: 16 }}>
        {/* RCA Diagnostics */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Wrench size={16} className="card-icon" /> Root Cause Analysis (RCA) Diagnostik</div>
          </div>
          <div className="card-body">
            <div className="event-timeline">
              {machine.getaran > 7.0 && (
                <div className="event-item">
                  <div className="event-time mono">LIVE</div>
                  <div className="event-dot critical" />
                  <div className="event-message">
                    <strong>Getaran Kritis Terdeteksi ({machine.getaran} RMS):</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <em>RCA Finding:</em> Nilai getaran sumbu MPU-9250 melampaui batas toleransi 4.50 RMS. Kemungkinan ketidaksejajaran poros (misalignment) atau kerusakan bantalan (bearing degradation).
                    </p>
                    <span className="mono" style={{ color: 'var(--status-kritis)', fontSize: '0.68rem', fontWeight: 700 }}>
                      Rekomendasi: Interlock aktif (PWM 0). Lakukan pelumasan dan inspeksi mekanis.
                    </span>
                  </div>
                </div>
              )}

              {machine.suhu > 45.0 && (
                <div className="event-item">
                  <div className="event-time mono">LIVE</div>
                  <div className="event-dot warning" />
                  <div className="event-message">
                    <strong>Peningkatan Suhu Motor ({machine.suhu} °C):</strong>
                    <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <em>RCA Finding:</em> Sensor inframerah MLX90614 membaca suhu di atas nominal kerja 42 °C.
                    </p>
                    <span className="mono" style={{ color: 'var(--status-waspada)', fontSize: '0.68rem', fontWeight: 700 }}>
                      Rekomendasi: Periksa aliran udara pendingin motor fan.
                    </span>
                  </div>
                </div>
              )}

              <div className="event-item">
                <div className="event-time mono">HISTORIS</div>
                <div className="event-dot info" />
                <div className="event-message">
                  <strong>Baseline Sensor Kalibrasi:</strong>
                  <p style={{ margin: '4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ACS712 Current Sensor Zero-point: 1.65V (Terkalibrasi OK).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Sensitivity Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Sensitivitas Lokal AI (Explainable AI)</div>
            <span className="card-badge mono">MANDOR AI</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Uji sensitivitas lokal dari model MANDOR AI menunjukkan bagaimana variasi fitur mempengaruhi klasifikasi kondisi:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mandorAI.sensitivity.map((s, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s.feature}</span>
                    <div className="mono text-xs text-muted" style={{ marginTop: 2 }}>Rentang Variasi: {s.range}</div>
                  </div>
                  <span className={`status-badge ${s.impact.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                    {s.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
