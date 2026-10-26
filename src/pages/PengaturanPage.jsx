import React, { useState } from 'react';
import useFactoryStore from '../store/factoryStore';
import { useDataProvider } from '../store/DataProviderContext';
import { Wifi, Send, CheckCircle2, AlertTriangle, AlertOctagon, Sliders, RefreshCw } from 'lucide-react';

export default function PengaturanPage() {
  const auth = useFactoryStore(s => s.auth);
  const {
    mode, toggleMode,
    brokerUrl, setBrokerUrl,
    topicMonitor, setTopicMonitor,
    topicControl, setTopicControl,
    mqttStatus, lastPacket, packetCount, latency,
    publishControlCommand
  } = useDataProvider();

  const [inputBroker, setInputBroker] = useState(brokerUrl);
  const [inputTopicMon, setInputTopicMon] = useState(topicMonitor);
  const [inputTopicCtrl, setInputTopicCtrl] = useState(topicControl);
  const [customPwm, setCustomPwm] = useState(255);
  const [saveMsg, setSaveMsg] = useState('');

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setBrokerUrl(inputBroker);
    setTopicMonitor(inputTopicMon);
    setTopicControl(inputTopicCtrl);
    setSaveMsg('Konfigurasi MQTT berhasil diperbarui!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSendCommand = (status, pwm) => {
    publishControlCommand(status, pwm);
  };

  const getStatusBadge = () => {
    if (mode === 'STANDALONE_DEMO') {
      return (
        <span className="status-badge" style={{ background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)' }}>
          <span className="badge-dot" style={{ background: 'var(--accent-cyan)' }} /> STANDALONE DEMO
        </span>
      );
    }
    if (mqttStatus === 'CONNECTED') {
      return (
        <span className="status-badge normal">
          <span className="badge-dot" /> TERHUBUNG (LIVE WSS)
        </span>
      );
    }
    if (mqttStatus === 'CONNECTING') {
      return (
        <span className="status-badge waspada">
          <span className="badge-dot" /> MENGHUBUNGKAN...
        </span>
      );
    }
    return (
      <span className="status-badge kritis">
        <span className="badge-dot" /> TERPUTUS / ERROR
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Pengaturan Sistem & Koneksi MQTT</h2>
          <span className="mono text-muted text-xs">MAESTRO Hardware & IoT Broker Integration</span>
        </div>
        <button
          className="btn btn-sm"
          onClick={toggleMode}
          style={{
            background: mode === 'CONNECTED' ? 'var(--status-normal-bg)' : 'var(--bg-secondary)',
            borderColor: mode === 'CONNECTED' ? 'var(--status-normal)' : 'var(--border-light)',
            color: mode === 'CONNECTED' ? 'var(--status-normal)' : 'var(--text-primary)',
          }}
        >
          Mode: {mode === 'CONNECTED' ? 'CONNECTED (LIVE)' : 'STANDALONE DEMO'}
        </button>
      </div>

      <div className="dashboard-grid dashboard-grid-2">
        {/* Status Hardware & ESP32 */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Koneksi Hardware & ESP32</span>
            {getStatusBadge()}
          </div>
          <div className="card-body">
            <div className="inspection-panel">
              <div className="inspection-row">
                <span className="inspection-label">MQTT Broker (Web WSS)</span>
                <span className="inspection-value text-muted mono" style={{ fontSize: '0.75rem' }}>
                  {brokerUrl}
                </span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">MQTT Broker (ESP32 TCP)</span>
                <span className="inspection-value text-muted mono">tcp://broker.emqx.io:1883</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Topic Telemetri Sensor</span>
                <span className="inspection-value mono text-cyan">{topicMonitor}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Topic Kontrol Perintah</span>
                <span className="inspection-value mono text-orange">{topicControl}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Paket Data ESP32 Diterima</span>
                <span className="inspection-value mono font-bold">
                  {packetCount > 0 ? `${packetCount} paket` : (mode === 'CONNECTED' ? 'Menunggu data...' : '0 paket (Demo mode)')}
                </span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Latensi Jaringan</span>
                <span className="inspection-value mono">{latency} ms</span>
              </div>
            </div>

            {/* Live Packet Telemetry Preview */}
            {lastPacket && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>TELEMETRI TERAKHIR DARI ESP32</span>
                  <span className="mono">{lastPacket.timestamp}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>ARUS</span>
                    <div className="mono font-bold" style={{ fontSize: '0.85rem' }}>{lastPacket.arus} A</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>SUHU</span>
                    <div className="mono font-bold" style={{ fontSize: '0.85rem' }}>{lastPacket.suhu} °C</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>KECEPATAN</span>
                    <div className="mono font-bold" style={{ fontSize: '0.85rem' }}>{lastPacket.rpm} RPM</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>GETARAN</span>
                    <div className="mono font-bold" style={{ fontSize: '0.85rem' }}>{lastPacket.getaran}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-16 text-xs text-muted" style={{ lineHeight: 1.6 }}>
              {mode === 'CONNECTED' ? (
                <span style={{ color: 'var(--status-normal)' }}>
                  ✓ Web mendengarkan data real-time dari ESP32 via WebSocket EMQX broker. Nilai sensor langsung memperbarui MTR-01 dan Digital Twin.
                </span>
              ) : (
                <span>
                  Saat ini berjalan di <em>Standalone Demo</em>. Klik tombol mode di atas atau di navbar untuk beralih ke koneksi live MQTT.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live ESP32 Control Tester (Closed Loop) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Kirim Perintah ke ESP32 (Closed-Loop)</span>
            <span className="card-badge mono" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)' }}>
              TOPIC: {topicControl}
            </span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Kirim sinyal perintah kendali ke ESP32 secara real-time. ESP32 akan menerima perintah pada <code>{topicControl}</code> dan mengatur PWM motor driver.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--status-normal-bg)', color: 'var(--status-normal)', borderColor: 'var(--status-normal)' }}
                  onClick={() => handleSendCommand('NORMAL', 255)}
                >
                  <CheckCircle2 size={14} style={{ marginRight: 4 }} /> NORMAL (255)
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--status-waspada-bg)', color: 'var(--status-waspada)', borderColor: 'var(--status-waspada)' }}
                  onClick={() => handleSendCommand('WARNING', 130)}
                >
                  <AlertTriangle size={14} style={{ marginRight: 4 }} /> WARNING (130)
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--status-kritis-bg)', color: 'var(--status-kritis)', borderColor: 'var(--status-kritis)' }}
                  onClick={() => handleSendCommand('KRITIS', 0)}
                >
                  <AlertOctagon size={14} style={{ marginRight: 4 }} /> STOP / 0 PWM
                </button>
              </div>

              {/* Custom PWM Slider */}
              <div style={{ marginTop: 12, padding: 14, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Custom Speed PWM (0 - 255)</span>
                  <span className="mono font-bold" style={{ color: 'var(--accent-orange)', fontSize: '0.9rem' }}>{customPwm}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={customPwm}
                  onChange={(e) => setCustomPwm(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 10, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                  onClick={() => handleSendCommand(customPwm === 0 ? 'KRITIS' : customPwm < 150 ? 'WARNING' : 'NORMAL', customPwm)}
                >
                  <Send size={14} /> Kirim Nilai PWM {customPwm} ke ESP32
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Konfigurasi MQTT Broker */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Konfigurasi Endpoint MQTT</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSaveConfig}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                  Broker WebSocket URL
                </label>
                <input
                  type="text"
                  value={inputBroker}
                  onChange={(e) => setInputBroker(e.target.value)}
                  placeholder="wss://broker.emqx.io:8084/mqtt"
                  className="mono text-xs"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}
                />
                <span className="text-muted" style={{ fontSize: '0.65rem' }}>Gunakan port WSS (8084) untuk browser web.</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                  Topic Telemetri Sensor (ESP32 Publish)
                </label>
                <input
                  type="text"
                  value={inputTopicMon}
                  onChange={(e) => setInputTopicMon(e.target.value)}
                  className="mono text-xs"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>
                  Topic Kontrol Perintah (ESP32 Subscribe)
                </label>
                <input
                  type="text"
                  value={inputTopicCtrl}
                  onChange={(e) => setInputTopicCtrl(e.target.value)}
                  className="mono text-xs"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 4, border: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}
                />
              </div>

              {saveMsg && (
                <div style={{ color: 'var(--status-normal)', fontSize: '0.75rem', marginBottom: 10, fontWeight: 600 }}>
                  ✓ {saveMsg}
                </div>
              )}

              <button type="submit" className="btn btn-outline btn-sm">
                Simpan & Sambungkan Ulang
              </button>
            </form>
          </div>
        </div>

        {/* Sesi & Pengguna */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Informasi Sesi & Sistem</span>
          </div>
          <div className="card-body">
            <div className="inspection-panel">
              <div className="inspection-row">
                <span className="inspection-label">User Aktif</span>
                <span className="inspection-value">{auth.username}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Role Akses</span>
                <span className="inspection-value mono" style={{ color: 'var(--accent-orange)' }}>{auth.role}</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Versi MAESTRO</span>
                <span className="inspection-value mono">v1.1.0 (Live MQTT Edition)</span>
              </div>
              <div className="inspection-row">
                <span className="inspection-label">Hardware Controller</span>
                <span className="inspection-value mono">ESP32 + Coral / Python</span>
              </div>
            </div>

            <div className="mt-16 text-xs text-muted" style={{ lineHeight: 1.6 }}>
              Role <span className="mono">OPERATOR</span> terbatas pada monitoring dan kendali produksi. Role <span className="mono">SUPERVISOR</span> memiliki akses penuh ke MES, ERP, serta konfigurasi telemetri lanjut.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
