import React, { useState } from 'react';
import useFactoryStore from '../store/factoryStore';
import { useDataProvider } from '../store/DataProviderContext';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DemoPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { mode, publishControlCommand, mqttStatus } = useDataProvider();
  const currentScenario = useFactoryStore(s => s.currentScenario);
  const simulationPlaying = useFactoryStore(s => s.simulationPlaying);
  const simulationSpeed = useFactoryStore(s => s.simulationSpeed);
  const runScenario = useFactoryStore(s => s.runScenario);
  const resetSimulation = useFactoryStore(s => s.resetSimulation);
  const setSimulationPlaying = useFactoryStore(s => s.setSimulationPlaying);
  const setSimulationSpeed = useFactoryStore(s => s.setSimulationSpeed);

  const scenarios = [
    { key: 'NORMAL', label: 'NORMAL' },
    { key: 'OBJEK_BESAR', label: 'OBJEK BESAR' },
    { key: 'WASPADA', label: 'WASPADA' },
    { key: 'KRITIS', label: 'KRITIS' },
  ];

  const handleScenarioClick = (key) => {
    runScenario(key);
    if (mode === 'CONNECTED') {
      publishControlCommand(key === 'OBJEK_BESAR' ? 'NORMAL' : key);
    }
  };

  const handleTogglePlay = () => {
    const nextPlaying = !simulationPlaying;
    setSimulationPlaying(nextPlaying);
    if (mode === 'CONNECTED') {
      publishControlCommand(nextPlaying ? 'NORMAL' : 'KRITIS', nextPlaying ? 255 : 0);
    }
  };

  return (
    <div className={`demo-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="demo-panel-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="demo-panel-title">⚙ DEMO CONTROL</span>
        {collapsed ? <ChevronUp size={14} color="#9AABAF" /> : <ChevronDown size={14} color="#9AABAF" />}
      </div>

      {!collapsed && (
        <>
          <div className="demo-panel-label">Skenario</div>
          <div className="demo-scenario-grid">
            {scenarios.map(s => (
              <button
                key={s.key}
                className={`demo-scenario-btn ${currentScenario === s.key ? 'active' : ''}`}
                onClick={() => handleScenarioClick(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="demo-panel-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Simulasi</span>
            <span style={{ fontSize: '0.62rem', color: simulationPlaying ? 'var(--status-normal)' : 'var(--status-waspada)' }}>
              {simulationPlaying ? '● BERJALAN' : '⏸ DIJEDA'}
            </span>
          </div>
          <div className="demo-controls">
            <button
              className={`demo-ctrl-btn ${simulationPlaying ? 'active' : ''}`}
              onClick={handleTogglePlay}
              title={simulationPlaying ? "Jeda Simulasi" : "Jalankan Simulasi"}
            >
              {simulationPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button className="demo-ctrl-btn" onClick={resetSimulation} title="Reset Nilai & Skenario">
              ↻ RESET
            </button>
          </div>

          <div className="demo-panel-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Kecepatan</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--accent-orange)' }}>
              {simulationSpeed}x AKTIF
            </span>
          </div>
          <div className="demo-speed-controls">
            {[0.5, 1, 2].map(speed => (
              <button
                key={speed}
                className={`demo-speed-btn ${simulationSpeed === speed ? 'active' : ''}`}
                onClick={() => setSimulationSpeed(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
