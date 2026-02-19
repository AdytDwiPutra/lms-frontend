import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, trophyOutline, calendarOutline, playCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { dashboardService } from '../services/content.service';
import { authService } from '../services/auth.service';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './DashboardNew.css';
import CONFIG from '../config';

const MODULE_COLORS = [
  { bg: '#7c3aed', light: '#ede9fe' },
  { bg: '#f97316', light: '#ffedd5' },
  { bg: '#eab308', light: '#fef9c3' },
  { bg: '#06b6d4', light: '#cffafe' },
  { bg: '#10b981', light: '#d1fae5' },
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const Dashboard: React.FC = () => {
  const history = useHistory();
  const user = authService.me();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleRefresh = async (e: any) => {
    await fetchDashboard();
    e.detail.complete();
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const featuredModule = data?.modules?.[0];

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="dashboard" />
        <div className="main-content">
          <IonContent className="dashboard-content">
            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
              <IonRefresherContent />
            </IonRefresher>

            <div className="dashboard-body">
              {/* LEFT COLUMN */}
              <div className="left-column">

                {/* Top bar */}
                <div className="top-bar">
                  <h1 className="top-bar-title">LEARNING MANAGEMENT SYSTEM</h1>
                  <div className="top-bar-right">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1a237e&color=fff`}
                      alt="avatar"
                      className="top-avatar"
                    />
                  </div>
                </div>

                {/* Hero Banner */}
                {loading ? (
                  <div className="hero-banner skeleton-hero">
                    <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
                  </div>
                ) : featuredModule && (
                  <div className="hero-banner">
                    <div className="hero-content">
                      <span className="hero-tag">{featuredModule.title?.toUpperCase()}</span>
                      <h2>{featuredModule.title}</h2>
                      <p>{featuredModule.description}</p>
                      <div className="hero-meta">
                        <span>👤 Pemateri By Josef</span>
                        <span>📅 {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <button
                      className="hero-btn"
                      onClick={() => history.push(`/modules/${featuredModule.id}`)}
                    >
                      <IonIcon icon={playCircleOutline} /> MULAI LEARNING
                    </button>
                  </div>
                )}

                {/* Modul Kompetensi */}
                <div className="section-title">MODUL KOMPETENSI</div>

                <div className="modul-grid">
                  {loading
                    ? [1, 2, 3].map((i) => (
                      <div key={i} className="modul-card-wrap">
                        <IonSkeletonText animated style={{ width: '100%', height: 160, borderRadius: 12 }} />
                      </div>
                    ))
                    : data?.modules?.map((mod: any, index: number) => {
                      const color = MODULE_COLORS[index % MODULE_COLORS.length];
                      return (
                        <div key={mod.id} className="modul-card-wrap" onClick={() => history.push(`/modules/${mod.id}`)}>

                          {/* Thumbnail */}
                          <div
                            className="modul-thumb-box"
                            style={{ background: mod.thumbnail ? 'transparent' : color.bg }}
                          >
                            {mod.thumbnail && (
                              <img
                                src={`${CONFIG.STORAGE_URL}/${mod.thumbnail}`}
                                alt={mod.title}
                                className="modul-thumb-img"
                              />
                            )}
                            <div
                              className="modul-thumb-overlay"
                              style={{ background: mod.thumbnail ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.15)' }}
                            >
                              <span className="modul-thumb-title">{mod.title?.toUpperCase()}</span>
                              {mod.pemateri && (
                                <span className="modul-pemateri-name">👤 {mod.pemateri?.name}</span>
                              )}
                            </div>
                          </div>

                          {/* Materi Kompetensi */}
                          <div className="modul-kompetensi">
                            <span className="modul-kompetensi-label">MATERI KOMPETENSI</span>
                            <ul className="modul-kompetensi-list">
                              {mod.contents && mod.contents.length > 0
                                ? mod.contents.slice(0, 4).map((content: any, i: number) => (
                                  <li
                                    key={content.id}
                                    className="modul-kompetensi-item"
                                    onClick={(e) => { e.stopPropagation(); history.push(`/contents/${content.id}`); }}
                                  >
                                    {content.title}
                                  </li>
                                ))
                                : <li className="modul-kompetensi-item" style={{ color: '#cbd5e1' }}>Belum ada materi</li>
                              }
                            </ul>
                          </div>

                        </div>
                      );
                    })
                  }
                </div>

                {/* Nilai Peserta */}
                <div className="section-title" style={{ marginTop: 24 }}>NILAI PESERTA</div>

                <div className="nilai-table">
                  <div className="nilai-header">
                    <span>Rank</span>
                    <span>Name</span>
                    <span>Class</span>
                    <span>MODUL</span>
                    <span>Point</span>
                  </div>

                  {loading
                    ? [1, 2, 3].map((i) => (
                      <div key={i} className="nilai-row">
                        <IonSkeletonText animated style={{ width: '100%', height: 32 }} />
                      </div>
                    ))
                    : data?.leaderboard?.map((item: any) => (
                      <div key={item.user?.id} className="nilai-row">
                        <span className={`rank-badge rank-${item.rank}`}>
                          {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : `#${item.rank}`}
                        </span>
                        <span className="nilai-name">{item.user?.name}</span>
                        <span className="nilai-class">PEMROGRAMAN</span>
                        <span className="nilai-modul">L {item.rank}</span>
                        <span className="nilai-point">{item.total_point?.toLocaleString()} Point</span>
                      </div>
                    ))
                  }
                </div>

              </div>

              {/* RIGHT COLUMN */}
              <div className="right-column">

                {/* Greeting */}
                <div className="greeting-card">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=1a237e&color=fff&size=80`}
                    alt="avatar"
                    className="greeting-avatar"
                  />
                  <div className="greeting-text">
                    <span>SELAMAT DATANG,</span>
                    <strong>{user?.name?.toUpperCase()}</strong>
                    <small>Di LMS by Adhivasindo</small>
                  </div>
                </div>

                {/* Calendar */}
                <div className="calendar-card">
                  <div className="calendar-header">
                    <button onClick={prevMonth}><IonIcon icon={chevronBackOutline} /></button>
                    <span>{monthName}</span>
                    <button onClick={nextMonth}><IonIcon icon={chevronForwardOutline} /></button>
                  </div>

                  <div className="calendar-days-header">
                    {DAYS.map((d) => <span key={d}>{d}</span>)}
                  </div>

                  <div className="calendar-grid">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const isToday =
                        day === today.getDate() &&
                        currentDate.getMonth() === today.getMonth() &&
                        currentDate.getFullYear() === today.getFullYear();
                      return (
                        <span key={day} className={`cal-day ${isToday ? 'today' : ''}`}>
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Jadwal Pemateri */}
                <div className="jadwal-title">JADWAL PEMATERI</div>

                <div className="jadwal-list">
                  {loading
                    ? [1, 2, 3].map((i) => (
                      <div key={i} className="jadwal-item">
                        <IonSkeletonText animated style={{ width: '100%', height: 50 }} />
                      </div>
                    ))
                    : data?.schedules?.length === 0
                      ? <p style={{ color: '#94a3b8', fontSize: 13 }}>Tidak ada jadwal</p>
                      : data?.schedules?.map((sch: any, index: number) => {
                        const color = MODULE_COLORS[index % MODULE_COLORS.length];
                        return (
                          <div key={sch.id} className="jadwal-item">
                            <div className="jadwal-dot" style={{ background: color.bg }} />
                            <div className="jadwal-info">
                              <span className="jadwal-name">{sch.title}</span>
                              <span className="jadwal-time">
                                {new Date(sch.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {new Date(sch.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                {' With mr.'}{sch.pemateri?.name?.split(' ')[0]}
                              </span>
                            </div>
                            <IonIcon icon={chevronForwardOutline} className="jadwal-arrow" />
                          </div>
                        );
                      })
                  }
                </div>

                {/* Thumbnail Image */}
                <div className="right-thumb">
                  <img
                    src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80"
                    alt="coding"
                    style={{ width: '100%', borderRadius: 12, objectFit: 'cover', height: 140 }}
                  />
                </div>

              </div>
            </div>

          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Dashboard;