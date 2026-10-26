import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFactoryStore from '../store/factoryStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useFactoryStore(s => s.login);
  const auth = useFactoryStore(s => s.auth);
  const navigate = useNavigate();

  if (auth.isLoggedIn) {
    navigate('/app/overview');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const ok = login(username, password);
    if (ok) {
      navigate('/app/overview');
    } else {
      setError('Username atau password salah');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="login-brand-name">MAESTRO</div>
          <div className="login-brand-title">OPERATIONS</div>
          <div className="login-brand-subtitle">Industrial Manufacturing Intelligence Platform</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Masukkan password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Masuk ke Control Center
          </button>
        </form>

        <div className="login-credentials">
          <div className="login-credentials-title">Demo Credentials</div>
          <div className="login-credential-item">
            <strong>Operator:</strong> operator / operator123
          </div>
          <div className="login-credential-item">
            <strong>Supervisor:</strong> supervisor / supervisor123
          </div>
        </div>
      </div>
    </div>
  );
}
