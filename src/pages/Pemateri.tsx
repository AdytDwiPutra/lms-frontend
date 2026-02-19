import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonSearchbar,
  IonSkeletonText, IonModal, IonButton, IonSpinner, IonAlert,
} from '@ionic/react';
import { personOutline, addOutline, trashOutline, closeOutline, createOutline } from 'ionicons/icons';
import Sidebar from '../components/Sidebar';
import API from '../services/api';
import { authService } from '../services/auth.service';
import './Dashboard.css';
import './Modules.css';
import './Peserta.css';
import CONFIG from '../config';

const Pemateri: React.FC = () => {
  const user                          = authService.me();
  const [pemateri, setPemateri]       = useState<any[]>([]);
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [editData, setEditData]       = useState<any>(null);
  const [error, setError]             = useState('');
  const [form, setForm]               = useState({ name: '', email: '', password: '', role: 'pemateri' });

  const fetchPemateri = async () => {
    setLoading(true);
    try {
      const res = await API.get('/users', { params: { role: 'pemateri', search } });
      setPemateri(res.data.data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPemateri(); }, [search]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ name: '', email: '', password: '', role: 'pemateri' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditData(p);
    setForm({ name: p.name, email: p.email, password: '', role: p.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setError('Nama dan email wajib diisi');
      return;
    }
    if (!editData && !form.password) {
      setError('Password wajib diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editData) {
        await API.put(`/users/${editData.id}`, {
          name:  form.name,
          email: form.email,
          role:  form.role,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await API.post('/users', form);
      }
      setShowModal(false);
      fetchPemateri();
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
      fetchPemateri();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="pemateri" />
        <div className="main-content">
          <IonContent className="dashboard-content">

            <div className="page-header">
              <div>
                <h1>Pemateri</h1>
                <p>Manajemen data pemateri</p>
              </div>
              {user?.role === 'admin' && (
                <button className="add-btn" onClick={openAdd}>
                  <IonIcon icon={addOutline} /> Tambah
                </button>
              )}
            </div>

            <div className="search-bar">
              <IonSearchbar
                value={search}
                onIonInput={(e) => setSearch(e.detail.value!)}
                placeholder="Cari pemateri..."
                debounce={400}
              />
            </div>

            <div style={{ padding: '12px 16px' }}>
              {loading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="peserta-item">
                      <IonSkeletonText animated style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <IonSkeletonText animated style={{ width: '60%', height: 14, marginBottom: 6 }} />
                        <IonSkeletonText animated style={{ width: '40%', height: 12 }} />
                      </div>
                    </div>
                  ))
                : pemateri.length === 0
                ? (
                    <div className="empty-state">
                      <IonIcon icon={personOutline} />
                      <p>Tidak ada pemateri ditemukan</p>
                    </div>
                  )
                : pemateri.map((p) => (
                    <div key={p.id} className="peserta-item">
                      <img
                        src={p.avatar || `https://ui-avatars.com/api/?name=${p.name}&background=6a1b9a&color=fff&size=44`}
                        alt={p.name}
                        className="peserta-avatar"
                      />
                      <div style={{ flex: 1 }}>
                        <div className="peserta-name">{p.name}</div>
                        <div className="peserta-email">{p.email}</div>
                      </div>
                      <span className="peserta-badge" style={{ background: '#f3e5f5', color: '#6a1b9a' }}>
                        Pemateri
                      </span>
                      {user?.role === 'admin' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="icon-btn edit" onClick={() => openEdit(p)}>
                            <IonIcon icon={createOutline} />
                          </button>
                          <button className="icon-btn delete" onClick={() => setDeleteId(p.id)}>
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
              }
            </div>

            {/* Modal Tambah/Edit */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
              <div className="modal-container">
                <div className="modal-header">
                  <h2>{editData ? 'Edit Pemateri' : 'Tambah Pemateri'}</h2>
                  <button onClick={() => setShowModal(false)}>
                    <IonIcon icon={closeOutline} />
                  </button>
                </div>

                {error && <div className="error-box">{error}</div>}

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
                    <label>{editData ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}</label>
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
              message="Apakah kamu yakin ingin menghapus pemateri ini?"
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

export default Pemateri;