import React, { useEffect, useRef, useState } from 'react';
import useFactoryStore, { OBJECT_CLASSES } from '../store/factoryStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AlertTriangle, AlertOctagon, Zap, TrendingDown, DollarSign, Activity, CheckCircle2 } from 'lucide-react';

function StatusStrip() {
  const system = useFactoryStore(s => s.system);
  const machine = useFactoryStore(s => s.machine);

  const items = [
    { label: 'SISTEM ONLINE', dot: 'online' },
    { label: `MQTT ESP32: ${system.isOnline ? 'STREAMING AKTIF' : 'OFFLINE'}`, dot: system.isOnline ? 'online' : 'error' },
    { label: `MANDOR AI: ${machine.status} (PWM ${machine.pwm ?? (machine.status === 'KRITIS' ? 0 : machine.status === 'WASPADA' ? 220 : 255)})`, dot: machine.status === 'KRITIS' ? 'error' : machine.status === 'WASPADA' ? 'warning' : 'online' },
    { label: `MES ${system.mesStatus}`, dot: system.mesStatus === 'ONLINE' ? 'online' : 'error' },
    { label: `ERP ${system.erpStatus}`, dot: system.erpStatus === 'ONLINE' ? 'online' : 'error' },
  ];

  return (
    <div className="status-strip">
      {items.map(item => (
        <div key={item.label} className="status-strip-item">
          <span className={`strip-dot ${item.dot}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function ConveyorPanel() {
  const canvasRef = useRef(null);
  const recordSensorScan = useFactoryStore(s => s.recordSensorScan);
  const machine = useFactoryStore(s => s.machine);
  const conveyorRunning = useFactoryStore(s => s.conveyorRunning);
  const mlResult = useFactoryStore(s => s.mlResult);
  const simulationPlaying = useFactoryStore(s => s.simulationPlaying);
  const simulationSpeed = useFactoryStore(s => s.simulationSpeed);

  // Keep a ref of live store values so the 60fps draw loop never needs to be torn down
  const storeRef = useRef({});
  storeRef.current = {
    machine,
    conveyorRunning,
    mlResult,
    simulationPlaying,
    simulationSpeed,
  };

  // Persistent physics and animation state (NEVER reset across React re-renders)
  const animRef = useRef({
    objectX: 40, // initial position on left infeed
    beltOffset: 0,
    hasTriggered: false,
    laserScanTimer: 0,
    boxCounter: 24,
    boxData: {
      id: 'OBJ-024',
      kelas: 'Balok Sedang',
      panjang: 120,
      lebar: 80,
      tinggi: 60,
      confidence: 98.2,
      weight: 1.4,
    },
  });

  // Flag that conveyor is active on screen
  useEffect(() => {
    window.__CONVEYOR_ACTIVE__ = true;
    return () => {
      window.__CONVEYOR_ACTIVE__ = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const W = canvas.parentElement.clientWidth || 800;
    const H = 200;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = '100%';
    canvas.style.height = H + 'px';
    ctx.scale(2, 2);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const store = storeRef.current;
      const anim = animRef.current;

      // Background
      ctx.fillStyle = '#F8FAF9';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(22,32,34,0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      const cy = 130;
      const beltH = 36;
      const beltStart = 30;
      const beltEnd = W - 30;

      // Conveyor belt body
      ctx.fillStyle = '#D4DBD8';
      ctx.fillRect(beltStart, cy, beltEnd - beltStart, beltH);

      // Belt lines (moving texture)
      if (store.conveyorRunning) {
        ctx.strokeStyle = '#B0BBB6';
        ctx.lineWidth = 1;
        for (let x = beltStart + (anim.beltOffset % 14); x < beltEnd; x += 14) {
          ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + beltH); ctx.stroke();
        }
      }

      // Rollers
      ctx.fillStyle = '#7A8F93';
      [40, W / 2, W - 50].forEach(x => {
        ctx.beginPath(); ctx.arc(x, cy + beltH, 5, 0, Math.PI * 2); ctx.fill();
      });

      // Sensor Zone boundaries
      const inspX = Math.round(W * 0.52);
      const zoneHalfW = 44;
      const zoneLeft = inspX - zoneHalfW;
      const zoneRight = inspX + zoneHalfW;

      // Box scale & dimensions
      const objScale = Math.max(0.65, Math.min(1.15, anim.boxData.panjang / 130));
      const objW = Math.round(44 * objScale);
      const objH = Math.round(26 * objScale);
      const objY = cy - objH;
      const isCylinder = anim.boxData.kelas === 'Silinder';
      const boxCenter = anim.objectX + objW / 2;

      // Check if box is inside the sensor zone
      const isInsideZone = boxCenter >= zoneLeft && boxCenter <= zoneRight;

      // === PHYSICS UPDATE (CONTINUOUS LEFT TO RIGHT) ===
      if (store.conveyorRunning && store.simulationPlaying) {
        const speed = 1.35 * (store.simulationSpeed || 1);
        anim.beltOffset += speed;
        anim.objectX += speed;

        if (anim.laserScanTimer > 0) anim.laserScanTimer--;

        // TRIGGER CHECK: Only trigger and count when the box is INSIDE the sensor zone
        if (isInsideZone && !anim.hasTriggered && store.machine.status !== 'KRITIS') {
          anim.hasTriggered = true;
          anim.laserScanTimer = 32; // trigger laser beam
          recordSensorScan({ ...anim.boxData });
        }

        // WRAP AROUND CHECK: When box moves off the conveyor belt to the right
        if (anim.objectX >= beltEnd - 5) {
          anim.objectX = beltStart - objW - 15; // wrap to left infeed
          anim.hasTriggered = false;
          anim.boxCounter++;
          const classes = (OBJECT_CLASSES && OBJECT_CLASSES.length) ? OBJECT_CLASSES : [
            { kelas: 'Balok Kecil', panjang: 100, lebar: 60, tinggi: 40, weight: 0.8 },
            { kelas: 'Balok Sedang', panjang: 120, lebar: 80, tinggi: 60, weight: 1.4 },
            { kelas: 'Balok Besar', panjang: 150, lebar: 90, tinggi: 75, weight: 2.1 },
            { kelas: 'Silinder', panjang: 70, lebar: 70, tinggi: 90, weight: 1.6, diameter: 70 },
          ];
          const nextCls = classes[anim.boxCounter % classes.length];
          anim.boxData = {
            id: `OBJ-${String(anim.boxCounter).padStart(3, '0')}`,
            kelas: nextCls.kelas,
            panjang: nextCls.panjang,
            lebar: nextCls.lebar,
            tinggi: nextCls.tinggi,
            confidence: parseFloat((96.0 + Math.random() * 3.8).toFixed(1)),
            weight: nextCls.weight,
            diameter: nextCls.diameter,
          };
        }
      }

      // === RENDER SENSOR ZONE ===
      const isScanning = anim.laserScanTimer > 0;

      if (isScanning) {
        // Glowing laser cone
        const coneGrad = ctx.createLinearGradient(inspX, 26, inspX, cy);
        coneGrad.addColorStop(0, 'rgba(13, 185, 215, 0.45)');
        coneGrad.addColorStop(1, 'rgba(13, 185, 215, 0.08)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(inspX, 26);
        ctx.lineTo(zoneLeft + 8, cy);
        ctx.lineTo(zoneRight - 8, cy);
        ctx.closePath();
        ctx.fill();

        // Vertical Laser beam
        ctx.strokeStyle = '#0DB9D7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(inspX, 26);
        ctx.lineTo(inspX, cy);
        ctx.stroke();

        // Sensor zone border active
        ctx.strokeStyle = '#0DB9D7';
        ctx.lineWidth = 2;
        ctx.strokeRect(zoneLeft, cy - 54, zoneHalfW * 2, 54 + beltH);

        // Header active label
        ctx.font = 'bold 7px JetBrains Mono, monospace';
        ctx.fillStyle = '#0DB9D7';
        ctx.fillText('● SCANNING (+1 TERCATAT)', inspX - 44, cy - 58);
      } else {
        // Standby sensor zone
        ctx.strokeStyle = 'rgba(13,185,215,0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(zoneLeft, cy - 54, zoneHalfW * 2, 54 + beltH);
        ctx.setLineDash([]);

        ctx.font = '6px JetBrains Mono, monospace';
        ctx.fillStyle = '#0DB9D7';
        ctx.fillText('ZONA SENSOR INDUSTRIAL', inspX - 40, cy - 58);
      }

      // Optical Sensor housing (S-OPTO)
      ctx.fillStyle = '#246BCE';
      ctx.fillRect(inspX - 7, 18, 14, 11);
      ctx.fillStyle = isScanning ? '#22C55E' : '#0DB9D7';
      ctx.beginPath(); ctx.arc(inspX, 24, isScanning ? 4 : 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = '6px JetBrains Mono, monospace';
      ctx.fillStyle = isScanning ? '#22C55E' : '#246BCE';
      ctx.fillText('S-OPTO', inspX - 13, 14);

      // Support proximity sensor pins
      ctx.fillStyle = '#0DB9D7';
      [{ x: W * 0.28, l: 'S-01' }, { x: W * 0.74, l: 'S-02' }].forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, cy - 5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.font = '5px JetBrains Mono, monospace';
        ctx.fillStyle = '#9AABAF';
        ctx.fillText(s.l, s.x - 6, cy - 12);
        ctx.fillStyle = '#0DB9D7';
      });

      // === RENDER CURRENT BOX ON CONVEYOR ===
      // Colors based on status and scanning
      let objColor = isScanning ? 'rgba(13,185,215,0.35)' :
        store.mlResult.kondisi === 'KRITIS' ? 'rgba(239,68,68,0.25)' :
        store.mlResult.kondisi === 'WASPADA' ? 'rgba(245,158,11,0.25)' : 'rgba(255,106,0,0.2)';

      let objBorder = isScanning ? '#0DB9D7' :
        store.mlResult.kondisi === 'KRITIS' ? '#EF4444' :
        store.mlResult.kondisi === 'WASPADA' ? '#F59E0B' : '#FF6A00';

      if (isCylinder) {
        ctx.fillStyle = objColor;
        ctx.strokeStyle = objBorder;
        ctx.lineWidth = isScanning ? 2 : 1.5;
        ctx.beginPath();
        ctx.ellipse(anim.objectX + objW / 2, objY + objH / 2, objW / 2, objH / 2, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = objColor;
        ctx.strokeStyle = objBorder;
        ctx.lineWidth = isScanning ? 2 : 1.5;
        ctx.fillRect(anim.objectX, objY, objW, objH);
        ctx.strokeRect(anim.objectX, objY, objW, objH);
      }

      // Box ID label
      ctx.font = 'bold 7px JetBrains Mono, monospace';
      ctx.fillStyle = isScanning ? '#0DB9D7' : '#FF6A00';
      ctx.fillText(anim.boxData.id, anim.objectX, objY - 14);

      // Box Class label
      ctx.font = '6px JetBrains Mono, monospace';
      ctx.fillStyle = '#4A5D60';
      ctx.fillText(anim.boxData.kelas.toUpperCase(), anim.objectX, objY - 5);

      // Dimension annotation
      ctx.font = '6px JetBrains Mono, monospace';
      ctx.fillStyle = '#7A8F93';
      ctx.fillText(`${anim.boxData.panjang}×${anim.boxData.lebar}×${anim.boxData.tinggi} mm`, anim.objectX, cy + beltH + 14);

      // Motor label footer
      ctx.font = '6px JetBrains Mono, monospace';
      ctx.fillStyle = '#4A5D60';
      ctx.fillText(`${store.machine.id} (${store.machine.name}) | ${store.machine.rpm} RPM | ${store.machine.motor_load}%`, 30, H - 8);

      // Status dot footer
      const statusColor = store.machine.status === 'KRITIS' ? '#EF4444' :
        store.machine.status === 'WASPADA' ? '#F59E0B' : '#22C55E';
      ctx.fillStyle = statusColor;
      ctx.beginPath(); ctx.arc(W - 80, H - 12, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = '7px JetBrains Mono, monospace';
      ctx.fillText(store.machine.status, W - 72, H - 8);

      // Stopped banner if critical interlock
      if (!store.conveyorRunning) {
        ctx.fillStyle = 'rgba(239,68,68,0.15)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#EF4444';
        ctx.textAlign = 'center';
        ctx.fillText('KONVEYOR DIHENTIKAN', W / 2, H / 2 - 10);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText('KONDISI KRITIS — MENUNGGU INTERVENSI', W / 2, H / 2 + 8);
        ctx.textAlign = 'left';
      }

      // Paused banner if manually paused
      if (!store.simulationPlaying && store.conveyorRunning && store.machine.status !== 'KRITIS') {
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.fillRect(0, 0, W, H);
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = '#0DB9D7';
        ctx.textAlign = 'center';
        ctx.fillText('⏸ SIMULASI DIJEDA (PAUSED)', W / 2, H / 2 - 4);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillStyle = '#CBD5D1';
        ctx.fillText('Tekan ▶ PLAY pada Demo Control untuk melanjutkan konveyor', W / 2, H / 2 + 12);
        ctx.textAlign = 'left';
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [recordSensorScan]);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header">
        <span className="card-title">
          <span className="card-icon">▣</span> Konveyor Produksi Real-Time (Left → Right Sensor Scanning)
        </span>
        <span className={`status-badge ${machine.status.toLowerCase()}`}>
          <span className="badge-dot" />
          {machine.status}
        </span>
      </div>
      <div style={{ padding: 0 }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

function MetricsRow() {
  const machine = useFactoryStore(s => s.machine);
  const production = useFactoryStore(s => s.production);
  const getOEE = useFactoryStore(s => s.getOEE);
  const oee = getOEE();

  const pwmVal = machine.pwm ?? (machine.status === 'KRITIS' ? 0 : machine.status === 'WASPADA' ? 220 : 255);

  const metrics = [
    { label: 'Sensor: Arus Motor', value: `${machine.arus}`, unit: ' A', accent: 'accent-blue' },
    { label: 'Sensor: Suhu Objek', value: `${machine.suhu}`, unit: ' °C', accent: machine.suhu > 45 ? 'accent-orange' : 'accent-orange' },
    { label: 'Sensor: Kecepatan', value: machine.rpm.toLocaleString('id-ID'), unit: ' RPM', accent: 'accent-cyan' },
    { label: 'Sensor: Getaran RMS', value: `${machine.getaran}`, unit: ' mm/s', accent: machine.getaran > 7 ? 'accent-orange' : 'accent-cyan' },
    { label: 'Mandor AI Status', value: `${machine.status} (PWM ${pwmVal})`, unit: '', accent: machine.status === 'KRITIS' ? 'accent-orange' : 'accent-blue', notMono: true },
    { label: 'Produksi / OEE', value: `${production.output.toLocaleString('id-ID')} unit`, unit: ` (${oee.oee}%)`, accent: 'accent-orange' },
  ];

  return (
    <div className="metric-grid" style={{ marginBottom: 16 }}>
      {metrics.map(m => (
        <div key={m.label} className={`metric-card ${m.accent}`}>
          <div className="metric-label">{m.label}</div>
          <div className="metric-value" style={m.notMono ? { fontFamily: 'var(--font-sans)', fontSize: '1.15rem' } : {}}>
            {m.value}<span className="metric-unit">{m.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Integrated Energy Monitoring Section for Dashboard Utama
function EnergyMonitoringSection() {
  const energy = useFactoryStore(s => s.energy);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={18} color="var(--accent-orange)" />
          <span className="card-title" style={{ fontSize: '1rem', fontWeight: 700 }}>
            Pemantauan Energi Pabrik (Energy Monitoring)
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="card-badge mono" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange-border)' }}>
            POWER FACTOR: {energy.powerFactor}
          </span>
          <span className="card-badge mono" style={{ background: 'var(--status-normal-bg)', color: 'var(--status-normal)', border: '1px solid var(--status-normal-border)' }}>
            HEMAT CO2: {energy.co2SavedKg} kg
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Energy KPI Mini Grid */}
        <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
          <div className="metric-card accent-orange" style={{ padding: '12px 14px' }}>
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={13} /> Konsumsi Total Hari Ini
            </div>
            <div className="metric-value" style={{ fontSize: '1.4rem' }}>
              {energy.totalKwhToday.toLocaleString('id-ID')}<span className="metric-unit"> kWh</span>
            </div>
          </div>

          <div className="metric-card accent-cyan" style={{ padding: '12px 14px' }}>
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Activity size={13} /> Rata-Rata Daya Aktif
            </div>
            <div className="metric-value" style={{ fontSize: '1.4rem' }}>
              {energy.avgPowerKw}<span className="metric-unit"> kW</span>
            </div>
          </div>

          <div className="metric-card accent-blue" style={{ padding: '12px 14px' }}>
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <TrendingDown size={13} /> Efisiensi vs Baseline
            </div>
            <div className="metric-value" style={{ fontSize: '1.4rem', color: 'var(--status-normal)' }}>
              +{energy.efficiencyVsBaseline}<span className="metric-unit">%</span>
            </div>
          </div>

          <div className="metric-card" style={{ padding: '12px 14px', borderLeft: '3px solid #8B5CF6' }}>
            <div className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <DollarSign size={13} /> Estimasi Biaya Listrik
            </div>
            <div className="metric-value" style={{ fontSize: '1.3rem' }}>
              Rp {energy.costToday.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Sub-grid: Hourly Profile Chart + Machine Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
          {/* Hourly Energy Consumption Chart */}
          <div style={{ background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Profil Beban Energi per Jam (Aktual vs Target Baseline)
              </span>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>24-Hour Metric</span>
            </div>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energy.hourlyHistory}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E5" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} unit=" kW" />
                  <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', borderRadius: 4 }} />
                  <Area type="monotone" dataKey="kwh" stroke="#FF6A00" strokeWidth={2} fill="url(#energyGrad)" name="Aktual (kW)" />
                  <Line type="monotone" dataKey="baseline" stroke="#9AABAF" strokeDasharray="3 3" strokeWidth={1.5} dot={false} name="Baseline Max (kW)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Per-Machine Breakdown */}
          <div style={{ background: 'var(--bg-card-alt)', borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Distribusi Konsumsi per Unit Mesin
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {energy.breakdown.map(item => (
                  <div key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{item.id} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>- {item.name}</span></span>
                      <span className="mono" style={{ fontWeight: 600 }}>{item.kwh} kWh ({item.pct}%)</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${item.pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Peak Demand: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{energy.peakDemandKw} kW</strong></span>
              <span style={{ fontSize: '0.72rem', color: 'var(--status-normal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> Beban Dalam Batas Aman
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart() {
  const getTimeSeriesData = useFactoryStore(s => s.getTimeSeriesData);
  const machine = useFactoryStore(s => s.machine);
  const simulationPlaying = useFactoryStore(s => s.simulationPlaying);
  const simulationSpeed = useFactoryStore(s => s.simulationSpeed);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getTimeSeriesData());
  }, [machine.id, machine.timestamp, getTimeSeriesData]);

  useEffect(() => {
    if (!simulationPlaying) return;
    const intervalMs = Math.round(2000 / simulationSpeed);
    const iv = setInterval(() => setData(getTimeSeriesData()), intervalMs);
    return () => clearInterval(iv);
  }, [machine.id, simulationPlaying, simulationSpeed, getTimeSeriesData]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Tren Parameter {machine.id}</span>
        <span className="card-badge" style={{ background: 'var(--accent-cyan-bg)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan-border)' }}>
          LIVE
        </span>
      </div>
      <div className="card-body">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8E5" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} interval={4} />
              <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', borderRadius: 4 }} />
              <Line type="monotone" dataKey="suhu" stroke="#FF6A00" strokeWidth={1.5} dot={false} name="Suhu °C" />
              <Line type="monotone" dataKey="getaran" stroke="#0DB9D7" strokeWidth={1.5} dot={false} name="Getaran mm/s" />
              <Line type="monotone" dataKey="arus" stroke="#246BCE" strokeWidth={1.5} dot={false} name="Arus A" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EventsFeed() {
  const events = useFactoryStore(s => s.events);

  return (
    <div className="card" style={{ maxHeight: 380, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <span className="card-title">Event Log & Telemetri Terkini</span>
      </div>
      <div className="card-body" style={{ overflow: 'auto', flex: 1 }}>
        <div className="event-timeline">
          {events.slice(0, 15).map((e, i) => (
            <div key={i} className="event-item">
              <span className="event-time">{e.time}</span>
              <span className={`event-dot ${e.severity}`} />
              <span className="event-message">{e.message}</span>
              <span className="event-type">{e.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ObjectPanel() {
  const obj = useFactoryStore(s => s.currentObject);
  const mlResult = useFactoryStore(s => s.mlResult);
  const machine = useFactoryStore(s => s.machine);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          <span className="card-icon">◎</span> Material Terdeteksi Pada Lini
        </span>
        <span className="card-badge mono" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange-border)' }}>
          {obj.id}
        </span>
      </div>
      <div className="card-body">
        <div className="inspection-panel">
          <div className="inspection-row">
            <span className="inspection-label">Klasifikasi Material</span>
            <span className="inspection-value">{obj.kelas}</span>
          </div>
          <div className="inspection-row">
            <span className="inspection-label">Dimensi Aktual</span>
            <span className="inspection-value">{obj.panjang} × {obj.lebar} × {obj.tinggi} mm</span>
          </div>
          <div className="inspection-row">
            <span className="inspection-label">Kesesuaian Toleransi</span>
            <span className="inspection-value">{obj.confidence}%</span>
          </div>
          <div className="inspection-row">
            <span className="inspection-label">Waktu Deteksi</span>
            <span className="inspection-value">{obj.timestamp}</span>
          </div>
          <div className="inspection-row">
            <span className="inspection-label">Status Kualitas</span>
            <span className={`status-badge ${obj.status === 'LULUS' ? 'normal' : 'kritis'}`}>
              <span className="badge-dot" />
              {obj.status}
            </span>
          </div>
          <div className="inspection-row">
            <span className="inspection-label">Status Mesin Terkait</span>
            <span className={`status-badge ${machine.status.toLowerCase()}`}>
              <span className="badge-dot" />
              {machine.id}: {machine.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const machine = useFactoryStore(s => s.machine);

  return (
    <div>
      {/* Alert banners */}
      {machine.status === 'KRITIS' && (
        <div className="critical-banner">
          <AlertOctagon size={20} />
          <span className="banner-text">KONDISI KRITIS — {machine.id} dihentikan sementara. Getaran dan arus motor melampaui batas aman.</span>
        </div>
      )}
      {machine.status === 'WASPADA' && (
        <div className="warning-banner">
          <AlertTriangle size={20} />
          <span className="banner-text">WASPADA — Beban {machine.id} meningkat. Kecepatan telah disesuaikan secara otomatis.</span>
        </div>
      )}

      <StatusStrip />
      <MetricsRow />
      <ConveyorPanel />

      {/* Integrated Energy Monitoring */}
      <EnergyMonitoringSection />

      <div className="dashboard-grid dashboard-grid-sidebar" style={{ marginBottom: 16 }}>
        <MiniChart />
        <ObjectPanel />
      </div>

      <EventsFeed />
    </div>
  );
}
