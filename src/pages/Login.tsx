import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonButton, IonText,
  IonSpinner, IonItem, IonLabel, IonIcon,
} from '@ionic/react';
import { eyeOutline, eyeOffOutline, lockClosedOutline, mailOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      history.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <div className="login-container">
          {/* Logo */}
          <div className="login-logo">
            <div className="logo-circle">
              <span>A</span>
            </div>
            <h1>adhivasindo</h1>
            <p>Learning Management System</p>
          </div>

          {/* Card */}
          <div className="login-card">
            <h2>Selamat Datang</h2>
            <p className="login-subtitle">Masuk ke akun kamu</p>

            {error && (
              <div className="error-box">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <div className="input-group">
              <div className="input-wrapper">
                <IonIcon icon={mailOutline} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div className="input-wrapper">
                <IonIcon icon={lockClosedOutline} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="custom-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <IonIcon
                  icon={showPass ? eyeOffOutline : eyeOutline}
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                />
              </div>
            </div>

            <IonButton
              expand="block"
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Masuk'}
            </IonButton>

            <p className="register-link">
              Belum punya akun?{' '}
              <span onClick={() => history.push('/register')}>Daftar sekarang</span>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;