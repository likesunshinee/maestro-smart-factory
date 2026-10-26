import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useFactoryStore from '../store/factoryStore';

function ConveyorHero() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let beltOffset = 0;
    let objectX = -60;

    const W = 560;
    const H = 380;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(2, 2);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid background
      ctx.strokeStyle = 'rgba(22,32,34,0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Conveyor frame
      const cy = 240;
      const ch = 50;
      ctx.fillStyle = '#CBD5D1';
      ctx.fillRect(40, cy, W - 80, ch);

      // Belt lines
      ctx.strokeStyle = '#A3B3AE';
      ctx.lineWidth = 1;
      for (let x = 40 + (beltOffset % 16); x < W - 40; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + ch); ctx.stroke();
      }

      // Support legs
      ctx.fillStyle = '#9AABAF';
      ctx.fillRect(60, cy + ch, 8, 60);
      ctx.fillRect(W - 68, cy + ch, 8, 60);
      ctx.fillRect(W / 2 - 4, cy + ch, 8, 60);

      // Rollers
      ctx.fillStyle = '#7A8F93';
      [60, W / 2, W - 68].forEach(x => {
        ctx.beginPath(); ctx.arc(x + 4, cy + ch, 6, 0, Math.PI * 2); ctx.fill();
      });

      // Motor
      ctx.fillStyle = '#4A5D60';
      ctx.fillRect(45, cy + ch + 10, 30, 25);
      ctx.fillStyle = '#FF6A00';
      ctx.beginPath(); ctx.arc(60, cy + ch + 22, 5, 0, Math.PI * 2); ctx.fill();
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#7A8F93';
      ctx.fillText('MOTOR-01', 42, cy + ch + 50);

      // Object on conveyor
      const objW = 50, objH = 35;
      const objY = cy - objH;
      ctx.fillStyle = 'rgba(255,106,0,0.15)';
      ctx.strokeStyle = 'rgba(255,106,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.fillRect(objectX, objY, objW, objH);
      ctx.strokeRect(objectX, objY, objW, objH);

      // Object label
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#FF6A00';
      ctx.fillText('BALOK KECIL', objectX, objY - 14);
      ctx.fillStyle = '#7A8F93';
      ctx.fillText('100 × 60 × 40 mm', objectX, objY - 5);

      // Camera
      const camX = 320, camY = 150;
      ctx.fillStyle = '#246BCE';
      ctx.fillRect(camX, camY, 24, 18);
      ctx.fillStyle = '#0DB9D7';
      ctx.beginPath(); ctx.arc(camX + 12, camY + 9, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#246BCE';
      ctx.lineWidth = 1;
      ctx.fillRect(camX + 8, camY + 18, 8, 20);
      ctx.font = '7px JetBrains Mono, monospace';
      ctx.fillStyle = '#246BCE';
      ctx.fillText('CAM-01', camX - 2, camY - 4);

      // Vision cone
      ctx.strokeStyle = 'rgba(13,185,215,0.2)';
      ctx.fillStyle = 'rgba(13,185,215,0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(camX + 12, camY + 18);
      ctx.lineTo(camX - 30, cy);
      ctx.lineTo(camX + 54, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inspection zone label
      ctx.font = '7px JetBrains Mono, monospace';
      ctx.fillStyle = '#0DB9D7';
      ctx.fillText('INSPECTION ZONE', camX - 28, cy + ch + 16);

      // Sensor markers
      [{ x: 160, label: 'SENSOR-01' }, { x: 420, label: 'SENSOR-02' }].forEach(s => {
        ctx.fillStyle = '#0DB9D7';
        ctx.beginPath(); ctx.arc(s.x, cy - 8, 3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(13,185,215,0.3)';
        ctx.beginPath(); ctx.arc(s.x, cy - 8, 8, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '6px JetBrains Mono, monospace';
        ctx.fillStyle = '#7A8F93';
        ctx.fillText(s.label, s.x - 18, cy - 18);
      });

      // Data sync lines
      ctx.strokeStyle = 'rgba(13,185,215,0.15)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      // From camera to cloud label
      ctx.beginPath(); ctx.moveTo(camX + 12, camY); ctx.lineTo(camX + 12, 60); ctx.stroke();
      // From sensor to label
      ctx.beginPath(); ctx.moveTo(160, cy - 16); ctx.lineTo(160, 80); ctx.stroke();
      ctx.setLineDash([]);

      // Data labels
      ctx.font = '7px JetBrains Mono, monospace';
      ctx.fillStyle = '#0DB9D7';
      ctx.fillText('→ MQTT / DATA STREAM', 170, 70);
      ctx.fillText('→ VISION / ML', camX + 20, 55);

      // Status indicators
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#22C55E';
      ctx.beginPath(); ctx.arc(W - 110, 24, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('ONLINE', W - 100, 27);

      ctx.fillStyle = '#0DB9D7';
      ctx.beginPath(); ctx.arc(W - 110, 40, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillText('DT SYNC', W - 100, 43);

      // Title
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillStyle = '#4A5D60';
      ctx.fillText('CONVEYOR-01 / DIGITAL TWIN PREVIEW', 40, 20);

      // Animate
      beltOffset += 0.8;
      objectX += 0.4;
      if (objectX > W) objectX = -60;

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', maxWidth: 560, display: 'block' }} />;
}

function FactoryTopology() {
  const [activeNode, setActiveNode] = useState(null);
  const machine = useFactoryStore(s => s.machine);

  const nodes = [
    { id: 'RAW', name: 'Raw Material', sub: 'WAREHOUSE-01', status: 'Tersedia' },
    { id: 'CONV', name: 'Conveyor', sub: 'CONVEYOR-01', status: 'Berjalan' },
    { id: 'VISION', name: 'Vision Inspection', sub: 'CAM-01', status: 'Online' },
    { id: 'ML', name: 'ML Analysis', sub: 'ML-ENGINE-01', status: 'Aktif' },
    { id: 'PROD', name: 'Production', sub: 'LINE-01', status: 'Berjalan' },
    { id: 'WH', name: 'Warehouse', sub: 'WAREHOUSE-02', status: 'Tersedia' },
  ];

  const machineInfo = {
    CONV: { fields: [
      { label: 'Status', value: machine.status },
      { label: 'Kecepatan', value: `${machine.rpm.toLocaleString('id-ID')} RPM` },
      { label: 'Suhu', value: `${machine.suhu} °C` },
      { label: 'Getaran', value: `${machine.getaran} mm/s` },
      { label: 'Arus', value: `${machine.arus} A` },
      { label: 'Load', value: `${machine.motor_load}%` },
    ]},
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {nodes.map((node, i) => (
          <React.Fragment key={node.id}>
            <div
              className={`topology-node ${activeNode === node.id ? 'active' : ''}`}
              onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
            >
              <span className="topology-node-id">{node.sub}</span>
              <span className="topology-node-name">{node.name}</span>
              <span className="topology-node-status" style={{ color: 'var(--status-normal)' }}>● {node.status}</span>
            </div>
            {i < nodes.length - 1 && <span className="topology-arrow">→</span>}
          </React.Fragment>
        ))}
      </div>

      {activeNode && machineInfo[activeNode] && (
        <div style={{
          maxWidth: 340, margin: '20px auto', padding: 16,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, marginBottom: 12, color: 'var(--accent-orange)' }}>
            {nodes.find(n => n.id === activeNode)?.sub}
          </div>
          {machineInfo[activeNode].fields.map(f => (
            <div key={f.label} className="inspection-row">
              <span className="inspection-label">{f.label}</span>
              <span className="inspection-value">{f.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlowSection() {
  const steps = [
    { label: 'OBJECT', sub: 'Deteksi Fisik' },
    { label: 'VISION', sub: 'Computer Vision' },
    { label: 'DIMENSION', sub: 'Pengukuran' },
    { label: 'MOTOR DATA', sub: 'Parameter Mesin' },
    { label: 'ML', sub: 'Machine Learning' },
    { label: 'CONDITION', sub: 'Kondisi Mesin' },
    { label: 'ACTION', sub: 'Aksi Otomatis' },
    { label: 'MES / ERP', sub: 'Manajemen' },
    { label: 'DIGITAL TWIN', sub: 'Sinkronisasi' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center', padding: '20px 0' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div style={{
            padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 100
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{s.label}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{s.sub}</div>
          </div>
          {i < steps.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const sections = [
    {
      label: 'CARA KERJA',
      title: 'DARI SHOP FLOOR KE DIGITAL',
      desc: 'Data mesin, objek produksi, analisis kondisi, dan informasi produksi terhubung dalam satu alur real-time.',
    },
    {
      label: 'INTELLIGENCE',
      title: 'OBJECT-AWARE INTELLIGENCE',
      desc: 'MAESTRO tidak hanya mengenali objek, tetapi menggunakan karakteristik objek sebagai bagian dari analisis kondisi motor.',
    },
    {
      label: 'AUTOMATION',
      title: 'CLOSED-LOOP AUTOMATION',
      desc: 'Output analisis diteruskan kembali ke sistem kontrol untuk menghasilkan respons pada proses produksi secara otomatis.',
    },
    {
      label: 'ENERGY',
      title: 'ENERGY INTELLIGENCE',
      desc: 'Pemantauan konsumsi daya listrik real-time, estimasi biaya, efisiensi baseline, dan distribusi beban per unit mesin.',
    },
  ];

  const techStack = [
    { name: 'Multi-Machine Telemetry', desc: 'Monitoring simultan untuk 3 unit motor industrial dengan sensor getaran, suhu, arus, dan RPM', color: 'var(--accent-cyan)' },
    { name: 'Machine Learning', desc: 'Model klasifikasi kondisi motor dan deteksi anomali preventif berbasis AI', color: 'var(--accent-blue)' },
    { name: 'Energy Monitoring', desc: 'Analisis profil energi 24-jam, efisiensi daya, dan pelacakan beban per mesin', color: 'var(--accent-orange)' },
    { name: 'Closed-Loop Control', desc: 'Interlock dan otomasi cerdas respon kecepatan motor serta penghentian darurat', color: 'var(--accent-cyan)' },
    { name: 'MES', desc: 'Manufacturing Execution System untuk pelacakan job order, OEE, dan produksi', color: 'var(--accent-blue)' },
    { name: 'ERP', desc: 'Enterprise Resource Planning untuk manajemen inventory material dan estimasi biaya operasional', color: 'var(--accent-orange)' },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <span className="landing-nav-brand">MAESTRO</span>
        <div className="landing-nav-links">
          <a className="landing-nav-link" href="#cara-kerja">Cara Kerja</a>
          <a className="landing-nav-link" href="#sistem">Sistem</a>
          <a className="landing-nav-link" href="#teknologi">Teknologi</a>
          <a className="landing-nav-link" href="#pabrik">Pabrik</a>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
            Buka Control Center
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div>
          <div className="hero-label">SMART FACTORY / REAL-TIME OPERATIONS</div>
          <h1 className="hero-title">MAESTRO</h1>
          <p className="hero-subtitle">Manufacturing Execution & Synchronization Tracker</p>
          <p className="hero-description">
            Menghubungkan proses fisik di shop floor dengan analisis cerdas, MES, ERP, dan Digital Twin dalam satu alur real-time.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Buka Control Center
            </button>
            <a className="btn btn-outline" href="#cara-kerja">
              Lihat Cara Kerja
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <ConveyorHero />
        </div>
      </section>

      {/* Process Flow */}
      <section id="cara-kerja" className="landing-section">
        <div className="section-label">ALUR SISTEM</div>
        <h2 className="section-title">Alur Lengkap MAESTRO</h2>
        <p className="section-desc">
          Dari deteksi objek fisik hingga sinkronisasi Digital Twin, setiap langkah terhubung dalam satu alur terintegrasi.
        </p>
        <FlowSection />
      </section>

      {/* Feature sections */}
      <section id="sistem" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="landing-section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {sections.map(s => (
              <div key={s.label} style={{
                padding: 24, background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div className="section-label">{s.label}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="teknologi" className="landing-section">
        <div className="section-label">TEKNOLOGI</div>
        <h2 className="section-title">Stack Teknologi</h2>
        <p className="section-desc">
          Kombinasi teknologi industri dan modern yang dirancang untuk lingkungan manufaktur.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {techStack.map(t => (
            <div key={t.name} style={{
              padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${t.color}`
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Factory Topology */}
      <section id="pabrik" style={{ background: 'var(--bg-card-alt)', borderTop: '1px solid var(--border-light)' }}>
        <div className="landing-section">
          <div className="section-label">TOPOLOGI</div>
          <h2 className="section-title">PABRIK DALAM SATU PANDANGAN</h2>
          <p className="section-desc">
            Visualisasi interaktif dari alur produksi. Klik node untuk melihat informasi detail mesin.
          </p>
          <FactoryTopology />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 40px', background: 'var(--bg-dark)', color: 'var(--text-muted)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-orange)', letterSpacing: 2, fontSize: '1rem' }}>MAESTRO</div>
          <div style={{ fontSize: '0.72rem', marginTop: 4 }}>Manufacturing Execution & Synchronization Tracker</div>
        </div>
        <div style={{ fontSize: '0.72rem' }}>
          Prototipe Kompetisi — Simulasi Sistem
        </div>
      </footer>
    </div>
  );
}
