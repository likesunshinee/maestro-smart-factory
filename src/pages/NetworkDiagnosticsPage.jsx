import React from 'react';
import { Wifi, Activity, AlertCircle, ArrowDownUp, CheckCircle, Radio } from 'lucide-react';
import { useDataProvider } from '../store/DataProviderContext';
import useFactoryStore from '../store/factoryStore';

export default function NetworkDiagnosticsPage() {
  const { mode, mqttStatus, packetCount, latency, brokerUrl, topicMonitor, topicControl, lastPacket } = useDataProvider();
  const events = useFactoryStore(s => s.events);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Network Diagnostics & MQTT Stream</h2>
          <span className="mono text-muted text-xs">Real-Time Telemetry Traffic & Broker Health</span>
        </div>
        <span className={`status-badge ${mode === 'CONNECTED' ? (mqttStatus === 'CONNECTED' ? 'normal' : 'waspada') : 'info'}`}>
          <span className="badge-dot" /> {mode === 'CONNECTED' ? `MQTT: ${mqttStatus}` : 'MODE: STANDALONE DEMO'}
        </span>
      </div>
      
      <div className="metric-grid">
        <div className="metric-card accent-blue">
          <div className="metric-label">Latensi WebSocket / MQTT</div>
          <div className="metric-value">{latency}<span className="metric-unit"> ms</span></div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Broker: broker.emqx.io (Port 8084 WSS)
          </div>
        </div>
        <div className="metric-card accent-green">
          <div className="metric-label">Paket ESP32 Diterima</div>
          <div className="metric-value">{packetCount}<span className="metric-unit"> pkt</span></div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Topic: {topicMonitor}
          </div>
        </div>
        <div className="metric-card accent-cyan">
          <div className="metric-label">Node IoT Terhubung</div>
          <div className="metric-value">{mode === 'CONNECTED' && mqttStatus === 'CONNECTED' ? '1' : '0'}<span className="metric-unit"> / 1 (ESP32)</span></div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
            Status: {lastPacket ? 'Streaming Aktif' : 'Menunggu Handshake'}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div className="card-title">
            <Wifi size={16} className="card-icon" /> 
            Status Alur Data Real-Time (ESP32 ⟷ EMQX ⟷ Web)
          </div>
          <span className="card-badge mono">MQTT PUB/SUB</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>1. SENSOR & ESP32</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 4 }}>Port TCP 1883</div>
              <div className="mono text-xs text-muted" style={{ marginTop: 2 }}>{topicMonitor}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>2. MQTT BROKER</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 4 }}>broker.emqx.io</div>
              <div className="mono text-xs text-muted" style={{ marginTop: 2 }}>Bridge TCP ↔ WSS</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>3. MAESTRO DASHBOARD</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: 4 }}>Port WSS 8084</div>
              <div className="mono text-xs text-muted" style={{ marginTop: 2 }}>Subscription Aktif</div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Log Transmisi Jaringan & Sistem
          </div>
          <div className="event-timeline" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {events.filter(e => e.type === 'MQTT' || e.type === 'Sistem').slice(0, 8).map((evt, idx) => (
              <div key={idx} className="event-item">
                <div className="event-time mono">{evt.time}</div>
                <div className={`event-dot ${evt.severity || 'info'}`} />
                <div className="event-message">{evt.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
