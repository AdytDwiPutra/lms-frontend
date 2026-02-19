import React, { useState } from 'react';
import { IonIcon, IonAlert } from '@ionic/react';
import {
  gridOutline, bookOutline, peopleOutline,
  chatbubblesOutline, personOutline, settingsOutline,
  calendarOutline, logOutOutline,
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './Sidebar.css';

interface SidebarProps {
  active?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ active }) => {
  const history  = useHistory();
  const location = useLocation();
  const user     = authService.me();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard',   icon: gridOutline,        path: '/dashboard' },
    { key: 'modules',   label: 'Modul',        icon: bookOutline,        path: '/modules' },
    { key: 'peserta',   label: 'Peserta',      icon: peopleOutline,      path: '/peserta' },
    { key: 'chat',      label: 'Group Chat',   icon: chatbubblesOutline, path: '/chat' },
    { key: 'pemateri',  label: 'Pemateri',     icon: personOutline,      path: '/pemateri' },
  ];

  const bottomMenu = [
    { key: 'settings', label: 'Settings',  icon: settingsOutline, path: '/settings' },
    { key: 'kalender', label: 'Kalender',  icon: calendarOutline, path: '/kalender' },
  ];

  const isActive = (key: string) => active === key || location.pathname.startsWith(`/${key}`);

  return (
    <>
      <div className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo" onClick={() => history.push('/dashboard')}>
          <div className="sidebar-logo-icon">A</div>
          <span>adhivasindo</span>
        </div>

        {/* Main Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => history.push(item.path)}
            >
              <IonIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Menu */}
        <div className="sidebar-bottom">
          <div className="sidebar-section-label">PROFILE</div>
          {bottomMenu.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${isActive(item.key) ? 'active' : ''}`}
              onClick={() => history.push(item.path)}
            >
              <IonIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}

          {/* User Profile */}
          <div className="sidebar-profile" onClick={() => history.push('/profile')}>
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=ffffff&color=1a237e&size=36`}
              alt={user?.name}
              className="sidebar-profile-avatar"
            />
            <div className="sidebar-profile-info">
              <span className="sidebar-profile-name">{user?.name}</span>
              <span className="sidebar-profile-role">{user?.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            className="sidebar-item logout-item"
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Alert Logout */}
      <IonAlert
        isOpen={showLogoutAlert}
        header="Konfirmasi Logout"
        message="Apakah kamu yakin ingin keluar?"
        buttons={[
          {
            text: 'Batal',
            role: 'cancel',
            handler: () => setShowLogoutAlert(false),
          },
          {
            text: 'Keluar',
            role: 'confirm',
            cssClass: 'alert-button-danger',
            handler: () => {
              authService.logout();
              history.push('/login');
            },
          },
        ]}
        onDidDismiss={() => setShowLogoutAlert(false)}
      />
    </>
  );
};

export default Sidebar;