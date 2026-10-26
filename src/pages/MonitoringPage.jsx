import React, { useState, useEffect } from 'react';
import useFactoryStore from '../store/factoryStore';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Gauge, AlertTriangle, AlertOctagon, CheckCircle2,
  Cpu, Wrench, ShieldAlert, ArrowRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';

function MachineSelector() {
  const machines = useFactoryStore(s => s.machines);
  const selectedMachineId = useFactoryStore(s => s.selectedMachineId);
  const setSelectedMachineId = useFactoryStore(s => s.setSelectedMachineId);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Monitoring Telemetri 3 Mesin</h2>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            MULTI-NODE SENSOR MONITORING & ASSET HEALTH
          </span>
        </div>
        <span className="card-badge mono" style={{ background: 'var(--status-normal-bg)', color: 'var(--status-normal)', border: '1px solid var(--status-normal-border)' }}>
          ● 3 MESIN AKTIF ONLINE
        </span>
      </div>

      {/* 3 Machine Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {machines.map(m => {
          const isSelected = m.id === selectedMachineId;
          const statusBg = m.status === 'KRITIS' ? 'var(--status-kritis-bg)' :
            m.status === 'WASPADA' ? 'var(--status-waspada-bg)' : 'var(--status-normal-bg)';
          const statusBorder = m.status === 'KRITIS' ? 'var(--status-kritis)' :
            m.status === 'WASPADA' ? 'var(--status-waspada)' : 'var(--status-normal)';

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              style={{
                cursor: 'pointer',
                background: isSelected ? 'var(--bg-secondary)' : 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: isSelected ? `2px solid var(--accent-orange)` : '1px solid var(--border-light)',
                boxShadow: isSelected ? '0 4px 14px rgba(255, 106, 0, 0.12)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: -10, right: 16,
                  background: 'var(--accent-orange)', color: '#fff',
                  fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  AKTIF DITAMPILKAN
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div className="mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {m.id}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: 2 }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {m.tag}
                  </div>
                </div>

                <span className={`status-badge ${m.status.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                  <span className="badge-dot" /> {m.status}
                </span>
              </div>

              {/* Quick telemetry pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>PUTARAN</div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {m.rpm.toLocaleString('id-ID')} <span style={{ fontSize: '0.6rem' }}>RPM</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SUHU</div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: m.suhu > 55 ? 'var(--status-kritis)' : m.suhu > 45 ? 'var(--status-waspada)' : 'inherit' }}>
                    {m.suhu} <span style={{ fontSize: '0.6rem' }}>°C</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>BEBAN</div>
                  <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {m.motor_load}%
                  </div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div style={{ marginTop: 8 }}>
                <div className="progress-bar" style={{ height: 4 }}>
                  <div
                    className={`progress-fill ${m.motor_load > 90 ? 'kritis' : m.motor_load > 80 ? 'orange' : 'cyan'}`}
                    style={{ width: `${Math.min(100, m.motor_load)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectedMachineDetails({ machine }) {
  const params = [
    { label: 'Kecepatan Putaran', value: machine.rpm.toLocaleString('id-ID'), unit: 'RPM', color: 'var(--accent-orange)', sub: `Nominal: ${machine.nominalRpm} RPM` },
    { label: 'Arus Listrik Motor', value: machine.arus, unit: 'A', color: 'var(--accent-blue)', sub: `Nominal Max: ${machine.nominalArus} A` },
    { label: 'Getaran Sumbu (Vibration)', value: machine.getaran, unit: 'mm/s', color: 'var(--accent-cyan)', sub: `Batas Aman: < ${machine.maxGetaran} mm/s` },
    { label: 'Suhu Operasional', value: machine.suhu, unit: '°C', color: 'var(--accent-orange)', sub: `Maksimum: ${machine.maxSuhu} °C` },
    { label: 'Beban Motor (Load)', value: machine.motor_load, unit: '%', color: 'var(--accent-blue)', sub: `Daya: ${machine.powerKw} kW` },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Machine Profile Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-cyan-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Cpu size={20} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {machine.id} - {machine.name}
            </div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
              {machine.spec} | Lokasi: {machine.location}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>HEALTH SCORE</div>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--status-normal)' }}>
              {machine.healthScore}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>JAM OPERASI</div>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {machine.operatingHours} Jam
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>SERVIS TERAKHIR</div>
            <div className="mono" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {machine.lastMaintenance}
            </div>
          </div>
          <span className={`status-badge ${machine.status.toLowerCase()}`}>
            <span className="badge-dot" /> {machine.status}
          </span>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {params.map(p => (
          <div key={p.label} className="metric-card" style={{ borderLeft: `3px solid ${p.color}`, padding: '14px' }}>
            <div className="metric-label">{p.label}</div>
            <div className="metric-value">
              {p.value}<span className="metric-unit">{p.unit}</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              {p.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParameterChart({ dataKey, label, color, data, unit = '' }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{label}</span>
        <span className="card-badge mono" style={{ background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan-border)' }}>
          LIVE
        </span>
      </div>
      <div className="card-body">
        <div className="chart-container" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E5" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} interval={4} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} unit={unit ? ` ${unit}` : ''} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', borderRadius: 4 }} />
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={1.8} dot={false} name={label} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Comparative Matrix Table for 3 Machines
function MachineComparisonTable({ machines, onSelectMachine, selectedId }) {
  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={16} color="var(--accent-blue)" />
          <span className="card-title">Matriks Perbandingan Real-Time (3 Mesin)</span>
        </div>
        <span className="card-badge mono" style={{ background: 'var(--bg-tertiary)' }}>
          ISO 10816 VIBRATION & THERMAL BENCHMARK
        </span>
      </div>
      <div className="card-body" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Mesin</th>
              <th>Nama Mesin & Peruntukan</th>
              <th>Status</th>
              <th>Putaran (RPM)</th>
              <th>Arus (A)</th>
              <th>Getaran (mm/s)</th>
              <th>Suhu (°C)</th>
              <th>Beban (%)</th>
              <th>Health Score</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {machines.map(m => {
              const isSelected = m.id === selectedId;
              return (
                <tr key={m.id} style={{ background: isSelected ? 'var(--accent-orange-bg)' : 'transparent' }}>
                  <td className="mono fw-600" style={{ color: 'var(--accent-blue)' }}>{m.id}</td>
                  <td>
                    <strong>{m.name}</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{m.spec}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${m.status.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                      <span className="badge-dot" /> {m.status}
                    </span>
                  </td>
                  <td className="mono">{m.rpm.toLocaleString('id-ID')} RPM</td>
                  <td className="mono">{m.arus} A</td>
                  <td className="mono" style={{ color: m.getaran > 4.5 ? 'var(--status-kritis)' : m.getaran > 2.8 ? 'var(--status-waspada)' : 'inherit' }}>
                    {m.getaran} mm/s
                  </td>
                  <td className="mono" style={{ color: m.suhu > 55 ? 'var(--status-kritis)' : m.suhu > 45 ? 'var(--status-waspada)' : 'inherit' }}>
                    {m.suhu} °C
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono">{m.motor_load}%</span>
                      <div className="progress-bar" style={{ width: 50, height: 5 }}>
                        <div
                          className={`progress-fill ${m.motor_load > 85 ? 'kritis' : m.motor_load > 70 ? 'orange' : 'cyan'}`}
                          style={{ width: `${m.motor_load}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="mono fw-600" style={{ color: 'var(--status-normal)' }}>{m.healthScore}%</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectMachine(m.id)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.7rem',
                        borderColor: isSelected ? 'var(--accent-orange)' : 'var(--border-medium)',
                        color: isSelected ? 'var(--accent-orange)' : 'inherit'
                      }}
                    >
                      {isSelected ? 'Sedang Dipilih' : 'Inspeksi Mesin'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MLAnalysisPanel({ machine }) {
  const currentObject = useFactoryStore(s => s.currentObject);
  const mlResult = useFactoryStore(s => s.mlResult);
  const mandorAI = useFactoryStore(s => s.mandorAI);

  const isMtr01 = machine.id === 'MTR-01';
  const reasoning = isMtr01
    ? mlResult.reasoning
    : machine.id === 'MTR-02'
    ? (machine.status === 'WASPADA'
        ? 'Beban feed hopper meningkat akibat variasi densitas material. Arus 1.62A mendekati batas ambang 1.65A.'
        : 'Sistem pengumpanan material (Feeder & Crusher) berjalan dalam toleransi normal tanpa hambatan mechanical.')
    : (machine.status === 'WASPADA'
        ? 'Aliran udara blower terhambat ringan pada filter extraction duct. Getaran berada pada 2.2 mm/s.'
        : 'Sistem sirkulasi pendingin dan exhaust beroperasi optimal pada 2.850 RPM tanpa anomali.');

  const confidence = isMtr01 ? (mlResult.confidence || 100.0) : 94.6;
  const pwmValue = isMtr01 ? (machine.pwm ?? (machine.status === 'KRITIS' ? 0 : machine.status === 'WASPADA' ? 220 : 255)) : (machine.status === 'KRITIS' ? 0 : 255);

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="card-title">
          <span className="card-icon">🧠</span> MANDOR AI — Google Coral Edge TPU & Machine Diagnostics ({machine.id})
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="card-badge mono" style={{ background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)' }}>
            model_mandor_quant.tflite
          </span>
          <span className="card-badge mono" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)' }}>
            PWM: {pwmValue}
          </span>
        </div>
      </div>
      <div className="card-body">
        {/* 4 Input features matching MANDOR AI */}
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span>Fitur Masukan Sensor AI (4 Fitur Mandor AI)</span>
          <span className="mono text-muted text-xs">Topic: mesin/monitoring/data</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>1. ARUS (ACS712)</div>
            <div className="mono font-bold" style={{ fontSize: '1rem', color: 'var(--accent-blue)', marginTop: 2 }}>
              {machine.arus} <span style={{ fontSize: '0.7rem' }}>A</span>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2. SUHU (MLX90614)</div>
            <div className="mono font-bold" style={{ fontSize: '1rem', color: machine.suhu > 45 ? 'var(--status-kritis)' : 'var(--accent-orange)', marginTop: 2 }}>
              {machine.suhu} <span style={{ fontSize: '0.7rem' }}>°C</span>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>3. KECEPATAN (RPM)</div>
            <div className="mono font-bold" style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginTop: 2 }}>
              {machine.rpm} <span style={{ fontSize: '0.7rem' }}>RPM</span>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>4. GETARAN (MPU9250)</div>
            <div className="mono font-bold" style={{ fontSize: '1rem', color: machine.getaran > 7 ? 'var(--status-kritis)' : 'inherit', marginTop: 2 }}>
              {machine.getaran} <span style={{ fontSize: '0.7rem' }}>RMS</span>
            </div>
          </div>
        </div>

        {/* Result banner */}
        <div style={{
          padding: 16, borderRadius: 'var(--radius-md)',
          background: machine.status === 'KRITIS' ? 'var(--status-kritis-bg)' :
            machine.status === 'WASPADA' ? 'var(--status-waspada-bg)' : 'var(--status-normal-bg)',
          border: `1px solid ${machine.status === 'KRITIS' ? 'var(--status-kritis-border)' :
            machine.status === 'WASPADA' ? 'var(--status-waspada-border)' : 'var(--status-normal-border)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`status-badge ${machine.status.toLowerCase()}`} style={{ fontSize: '0.85rem', padding: '4px 14px' }}>
                <span className="badge-dot" /> AI STATUS: {machine.status}
              </span>
              <span className="card-badge mono" style={{ background: '#fff', border: '1px solid var(--border-light)', fontWeight: 700 }}>
                MOTOR COMMAND: PWM {pwmValue}
              </span>
            </div>
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Confidence: {confidence}% (Local Inference)
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {reasoning}
          </p>
        </div>

        {/* AI EXPLAINABILITY & LOCAL SENSITIVITY (Real from MANDOR AI) */}
        {isMtr01 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              AI EXPLAINABILITY & LOCAL SENSITIVITY ANALYSIS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {mandorAI.sensitivity.map((s, idx) => (
                <div key={idx} style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 4, border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.feature}</div>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.range}</div>
                  <div className="mono font-bold" style={{ fontSize: '0.72rem', color: s.impact === 'KRITIS' ? 'var(--status-kritis)' : 'var(--status-normal)', marginTop: 4 }}>
                    ➔ {s.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClosedLoopSection({ machine }) {
  const conveyorRunning = useFactoryStore(s => s.conveyorRunning);

  const steps = [
    { label: 'DETECT', sub: `${machine.id} Telemetri`, active: true },
    { label: 'ANALYZE', sub: 'Evaluasi Frekuensi', active: true },
    { label: 'DECIDE', sub: machine.status, active: true },
    { label: 'ACT', sub: machine.status === 'KRITIS' ? 'Interlock Aktif' : machine.status === 'WASPADA' ? 'Penyesuaian VFD' : 'Operasi Stabil', active: machine.status !== 'NORMAL' },
    { label: 'FEEDBACK', sub: conveyorRunning ? 'Lini Berjalan' : 'Siaga Reset', active: true },
  ];

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header">
        <span className="card-title">
          <span className="card-icon">↻</span> Closed-Loop Automation & Safety Interlock ({machine.id})
        </span>
      </div>
      <div className="card-body">
        <div className="closed-loop-flow">
          {steps.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className={`loop-step ${s.active ? 'active' : ''}`}>
                <span className="loop-step-label">{s.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{s.sub}</span>
              </div>
              {i < steps.length - 1 && <span className="loop-arrow">→</span>}
            </React.Fragment>
          ))}
        </div>

        {machine.status === 'WASPADA' && (
          <div className="warning-banner" style={{ margin: '14px 0 0' }}>
            <span className="banner-text" style={{ fontSize: '0.78rem' }}>
              Proteksi Aktif: VFD mengatur kecepatan dan beban pada {machine.id} untuk mencegah overheating.
            </span>
          </div>
        )}
        {machine.status === 'KRITIS' && (
          <div className="critical-banner" style={{ margin: '14px 0 0' }}>
            <span className="banner-text" style={{ fontSize: '0.78rem' }}>
              SAFETY INTERLOCK: {machine.id} dihentikan secara darurat. Mohon periksa getaran mekanis dan beban kelistrikan.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MonitoringPage() {
  const machines = useFactoryStore(s => s.machines);
  const selectedMachineId = useFactoryStore(s => s.selectedMachineId);
  const setSelectedMachineId = useFactoryStore(s => s.setSelectedMachineId);
  const getTimeSeriesData = useFactoryStore(s => s.getTimeSeriesData);
  const simulationPlaying = useFactoryStore(s => s.simulationPlaying);
  const simulationSpeed = useFactoryStore(s => s.simulationSpeed);

  const activeMachine = machines.find(m => m.id === selectedMachineId) || machines[0];
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getTimeSeriesData(selectedMachineId));
  }, [selectedMachineId, activeMachine?.timestamp, getTimeSeriesData]);

  useEffect(() => {
    if (!simulationPlaying) return;
    const intervalMs = Math.round(2000 / simulationSpeed);
    const iv = setInterval(() => {
      setData(getTimeSeriesData(selectedMachineId));
    }, intervalMs);
    return () => clearInterval(iv);
  }, [selectedMachineId, simulationPlaying, simulationSpeed, getTimeSeriesData]);

  return (
    <div>
      {/* 3 Machine Selector */}
      <MachineSelector />

      {/* Selected Machine Telemetry KPI Cards */}
      <SelectedMachineDetails machine={activeMachine} />

      {/* 4 Live Telemetry Area Charts (2x2) */}
      <div className="dashboard-grid dashboard-grid-2">
        <ParameterChart dataKey="suhu" label={`Tren Suhu ${activeMachine.id} (°C)`} color="#FF6A00" data={data} unit="°C" />
        <ParameterChart dataKey="getaran" label={`Tren Getaran ${activeMachine.id} (mm/s)`} color="#0DB9D7" data={data} unit="mm/s" />
      </div>

      <div className="dashboard-grid dashboard-grid-2" style={{ marginTop: 16 }}>
        <ParameterChart dataKey="arus" label={`Tren Arus ${activeMachine.id} (A)`} color="#246BCE" data={data} unit="A" />
        <ParameterChart dataKey="rpm" label={`Tren Kecepatan Putaran ${activeMachine.id} (RPM)`} color="#FF6A00" data={data} unit="RPM" />
      </div>

      {/* 3 Machine Comparative Matrix */}
      <MachineComparisonTable
        machines={machines}
        onSelectMachine={setSelectedMachineId}
        selectedId={selectedMachineId}
      />

      {/* AI Machine Analysis & Diagnostics */}
      <MLAnalysisPanel machine={activeMachine} />

      {/* Closed-Loop Safety Flow */}
      <ClosedLoopSection machine={activeMachine} />
    </div>
  );
}
