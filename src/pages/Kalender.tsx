import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonIcon, IonSkeletonText } from '@ionic/react';
import {
  chevronBackOutline, chevronForwardOutline,
  locationOutline, timeOutline, personOutline,
} from 'ionicons/icons';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import './Dashboard.css';
import './Kalender.css';

const DAYS   = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

const COLORS = ['#7c3aed','#f97316','#eab308','#06b6d4','#10b981','#ef4444','#ec4899'];

const Kalender: React.FC = () => {
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDay, setSelectedDay]   = useState<number | null>(new Date().getDate());
  const [schedules, setSchedules]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  const today      = new Date();
  const daysInMonth   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay      = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const res = await API.get('/schedules');
        setSchedules(res.data.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Jadwal yang ada di bulan ini
  const schedulesThisMonth = schedules.filter((s) => {
    const d = new Date(s.start_time);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  // Hari yang punya jadwal
  const scheduleDays = schedulesThisMonth.map((s) => new Date(s.start_time).getDate());

  // Jadwal di hari yang dipilih
  const selectedSchedules = selectedDay
    ? schedulesThisMonth.filter((s) => new Date(s.start_time).getDate() === selectedDay)
    : [];

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="kalender" />
        <div className="main-content">
          <IonContent className="dashboard-content">

            <div className="page-header">
              <div>
                <h1>Kalender</h1>
                <p>Jadwal kegiatan pembelajaran</p>
              </div>
            </div>

            <div className="kalender-wrapper">

              {/* Calendar Card */}
              <div className="kalender-card">
                {/* Header */}
                <div className="kalender-header">
                  <button onClick={prevMonth}>
                    <IonIcon icon={chevronBackOutline} />
                  </button>
                  <span>{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                  <button onClick={nextMonth}>
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>

                {/* Day Names */}
                <div className="kalender-days-header">
                  {DAYS.map((d) => <span key={d}>{d}</span>)}
                </div>

                {/* Grid */}
                <div className="kalender-grid">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <span key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasSchedule = scheduleDays.includes(day);
                    const isSelected  = selectedDay === day;
                    return (
                      <div
                        key={day}
                        className={`kalender-day ${isToday(day) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDay(day)}
                      >
                        {day}
                        {hasSchedule && <span className="schedule-dot" />}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="kalender-legend">
                  <span className="legend-dot today-dot" /> Hari ini
                  <span className="legend-dot schedule-legend-dot" /> Ada jadwal
                </div>
              </div>

              {/* Schedule List */}
              <div className="jadwal-panel">
                <h3>
                  {selectedDay
                    ? `Jadwal ${selectedDay} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                    : 'Semua Jadwal'
                  }
                </h3>

                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="jadwal-card">
                      <IonSkeletonText animated style={{ width: '100%', height: 80 }} />
                    </div>
                  ))
                ) : selectedSchedules.length === 0 ? (
                  <div className="jadwal-empty">
                    <p>Tidak ada jadwal di hari ini</p>
                  </div>
                ) : (
                  selectedSchedules.map((s, index) => (
                    <div key={s.id} className="jadwal-card">
                      <div className="jadwal-card-bar" style={{ background: COLORS[index % COLORS.length] }} />
                      <div className="jadwal-card-content">
                        <h4>{s.title}</h4>
                        <div className="jadwal-card-meta">
                          <span><IonIcon icon={timeOutline} />
                            {new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(s.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span><IonIcon icon={locationOutline} /> {s.location}</span>
                          {s.pemateri && (
                            <span><IonIcon icon={personOutline} /> {s.pemateri.name}</span>
                          )}
                        </div>
                        {s.module && (
                          <span className="jadwal-card-module">{s.module.title}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Semua jadwal bulan ini */}
                {!selectedDay && !loading && schedulesThisMonth.length > 0 && (
                  schedulesThisMonth.map((s, index) => (
                    <div key={s.id} className="jadwal-card">
                      <div className="jadwal-card-bar" style={{ background: COLORS[index % COLORS.length] }} />
                      <div className="jadwal-card-content">
                        <h4>{s.title}</h4>
                        <div className="jadwal-card-meta">
                          <span><IonIcon icon={timeOutline} />
                            {new Date(s.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span><IonIcon icon={locationOutline} /> {s.location}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Kalender;