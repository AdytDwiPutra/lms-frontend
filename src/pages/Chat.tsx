import React from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { chatbubblesOutline } from 'ionicons/icons';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './ComingSoon.css';

const Chat: React.FC = () => {
  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="chat" />
        <div className="main-content">
          <IonContent className="dashboard-content">
            <div className="page-header">
              <div>
                <h1>Group Chat</h1>
                <p>Diskusi bersama peserta & pemateri</p>
              </div>
            </div>
            <div className="coming-soon">
              <IonIcon icon={chatbubblesOutline} />
              <h2>Coming Soon</h2>
              <p>Halaman ini sedang dalam pengembangan</p>
            </div>
          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Chat;