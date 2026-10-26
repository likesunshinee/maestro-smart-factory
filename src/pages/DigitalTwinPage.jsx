import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, Environment, ContactShadows, Text } from '@react-three/drei';
import useFactoryStore from '../store/factoryStore';

function FactoryModel() {
  const conveyorRunning = useFactoryStore(s => s.conveyorRunning);
  const currentObject = useFactoryStore(s => s.currentObject);
  const machine = useFactoryStore(s => s.machine);
  
  const beltRef = useRef();
  const objRef = useRef();
  
  // Convert real mm dimensions to Three.js units (scale down by 100 for visual)
  const scale = 0.02;
  const isCylinder = currentObject.kelas === 'Silinder';
  const objW = (currentObject.panjang || currentObject.diameter) * scale;
  const objH = currentObject.tinggi * scale;
  const objD = (currentObject.lebar || currentObject.diameter) * scale;

  useFrame((state, delta) => {
    if (conveyorRunning) {
      if (beltRef.current) {
        beltRef.current.position.x -= delta * 2;
        if (beltRef.current.position.x < -2) beltRef.current.position.x = 0;
      }
      if (objRef.current) {
        objRef.current.position.x -= delta * 2;
        if (objRef.current.position.x < -3) objRef.current.position.x = 3;
      }
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Conveyor Frame */}
      <Box args={[8, 0.4, 2]} position={[0, 1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3a4a4d" roughness={0.4} metalness={0.6} />
      </Box>

      {/* Conveyor Legs */}
      {[-3.5, 0, 3.5].map(x => (
        <group key={x}>
          <Cylinder args={[0.08, 0.08, 1.5]} position={[x, 0.25, 0.8]} castShadow>
            <meshStandardMaterial color="#5a6a6d" metalness={0.8} />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 1.5]} position={[x, 0.25, -0.8]} castShadow>
            <meshStandardMaterial color="#5a6a6d" metalness={0.8} />
          </Cylinder>
        </group>
      ))}

      {/* Belt */}
      <Box ref={beltRef} args={[10, 0.1, 1.8]} position={[0, 1.25, 0]} receiveShadow>
        <meshStandardMaterial color="#222" roughness={0.9} />
      </Box>

      {/* Motor */}
      <group position={[-3.5, 0.8, 1.2]}>
        <Box args={[0.8, 0.8, 0.8]} castShadow>
          <meshStandardMaterial color={machine.status === 'KRITIS' ? '#8a2a2a' : machine.status === 'WASPADA' ? '#8a6a2a' : '#2a4a4d'} metalness={0.5} />
        </Box>
        <Cylinder args={[0.1, 0.1, 0.4]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -0.6]}>
          <meshStandardMaterial color="#888" metalness={0.9} />
        </Cylinder>
        <Text position={[0, 0.6, 0]} fontSize={0.2} color="#0DB9D7" anchorX="center" anchorY="middle">MOTOR-01</Text>
      </group>

      {/* Vision System Frame */}
      <group position={[0, 1.2, 0]}>
        <Box args={[0.1, 3, 0.1]} position={[0, 1.5, 1.2]} castShadow>
          <meshStandardMaterial color="#4a5d60" />
        </Box>
        <Box args={[0.1, 3, 0.1]} position={[0, 1.5, -1.2]} castShadow>
          <meshStandardMaterial color="#4a5d60" />
        </Box>
        <Box args={[0.1, 0.1, 2.5]} position={[0, 3, 0]} castShadow>
          <meshStandardMaterial color="#4a5d60" />
        </Box>
        
        {/* Camera */}
        <Box args={[0.3, 0.2, 0.2]} position={[0, 2.9, 0]} castShadow>
          <meshStandardMaterial color="#246BCE" />
        </Box>
        <Cylinder args={[0.08, 0.08, 0.1]} rotation={[Math.PI/2, 0, 0]} position={[0, 2.8, 0]}>
          <meshStandardMaterial color="#111" />
        </Cylinder>
        
        {/* Laser / Scanner effect */}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.02, 2.8, 1.8]} />
          <meshBasicMaterial color="#0DB9D7" transparent opacity={0.15} blending={2} />
        </mesh>
      </group>

      {/* Production Object */}
      <group ref={objRef} position={[2, 1.3 + objH/2, 0]}>
        {isCylinder ? (
          <Cylinder args={[objW/2, objW/2, objH, 32]} castShadow>
            <meshStandardMaterial color="#FF6A00" roughness={0.3} metalness={0.2} transparent opacity={0.8} />
          </Cylinder>
        ) : (
          <Box args={[objW, objH, objD]} castShadow>
            <meshStandardMaterial color="#FF6A00" roughness={0.3} metalness={0.2} transparent opacity={0.8} />
          </Box>
        )}
        
        {/* Object Highlight Wireframe */}
        {isCylinder ? (
          <Cylinder args={[objW/2 + 0.02, objW/2 + 0.02, objH + 0.02, 16]} wireframe>
            <meshBasicMaterial color="#0DB9D7" />
          </Cylinder>
        ) : (
          <Box args={[objW + 0.02, objH + 0.02, objD + 0.02]} wireframe>
            <meshBasicMaterial color="#0DB9D7" />
          </Box>
        )}

        <Text position={[0, objH/2 + 0.3, 0]} fontSize={0.15} color="#fff" anchorX="center" anchorY="middle" backgroundColor="#FF6A00" fillOpacity={1}>
           {currentObject.id} 
        </Text>
      </group>
    </group>
  );
}

