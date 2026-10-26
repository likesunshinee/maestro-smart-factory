import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useFactoryStore from '../store/factoryStore';
import DemoPanel from './DemoPanel';
import {
  LayoutDashboard, Gauge, Package, Database, BarChart3,
  Bell, Settings, Menu, X, LogOut, Wrench, TrendingUp, FileText
} from 'lucide-react';
import { useDataProvider } from '../store/DataProviderContext';

const NAV_ITEMS = [
  { path: '/app/overview', label: 'Overview', icon: LayoutDashboard, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/monitoring', label: 'Monitoring Mesin', icon: Gauge, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/predictive-maintenance', label: 'Predictive Maint & RCA', icon: Wrench, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/produksi', label: 'Produksi', icon: Package, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/forecasting', label: 'Forecasting Produksi', icon: TrendingUp, roles: ['SUPERVISOR'] },
  { path: '/app/mes', label: 'MES', icon: Database, roles: ['SUPERVISOR'] },
  { path: '/app/erp', label: 'ERP', icon: BarChart3, roles: ['SUPERVISOR'] },
  { path: '/app/reports', label: 'Laporan', icon: FileText, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/events', label: 'Event Log', icon: Bell, roles: ['OPERATOR', 'SUPERVISOR'] },
  { path: '/app/pengaturan', label: 'Pengaturan', icon: Settings, roles: ['OPERATOR', 'SUPERVISOR'] },
];

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clock, setClock] = useState('');
  const { mode, toggleMode } = useDataProvider();
  const auth = useFactoryStore(s => s.auth);
  const system = useFactoryStore(s => s.system);
  const machine = useFactoryStore(s => s.machine);
  const logout = useFactoryStore(s => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentModule = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label || 'MAESTRO';
  const filteredNav = NAV_ITEMS.filter(n => n.roles.includes(auth.role));

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">MAESTRO</div>
          <div className="sidebar-brand-sub">Manufacturing Execution and Synchronization Tracker</div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Operasional</div>
          {filteredNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <span className="status-dot" style={{
              background: machine.status === 'KRITIS' ? 'var(--status-kritis)' :
                machine.status === 'WASPADA' ? 'var(--status-waspada)' : 'var(--status-normal)'
            }} />
            Status Sistem: {system.isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-module">{currentModule}</span>
          </div>

          <div className="topbar-center">
            <button className="topbar-sync" onClick={toggleMode} style={{cursor: 'pointer', background: mode === 'CONNECTED' ? 'var(--status-normal-bg)' : 'var(--accent-cyan-bg)'}}>
              <span className="sync-indicator" style={{background: mode === 'CONNECTED' ? 'var(--status-normal)' : 'var(--accent-cyan)'}} />
              {mode === 'CONNECTED' ? 'CONNECTED (LIVE)' : 'STANDALONE DEMO'}
            </button>
          </div>

          <div className="topbar-right">
            <div className="topbar-system-status">
              <span className="status-dot" style={{
                background: machine.status === 'KRITIS' ? 'var(--status-kritis)' :
                  machine.status === 'WASPADA' ? 'var(--status-waspada)' : 'var(--status-normal)'
              }} />
              SISTEM ONLINE
            </div>
            <span className="topbar-time">{clock}</span>
            <span className="topbar-role">{auth.role}</span>
            <button className="topbar-btn" onClick={handleLogout} title="Keluar">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Demo Panel */}
      <DemoPanel />
    </div>
  );
}
