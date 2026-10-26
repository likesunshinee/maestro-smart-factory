import React, { useRef, useEffect, useState } from 'react';
import useFactoryStore from '../store/factoryStore';

function VisionViewport() {
  const canvasRef = useRef(null);
  const currentObject = useFactoryStore(s => s.currentObject);
  const machine = useFactoryStore(s => s.machine);
  const conveyorRunning = useFactoryStore(s => s.conveyorRunning);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrame;
    let beltOffset = 0;
    let scanLine = 0;

    const W = 640;
    const H = 400;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    ctx.scale(2, 2);

    const draw = () => {
      // Dark viewport background
      ctx.fillStyle = '#0D1415';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(13,185,215,0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Conveyor belt simulation
      const cy = 260;
      const beltH = 50;
      ctx.fillStyle = '#1A2628';
      ctx.fillRect(0, cy, W, beltH);

      // Belt lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = beltOffset % 18; x < W; x += 18) {
        ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, cy + beltH); ctx.stroke();
      }

      // Object on conveyor
      const objX = W / 2 - 40;
      const objScale = currentObject.panjang / 100;
      const objW = 60 * objScale;
      const objH = 40 * objScale;
      const objY = cy - objH;

      if (currentObject.kelas === 'Silinder') {
        ctx.fillStyle = 'rgba(255,106,0,0.3)';
        ctx.strokeStyle = 'rgba(255,106,0,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(objX + objW / 2, objY + objH / 2, objW / 2, objH / 2, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,106,0,0.25)';
        ctx.strokeStyle = 'rgba(255,106,0,0.6)';
        ctx.lineWidth = 1;
        ctx.fillRect(objX, objY, objW, objH);
        ctx.strokeRect(objX, objY, objW, objH);
      }

      // Bounding box (YOLO-style)
      const bboxPad = 12;
      const bboxX = objX - bboxPad;
      const bboxY = objY - bboxPad;
      const bboxW = objW + bboxPad * 2;
      const bboxH = objH + bboxPad * 2;

      ctx.strokeStyle = '#0DB9D7';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(bboxX, bboxY, bboxW, bboxH);

      // Corner markers
      const cornerLen = 10;
      ctx.lineWidth = 3;
      // Top-left
      ctx.beginPath(); ctx.moveTo(bboxX, bboxY + cornerLen); ctx.lineTo(bboxX, bboxY); ctx.lineTo(bboxX + cornerLen, bboxY); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(bboxX + bboxW - cornerLen, bboxY); ctx.lineTo(bboxX + bboxW, bboxY); ctx.lineTo(bboxX + bboxW, bboxY + cornerLen); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(bboxX, bboxY + bboxH - cornerLen); ctx.lineTo(bboxX, bboxY + bboxH); ctx.lineTo(bboxX + cornerLen, bboxY + bboxH); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(bboxX + bboxW - cornerLen, bboxY + bboxH); ctx.lineTo(bboxX + bboxW, bboxY + bboxH); ctx.lineTo(bboxX + bboxW, bboxY + bboxH - cornerLen); ctx.stroke();

      ctx.lineWidth = 1;

      // Label above bbox
      ctx.fillStyle = '#0DB9D7';
      ctx.fillRect(bboxX, bboxY - 20, 180, 18);
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = '#fff';
      ctx.fillText(`${currentObject.id} | ${currentObject.kelas.toUpperCase()} | ${currentObject.confidence}%`, bboxX + 4, bboxY - 6);

      // Dimension annotations
      ctx.strokeStyle = 'rgba(255,106,0,0.5)';
      ctx.setLineDash([3, 3]);
      // Width line
      ctx.beginPath(); ctx.moveTo(objX, objY + objH + 8); ctx.lineTo(objX + objW, objY + objH + 8); ctx.stroke();
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#FF6A00';
      ctx.fillText(`${currentObject.panjang} mm`, objX + objW / 2 - 14, objY + objH + 18);
      // Height line
      ctx.beginPath(); ctx.moveTo(objX + objW + 8, objY); ctx.lineTo(objX + objW + 8, objY + objH); ctx.stroke();
      ctx.save();
      ctx.translate(objX + objW + 18, objY + objH / 2 + 10);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${currentObject.tinggi} mm`, 0, 0);
      ctx.restore();
      ctx.setLineDash([]);

      // Scan line effect
      ctx.strokeStyle = 'rgba(13,185,215,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, scanLine); ctx.lineTo(W, scanLine); ctx.stroke();

      // Overlay info - top left
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = '#0DB9D7';
      ctx.fillText('CAM-01 / VISION NODE', 12, 20);
      ctx.fillText(`STATUS: ONLINE`, 12, 34);
      ctx.fillText(`FPS: 28`, 12, 48);
      ctx.fillText(`MODEL: YOLOv8n`, 12, 62);
      ctx.fillText(`OBJECTS: 1`, 12, 76);

      // Timestamp - top right
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const now = new Date();
      ctx.fillText(`${now.toLocaleTimeString('id-ID')}`, W - 12, 20);
      ctx.fillText(`FRAME: ${Math.floor(Math.random() * 900 + 100)}`, W - 12, 34);
      ctx.textAlign = 'left';

      // Crosshair at center of object
      ctx.strokeStyle = 'rgba(13,185,215,0.3)';
      ctx.lineWidth = 0.5;
      const cx = objX + objW / 2;
      const cyObj = objY + objH / 2;
      ctx.beginPath(); ctx.moveTo(cx - 15, cyObj); ctx.lineTo(cx + 15, cyObj); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cyObj - 15); ctx.lineTo(cx, cyObj + 15); ctx.stroke();

      // Animate
      if (conveyorRunning) {
        beltOffset += 0.5;
      }
      scanLine += 1.5;
      if (scanLine > H) scanLine = 0;

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrame);
  }, [currentObject, conveyorRunning]);

  return (
    <div style={{ background: '#0D1415', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ObjectDetail3D() {
  const obj = useFactoryStore(s => s.currentObject);
  const scale = 0.8;
  const w = obj.panjang * scale;
  const h = obj.tinggi * scale;
  const d = obj.lebar * scale * 0.5;

  const isCylinder = obj.kelas === 'Silinder';

  return (
    <div className="object-3d-container">
      {isCylinder ? (
        <div style={{
          width: obj.diameter * scale || 56,
          height: h,
          borderRadius: '50% / 20%',
          background: 'rgba(255,106,0,0.12)',
          border: '1.5px solid rgba(255,106,0,0.4)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50)',
            fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', whiteSpace: 'nowrap'
          }}>
            Ø{obj.diameter || obj.panjang} × {obj.tinggi} mm
          </div>
        </div>
      ) : (
        <div className="object-3d-box" style={{
          width: w, height: h, transformStyle: 'preserve-3d',
          animation: 'rotateObject 10s linear infinite',
        }}>
          {/* Front */}
          <div className="box-face" style={{ width: w, height: h, transform: `translateZ(${d/2}px)` }} />
          {/* Back */}
          <div className="box-face" style={{ width: w, height: h, transform: `translateZ(-${d/2}px)` }} />
          {/* Left */}
          <div className="box-face" style={{ width: d, height: h, transform: `rotateY(-90deg) translateZ(0px)`, left: -d/2 + 'px' }} />
          {/* Right */}
          <div className="box-face" style={{ width: d, height: h, transform: `rotateY(90deg) translateZ(${w - d/2}px)`, left: 0 }} />
          {/* Top */}
          <div className="box-face" style={{
            width: w, height: d, transform: `rotateX(90deg) translateZ(-${d/2}px)`, top: -d / 2 + h / 2 - d / 2 + 'px',
            background: 'rgba(255,106,0,0.18)',
          }} />
          {/* Bottom */}
          <div className="box-face" style={{ width: w, height: d, transform: `rotateX(-90deg) translateZ(${h - d/2}px)`, top: h / 2 - d / 2 + 'px' }} />
        </div>
      )}
    </div>
  );
}

export default function VisionPage() {
  const currentObject = useFactoryStore(s => s.currentObject);
  const mlResult = useFactoryStore(s => s.mlResult);
  const objectHistory = useFactoryStore(s => s.objectHistory);
  const machine = useFactoryStore(s => s.machine);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Computer Vision</h2>
          <span className="mono text-muted text-xs">CAM-01 / YOLOv8n Object Detection</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="status-badge normal"><span className="badge-dot" /> ONLINE</span>
          <span className="mono text-muted text-xs">FPS: 28</span>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-sidebar">
        {/* Vision viewport */}
        <div>
          <VisionViewport />
        </div>

        {/* Inspection panel */}
        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <span className="card-title">
                <span className="card-icon">◎</span> Inspeksi Objek
              </span>
              <span className="card-badge mono" style={{ background: 'var(--accent-orange-bg)', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange-border)' }}>
                {currentObject.id}
              </span>
            </div>
            <div className="card-body">
              <div className="inspection-panel">
                {[
                  { label: 'ID Objek', value: currentObject.id },
                  { label: 'Kelas', value: currentObject.kelas },
                  { label: 'Panjang', value: `${currentObject.panjang} mm` },
                  { label: 'Lebar', value: `${currentObject.lebar} mm` },
                  { label: 'Tinggi', value: `${currentObject.tinggi} mm` },
                  { label: 'Confidence', value: `${currentObject.confidence}%` },
                  { label: 'Timestamp', value: currentObject.timestamp },
                ].map(r => (
                  <div key={r.label} className="inspection-row">
                    <span className="inspection-label">{r.label}</span>
                    <span className="inspection-value">{r.value}</span>
                  </div>
                ))}
                <div className="inspection-row">
                  <span className="inspection-label">Status Kualitas</span>
                  <span className={`status-badge ${currentObject.status === 'LULUS' ? 'normal' : 'kritis'}`}>
                    <span className="badge-dot" /> {currentObject.status}
                  </span>
                </div>
                <div className="inspection-row">
                  <span className="inspection-label">Kondisi Motor</span>
                  <span className={`status-badge ${mlResult.kondisi.toLowerCase()}`}>
                    <span className="badge-dot" /> {mlResult.kondisi}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Object preview */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Visualisasi 3D Objek</span>
            </div>
            <ObjectDetail3D />
            <div style={{ textAlign: 'center', padding: '0 16px 12px' }}>
              <span className="mono text-xs text-muted">
                {currentObject.panjang} × {currentObject.lebar} × {currentObject.tinggi} mm
                {currentObject.weight ? ` | ~${currentObject.weight} kg` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detection History */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">Riwayat Deteksi</span>
          <span className="text-xs text-muted mono">{objectHistory.length} objek</span>
        </div>
        <div className="card-body" style={{ overflow: 'auto' }}>
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
                  <th>Dimensi (mm)</th>
                  <th>Confidence</th>
                  <th>Waktu</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {objectHistory.slice(0, 15).map((obj, i) => (
                  <tr key={i}>
                    <td className="mono">{obj.id}</td>
                    <td>{obj.kelas}</td>
                    <td className="mono">{obj.panjang}×{obj.lebar}×{obj.tinggi}</td>
                    <td className="mono">{obj.confidence}%</td>
                    <td className="mono">{obj.timestamp}</td>
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
  );
}
