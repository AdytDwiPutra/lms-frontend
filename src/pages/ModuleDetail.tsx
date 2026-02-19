import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonSkeletonText,
  IonBadge, IonRefresher, IonRefresherContent,
  IonModal, IonButton, IonSpinner, IonAlert,
} from '@ionic/react';
import {
  arrowBackOutline, bookOutline, videocamOutline,
  helpCircleOutline, checkmarkCircleOutline, addOutline,
  trashOutline, createOutline, closeOutline, reorderFourOutline,
} from 'ionicons/icons';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useParams, useHistory } from 'react-router-dom';
import { moduleService, contentService } from '../services/content.service';
import { authService } from '../services/auth.service';
import API from '../services/api';
import './ModuleDetail.css';
import './Peserta.css';
import CONFIG from '../config';

const iconMap: any = {
  materi: bookOutline,
  video: videocamOutline,
  quiz: helpCircleOutline,
};

const colorMap: any = {
  materi: '#1a237e',
  video: '#6a1b9a',
  quiz: '#e65100',
};

const defaultForm = {
  title: '', body: '', type: 'materi', order: 0, is_published: false,
};

// Sortable Item Component
const SortableItem: React.FC<{
  content: any;
  index: number;
  canEdit: boolean;
  onEdit: (content: any) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}> = ({ content, index, canEdit, onEdit, onDelete, onView }) => {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className={`content-item ${isDragging ? 'dragging' : ''}`}>
      {/* Drag Handle */}
      {canEdit && (
        <div className="drag-handle" {...attributes} {...listeners}>
          <IonIcon icon={reorderFourOutline} />
        </div>
      )}

      <div className="content-icon" style={{ background: colorMap[content.type] }}>
        <IonIcon icon={iconMap[content.type]} />
      </div>

      <div
        className="content-info"
        style={{ flex: 1, cursor: 'pointer' }}
        onClick={() => onView(content.id)} // ← tambahkan ini
      >
        <span className="content-order">Materi {index + 1}</span>
        <h4>{content.title}</h4>
        <span className="content-type-badge">{content.type}</span>
      </div>

      {content.is_published && (
        <IonIcon icon={checkmarkCircleOutline} color="success" className="published-icon" />
      )}

      {canEdit && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn edit" onClick={() => onEdit(content)}>
            <IonIcon icon={createOutline} />
          </button>
          <button className="icon-btn delete" onClick={() => onDelete(content.id)}>
            <IonIcon icon={trashOutline} />
          </button>
        </div>
      )}
    </div>
  );
};

const ModuleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const user = authService.me();

  const [module, setModule] = useState<any>(null);
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState<any>(defaultForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchModule = async () => {
    try {
      const res = await moduleService.getModule(parseInt(id));
      const data = res.data.data;
      setModule(data);
      setContents(data.contents ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModule(); }, [id]);

  const handleRefresh = async (e: any) => {
    await fetchModule();
    e.detail.complete();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contents.findIndex((c) => c.id === active.id);
    const newIndex = contents.findIndex((c) => c.id === over.id);
    const newContents = arrayMove(contents, oldIndex, newIndex);

    // Update local state immediately
    setContents(newContents);

    // Update order di backend
    try {
      await Promise.all(
        newContents.map((content, index) => {
          const fd = new FormData();
          fd.append('order', String(index + 1));
          return API.post(`/contents/${content.id}?_method=PUT`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
      );
    } catch (err) {
      console.error('Gagal update order:', err);
      // Revert jika gagal
      fetchModule();
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
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
    setForm({ ...defaultForm, order: contents.length + 1 });
    setThumbnail(null);
    setThumbPreview('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (content: any) => {
    setEditData(content);
    setForm({
      title: content.title,
      body: content.body,
      type: content.type,
      order: content.order,
      is_published: content.is_published,
    });
    setThumbnail(null);
    setThumbPreview(content.thumbnail
      ? `${CONFIG.STORAGE_URL}/${content.thumbnail}`
      : ''
    );
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.body) {
      setError('Title dan isi materi wajib diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('module_id', id);
      fd.append('title', form.title);
      fd.append('body', form.body);
      fd.append('type', form.type);
      fd.append('order', String(form.order));
      fd.append('is_published', form.is_published ? '1' : '0');
      if (thumbnail) fd.append('thumbnail', thumbnail);

      if (editData) {
        await contentService.updateContent(editData.id, fd);
      } else {
        await contentService.createContent(fd);
      }
      setShowModal(false);
      fetchModule();
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

  const handleDelete = async (contentId: number) => {
    try {
      await contentService.deleteContent(contentId);
      fetchModule();
    } catch (err) {
      console.error(err);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'pemateri';

  return (
    <IonPage>
      <IonContent className="detail-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Hero */}
        <div className="detail-hero">
          <button className="back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>
          {loading ? (
            <IonSkeletonText animated style={{ width: '70%', height: 24 }} />
          ) : (
            <>
              <div className="detail-badge">
                <IonBadge>{module?.contents_count} Materi</IonBadge>
                <IonBadge color="success">{module?.enrollments_count} Peserta</IonBadge>
              </div>
              <h1>{module?.title}</h1>
              <p>{module?.description}</p>
            </>
          )}
        </div>

        {/* Content List */}
        <div className="content-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0 }}>Daftar Materi</h2>
              {canEdit && contents.length > 1 && (
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>
                  Drag <IonIcon icon={reorderFourOutline} /> untuk ubah urutan
                </p>
              )}
            </div>
            {canEdit && (
              <button className="add-btn-small" onClick={openAdd}>
                <IonIcon icon={addOutline} /> Tambah
              </button>
            )}
          </div>

          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="content-item">
                <IonSkeletonText animated style={{ width: '100%', height: 60 }} />
              </div>
            ))
          ) : contents.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={bookOutline} />
              <p>Belum ada materi</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={contents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {contents.map((content, index) => (
                  <SortableItem
                    key={content.id}
                    content={content}
                    index={index}
                    canEdit={canEdit}
                    onEdit={openEdit}
                    onDelete={(id) => setDeleteId(id)}
                    onView={(id) => history.push(`/contents/${id}`)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editData ? 'Edit Materi' : 'Tambah Materi'}</h2>
              <button onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="modal-body" style={{ overflowY: 'auto' }}>
              <div className="form-group">
                <label>Judul Materi</label>
                <input
                  type="text"
                  placeholder="Masukkan judul materi"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Isi Materi</label>
                <textarea
                  placeholder="Masukkan isi materi..."
                  value={form.body}
                  onChange={(e) => handleChange('body', e.target.value)}
                  className="form-input"
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label>Tipe</label>
                <select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="form-input"
                >
                  <option value="materi">Materi</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>

              <div className="form-group">
                <label>Urutan</label>
                <input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) => handleChange('order', parseInt(e.target.value))}
                  className="form-input"
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
                  id="is_published"
                  checked={form.is_published}
                  onChange={(e) => handleChange('is_published', e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="is_published" style={{ marginBottom: 0 }}>Publish materi ini</label>
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
          message="Apakah kamu yakin ingin menghapus materi ini?"
          buttons={[
            { text: 'Batal', role: 'cancel', handler: () => setDeleteId(null) },
            { text: 'Hapus', role: 'confirm', handler: () => { handleDelete(deleteId!); setDeleteId(null); } },
          ]}
          onDidDismiss={() => setDeleteId(null)}
        />

      </IonContent>
    </IonPage>
  );
};

export default ModuleDetail;