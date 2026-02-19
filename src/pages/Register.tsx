import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonText, IonSpinner, IonIcon } from '@ionic/react';
import { personOutline, mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Login.css';

const Register: React.FC = () => {
  const history = useHistory();
  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Semua field wajib diisi');
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError('Password tidak cocok');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      history.replace('/dashboard');
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors)[0] as string[];
        setError(firstError[0]);
      } else {
        setError(err.response?.data?.message || 'Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <div className="login-container">
          <div className="login-logo">
            <div className="logo-circle"><span>A</span></div>
            <h1>adhivasindo</h1>
            <p>Learning Management System</p>
          </div>

          <div className="login-card">
            <h2>Daftar Akun</h2>
            <p className="login-subtitle">Buat akun baru kamu</p>

            {error && (
              <div className="error-box">
                <IonText color="danger">{error}</IonText>
              </div>
            )}

            <div className="input-group">
              <div className="input-wrapper">
                <IonIcon icon={personOutline} className="input-icon" />
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="custom-input"
                />
              </div>

              <div className="input-wrapper">
                <IonIcon icon={mailOutline} className="input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="custom-input"
                />
              </div>

              <div className="input-wrapper">
                <IonIcon icon={lockClosedOutline} className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="custom-input"
                />
                <IonIcon
                  icon={showPass ? eyeOffOutline : eyeOutline}
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                />
              </div>

              <div className="input-wrapper">
                <IonIcon icon={lockClosedOutline} className="input-icon" />
                <input
                  type="password"
                  placeholder="Konfirmasi Password"
                  value={form.password_confirmation}
                  onChange={(e) => handleChange('password_confirmation', e.target.value)}
                  className="custom-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleRegister()}
                />
              </div>
            </div>

            <IonButton
              expand="block"
              className="login-btn"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Daftar'}
            </IonButton>

            <p className="register-link">
              Sudah punya akun?{' '}
              <span onClick={() => history.push('/login')}>Masuk</span>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;