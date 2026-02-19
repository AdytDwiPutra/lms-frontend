import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonSearchbar,
  IonSkeletonText, IonModal, IonButton, IonSpinner, IonAlert,
} from '@ionic/react';
import { peopleOutline, addOutline, trashOutline, closeOutline } from 'ionicons/icons';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { authService } from '../services/auth.service';
import './Dashboard.css';
import './Modules.css';
import './Peserta.css';
import CONFIG from '../config';

const Peserta: React.FC = () => {
  const user                          = authService.me();
  const [peserta, setPeserta]         = useState<any[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [error, setError]             = useState('');
  const [form, setForm]               = useState({
    name: '', email: '', password: '', role: 'peserta',
  });

  const fetchPeserta = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users', { params: { role: 'peserta', search } });
      setPeserta(res.data.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPeserta(); }, [search]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Semua field wajib diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await API.post('/users', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'peserta' });
      fetchPeserta();
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(', ') as string);
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/users/${id}`);
      fetchPeserta();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="peserta" />
        <div className="main-content">
          <IonContent className="dashboard-content">

            {/* Header */}
            <div className="page-header">
              <div>
                <h1>Peserta</h1>
                <p>Manajemen data peserta</p>
              </div>
              {user?.role === 'admin' && (
                <button className="add-btn" onClick={() => setShowModal(true)}>
                  <IonIcon icon={addOutline} /> Tambah
                </button>
              )}
            </div>

            {/* Search */}
            <div className="search-bar">
              <IonSearchbar
                value={search}
                onIonInput={(e) => setSearch(e.detail.value!)}
                placeholder="Cari peserta..."
                debounce={400}
              />
            </div>

            {/* List */}
            <div style={{ padding: '12px 16px' }}>
              {loading
                ? [1, 2, 3, 4].map((i) => (
                    <div key={i} className="peserta-item">
                      <IonSkeletonText animated style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <IonSkeletonText animated style={{ width: '60%', height: 14, marginBottom: 6 }} />
                        <IonSkeletonText animated style={{ width: '40%', height: 12 }} />
                      </div>
                    </div>
                  ))
                : peserta.length === 0
                ? (
                    <div className="empty-state">
                      <IonIcon icon={peopleOutline} />
                      <p>Tidak ada peserta ditemukan</p>
                    </div>
                  )
                : peserta.map((p) => (
                    <div key={p.id} className="peserta-item">
                      <img
                        src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=1a237e&color=fff&size=44`}
                        alt={p.name}
                        className="peserta-avatar"
                      />
                      <div style={{ flex: 1 }}>
                        <div className="peserta-name">{p.name}</div>
                        <div className="peserta-email">{p.email}</div>
                      </div>
                      <span className="peserta-badge">Peserta</span>
                      {user?.role === 'admin' && (
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteId(p.id)}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      )}
                    </div>
                  ))
              }
            </div>

            {/* Modal Tambah Peserta */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
              <div className="modal-container">
                <div className="modal-header">
                  <h2>Tambah Peserta</h2>
                  <button onClick={() => setShowModal(false)}>
                    <IonIcon icon={closeOutline} />
                  </button>
                </div>

                {error && <div className="error-box" style={{ margin: '0 0 16px' }}>{error}</div>}

                <div className="modal-body">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="Masukkan email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="form-input"
                    >
                      <option value="peserta">Peserta</option>
                      <option value="pemateri">Pemateri</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <IonButton fill="outline" onClick={() => setShowModal(false)}>Batal</IonButton>
                  <IonButton onClick={handleSave} disabled={saving}>
                    {saving ? <IonSpinner name="crescent" /> : 'Simpan'}
                  </IonButton>
                </div>
              </div>
            </IonModal>

            {/* Alert Hapus */}
            <IonAlert
              isOpen={deleteId !== null}
              header="Konfirmasi"
              message="Apakah kamu yakin ingin menghapus peserta ini?"
              buttons={[
                { text: 'Batal', role: 'cancel', handler: () => setDeleteId(null) },
                { text: 'Hapus', role: 'confirm', handler: () => { handleDelete(deleteId!); setDeleteId(null); } },
              ]}
              onDidDismiss={() => setDeleteId(null)}
            />

          </IonContent>
        </div>
      </div>
    </IonPage>
  );
};

export default Peserta;