export default function DigitalTwinPage() {
  const currentObject = useFactoryStore(s => s.currentObject);
  const machine = useFactoryStore(s => s.machine);
  const mlResult = useFactoryStore(s => s.mlResult);
  const system = useFactoryStore(s => s.system);

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Digital Twin</h2>
          <span className="mono text-muted text-xs">Representasi Virtual Tersinkronisasi</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="status-badge normal">
            <span className="badge-dot" /> DT-SYNC ONLINE
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        {/* DT Overlay Info */}
        <div className="dt-overlay-info">
          <div className="dt-info-item">MODEL: CONVEYOR-SYS-V2</div>
          <div className="dt-info-item">OBJECT ID: {currentObject.id}</div>
          <div className="dt-info-item">DIM: {currentObject.panjang}x{currentObject.lebar}x{currentObject.tinggi}</div>
          <div className="dt-info-item">MOTOR: {machine.rpm} RPM</div>
        </div>

        <div className="dt-sync-indicator">
          <span className="sync-indicator" style={{ width: 6, height: 6, background: 'var(--accent-cyan)', borderRadius: '50%', animation: 'pulse-dot 1s infinite' }} />
          PHYSICAL SYSTEM ↔ DIGITAL TWIN
          <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>Sync: {system.lastSync}</span>
        </div>

        <div className="dt-controls">
          <div className="dt-control-btn active">Orbit View</div>
          <div className="dt-control-btn">Top View</div>
          <div className="dt-control-btn">Side View</div>
        </div>

        {/* Info panel bottom right */}
        <div style={{ position: 'absolute', bottom: 16, right: 16, width: 280, background: 'rgba(20, 30, 32, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: 16, color: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-orange)', marginBottom: 12, fontFamily: 'var(--font-mono)' }}>STATUS SINKRONISASI</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Objek Fisik</span>
            <span className="mono fw-600 text-cyan">{currentObject.kelas}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Kondisi Mesin</span>
            <span className="mono fw-600" style={{ color: machine.status === 'KRITIS' ? 'var(--status-kritis)' : machine.status === 'WASPADA' ? 'var(--status-waspada)' : 'var(--status-normal)' }}>
              {machine.status}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Prediksi ML</span>
            <span className="mono fw-600">{mlResult.confidence}% CONF</span>
          </div>
        </div>

        {/* 3D Canvas */}
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #1A2628 0%, #0D1415 100%)' }}>
          <Suspense fallback={<div style={{ color: '#fff', padding: 20, fontFamily: 'var(--font-mono)' }}>Loading 3D Engine...</div>}>
            <Canvas shadows camera={{ position: [5, 4, 6], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <directionalLight castShadow position={[5, 10, 5]} intensity={1.5} shadow-mapSize={[1024, 1024]} />
              <pointLight position={[-5, 5, -5]} intensity={0.5} />
              
              <FactoryModel />
              
              <ContactShadows position={[0, -0.49, 0]} opacity={0.5} scale={20} blur={2} far={10} />
              <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} minDistance={3} maxDistance={15} />
              <Environment preset="city" />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
