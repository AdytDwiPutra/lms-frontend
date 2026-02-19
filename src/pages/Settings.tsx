import React from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './ComingSoon.css';

const Settings: React.FC = () => {
  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="settings" />
        <div className="main-content">
          <IonContent className="dashboard-content">
            <div className="page-header">
              <div>
                <h1>Settings</h1>
                <p>Pengaturan aplikasi</p>
              </div>
            </div>
            <div className="coming-soon">
              <IonIcon icon={settingsOutline} />
              <h2>Coming Soon</h2>
              <p>Halaman ini sedang dalam pengembangan</p>
            </div>
          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Settings;