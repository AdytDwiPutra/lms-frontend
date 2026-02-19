import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonSearchbar, IonSkeletonText,
  IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
  IonRefresher, IonRefresherContent, IonModal, IonButton,
  IonSpinner, IonAlert,
} from '@ionic/react';
import {
  bookOutline, addOutline, createOutline,
  trashOutline, closeOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { moduleService } from '../services/content.service';
import { authService } from '../services/auth.service';
import API from '../services/api';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './Modules.css';
import './Peserta.css';
import CONFIG from '../config';

const Modules: React.FC = () => {
  const history = useHistory();
  const user = authService.me();

  const [modules, setModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [error, setError] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [form, setForm] = useState({ title: '', description: '', is_active: true, pemateri_id: '' });
  const [pemateriList, setPemateriList] = useState<any[]>([]);

  const fetchModules = async (currentPage: number, reset: boolean) => {
    try {
      const res = await moduleService.getModules({ search, page: currentPage, per_page: 10 });
      const responseData = res.data.data;
      const newData = responseData.data ?? responseData.modules ?? [];
      const lastPage = responseData.last_page ?? 1;

      setModules(reset ? newData : (prev) => [...prev, ...newData]);
      setHasMore(currentPage < lastPage);
    } catch (err) {
      console.error(err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };
  // Fetch pemateri list sekali saat komponen mount
  useEffect(() => {
    API.get('/users/pemateri-list').then((res) => {
      setPemateriList(res.data.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setModules([]);
    setPage(1);
    fetchModules(1, true);
  }, [search]);

  const loadMore = async (e: any) => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchModules(nextPage, false);
    e.target.complete();
  };

  const handleRefresh = async (e: any) => {
    setPage(1);
    await fetchModules(1, true);
    e.detail.complete();
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const openAdd = () => {
    setEditData(null);
    setForm({ title: '', description: '', is_active: true, pemateri_id: '' });
    setThumbnail(null);
    setThumbPreview('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (mod: any) => {
    setEditData(mod);
    setForm({
      title: mod.title,
      description: mod.description ?? '',
      is_active: mod.is_active,
      pemateri_id: mod.pemateri?.id ?? '',
    });
    setThumbnail(null);
    setThumbPreview(mod.thumbnail ? `${CONFIG.STORAGE_URL}/${mod.thumbnail}` : '');
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) { setError('Judul modul wajib diisi'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('is_active', form.is_active ? '1' : '0');
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (form.pemateri_id) fd.append('pemateri_id', form.pemateri_id);
      if (editData) {
        await moduleService.updateModule(editData.id, fd);
      } else {
        await moduleService.createModule(fd);
      }
      setShowModal(false);
      setPage(1);
      fetchModules(1, true);
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
      await moduleService.deleteModule(id);
      setPage(1);
      fetchModules(1, true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <div className="app-layout">
        <Sidebar active="modules" />
        <div className="main-content">
          <IonContent className="dashboard-content">
            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
              <IonRefresherContent />
            </IonRefresher>

            {/* Header */}
            <div className="page-header">
              <div>
                <h1>Modul</h1>
                <p>Kelola modul kompetensi</p>
              </div>
              {(user?.role === 'admin' || user?.role === 'pemateri') && (
                <button className="add-btn" onClick={openAdd}>
                  <IonIcon icon={addOutline} /> Tambah
                </button>
              )}
            </div>

            {/* Search */}
            <div className="search-bar">
              <IonSearchbar
                value={search}
                onIonInput={(e) => setSearch(e.detail.value!)}
                placeholder="Cari modul..."
                debounce={400}
              />
            </div>

            {/* List */}
            <div className="modules-list">
              {loading
                ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="module-card" style={{ margin: '0 16px 12px' }}>
                    <div style={{ width: 90, background: '#e2e8f0', minHeight: 80 }} />
                    <div style={{ flex: 1, padding: 12 }}>
                      <IonSkeletonText animated style={{ width: '80%', height: 16, marginBottom: 8 }} />
                      <IonSkeletonText animated style={{ width: '60%', height: 12 }} />
                    </div>
                  </div>
                ))
                : modules.length === 0
                  ? (
                    <div className="empty-state">
                      <IonIcon icon={bookOutline} />
                      <p>Tidak ada modul ditemukan</p>
                    </div>
                  )
                  : modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="module-card"
                      style={{ margin: '0 16px 12px' }}
                      onClick={() => history.push(`/modules/${mod.id}`)}
                    >
                      <div className="module-thumb">
                        {mod.thumbnail
                          ? <img src={`${CONFIG.STORAGE_URL}/${mod.thumbnail}`} alt={mod.title} />
                          : <div className="module-thumb-placeholder"><IonIcon icon={bookOutline} /></div>
                        }
                      </div>
                      <div className="module-info">
                        <h3>{mod.title}</h3>
                        <p>{mod.description}</p>
                        {mod.pemateri && (
                          <div className="module-pemateri">
                            <img
                              src={mod.pemateri.avatar || `https://ui-avatars.com/api/?name=${mod.pemateri.name}&background=6a1b9a&color=fff&size=24`}
                              alt={mod.pemateri.name}
                              style={{ width: 20, height: 20, borderRadius: '50%' }}
                            />
                            <span>{mod.pemateri.name}</span>
                          </div>
                        )}
                        <div className="module-meta">
                          <span>{mod.contents_count} Materi</span>
                          <span>{mod.enrollments_count} Peserta</span>
                        </div>
                      </div>
                      {(user?.role === 'admin' || user?.role === 'pemateri') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, justifyContent: 'center' }}>
                          <button
                            className="icon-btn edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openEdit(mod);
                            }}
                          >
                            <IonIcon icon={createOutline} />
                          </button>
                          <button
                            className="icon-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDeleteId(mod.id);
                            }}
                          >
                            <IonIcon icon={trashOutline} />
                          </button>
                        </div>)}
                    </div>
                  ))
              }
            </div>

            <IonInfiniteScroll onIonInfinite={loadMore} disabled={!hasMore}>
              <IonInfiniteScrollContent loadingText="Memuat lebih banyak..." />
            </IonInfiniteScroll>

            {/* Modal Tambah/Edit */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
              <div className="modal-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div className="modal-header">
                  <h2>{editData ? 'Edit Modul' : 'Tambah Modul'}</h2>
                  <button onClick={() => setShowModal(false)}>
                    <IonIcon icon={closeOutline} />
                  </button>
                </div>

                {error && <div className="error-box">{error}</div>}

                <div className="modal-body" style={{ flex: 1, overflowY: 'auto' }}>
                  <div className="form-group">
                    <label>Pemateri</label>
                    <select
                      value={form.pemateri_id}
                      onChange={(e) => handleChange('pemateri_id', e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Pilih Pemateri --</option>
                      {pemateriList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Judul Modul</label>
                    <input
                      type="text"
                      placeholder="Masukkan judul modul"
                      value={form.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Deskripsi</label>
                    <textarea
                      placeholder="Masukkan deskripsi modul..."
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="form-input"
                      rows={4}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Thumbnail (opsional)</label>
                    {thumbPreview && (
                      <img
                        src={thumbPreview}
                        alt="preview"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnail}
                      className="form-input"
                      style={{ padding: 8 }}
                    />
                  </div>

                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={form.is_active}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    <label htmlFor="is_active" style={{ marginBottom: 0 }}>Modul aktif</label>
                  </div>
                </div>

                <div className="modal-footer" style={{ flexShrink: 0 }}>
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
              message="Apakah kamu yakin ingin menghapus modul ini?"
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

export default Modules;