import React, { useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonButton, IonAlert,
} from '@ionic/react';
import {
  personOutline, mailOutline, shieldOutline,
  logOutOutline, settingsOutline, chevronForwardOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/auth.service';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './Profile.css';

const Profile: React.FC = () => {
  const history = useHistory();
  const user    = authService.me();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      history.replace('/login');
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      history.replace('/login');
    }
  };

  const menuItems = [
    { icon: personOutline,   label: 'Edit Profil',       action: () => {} },
    { icon: settingsOutline, label: 'Pengaturan Akun',   action: () => {} },
    { icon: shieldOutline,   label: 'Keamanan',          action: () => {} },
  ];

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="profile" />
        <div className="main-content">
          <IonContent className="dashboard-content">

            {/* Header */}
            <div className="profile-header">
              <div className="profile-avatar-wrap">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1a237e&color=fff&size=100`}
                  alt="avatar"
                  className="profile-avatar"
                />
              </div>
              <h2>{user?.name}</h2>
              <div className="profile-role">{user?.role}</div>
            </div>

            {/* Info */}
            <div className="profile-section">
              <div className="profile-info-item">
                <IonIcon icon={personOutline} />
                <div>
                  <span className="info-label">Nama</span>
                  <span className="info-value">{user?.name}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <IonIcon icon={mailOutline} />
                <div>
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
              </div>
              <div className="profile-info-item">
                <IonIcon icon={shieldOutline} />
                <div>
                  <span className="info-label">Role</span>
                  <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="profile-menu">
              {menuItems.map((item, i) => (
                <div key={i} className="menu-item" onClick={item.action}>
                  <IonIcon icon={item.icon} className="menu-icon" />
                  <span className="menu-label">{item.label}</span>
                  <IonIcon icon={chevronForwardOutline} className="menu-arrow" />
                </div>
              ))}
            </div>

            {/* Logout */}
            <div style={{ padding: '16px' }}>
              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                onClick={() => setShowLogout(true)}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Keluar
              </IonButton>
            </div>

            <IonAlert
              isOpen={showLogout}
              header="Konfirmasi"
              message="Apakah kamu yakin ingin keluar?"
              buttons={[
                { text: 'Batal', role: 'cancel', handler: () => setShowLogout(false) },
                { text: 'Keluar', role: 'confirm', handler: handleLogout },
              ]}
              onDidDismiss={() => setShowLogout(false)}
            />

          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Profile;