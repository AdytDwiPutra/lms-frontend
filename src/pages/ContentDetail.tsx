import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonIcon, IonSkeletonText,
  IonBadge, IonRefresher, IonRefresherContent,
} from '@ionic/react';
import {
  arrowBackOutline, bookOutline, videocamOutline,
  helpCircleOutline, checkmarkCircleOutline, timeOutline,
} from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { contentService } from '../services/content.service';
import './ContentDetail.css';
import CONFIG from '../config';

const iconMap: any = {
  materi: bookOutline,
  video:  videocamOutline,
  quiz:   helpCircleOutline,
};

const colorMap: any = {
  materi: '#1a237e',
  video:  '#6a1b9a',
  quiz:   '#e65100',
};

const ContentDetail: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const history    = useHistory();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await contentService.getContent(parseInt(id));
      setContent(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, [id]);

  const handleRefresh = async (e: any) => {
    await fetchContent();
    e.detail.complete();
  };

  return (
    <IonPage>
      <IonContent className="content-detail-page">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Hero */}
        <div
          className="content-detail-hero"
          style={{ background: content ? colorMap[content.type] : '#1a237e' }}
        >
          <button className="back-btn" onClick={() => history.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>

          {loading ? (
            <>
              <IonSkeletonText animated style={{ width: '40%', height: 20, marginBottom: 12 }} />
              <IonSkeletonText animated style={{ width: '70%', height: 28 }} />
            </>
          ) : (
            <>
              {/* Thumbnail */}
              {content?.thumbnail && (
                <img
                  src={`${CONFIG.STORAGE_URL}/${content.thumbnail}`}
                  alt={content.title}
                  className="content-detail-thumb"
                />
              )}

              <div className="content-detail-type">
                <div
                  className="content-type-icon"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <IonIcon icon={iconMap[content?.type]} />
                </div>
                <span>{content?.type?.toUpperCase()}</span>
              </div>

              <h1>{content?.title}</h1>

              <div className="content-detail-meta">
                <span>
                  <IonIcon icon={timeOutline} />
                  {new Date(content?.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
                <span>
                  Oleh {content?.author?.name}
                </span>
                {content?.is_published && (
                  <span className="published-badge">
                    <IonIcon icon={checkmarkCircleOutline} /> Published
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Module Info */}
        {!loading && content?.module && (
          <div className="content-module-info">
            <IonIcon icon={bookOutline} />
            <span>Bagian dari modul <strong>{content.module.title}</strong></span>
          </div>
        )}

        {/* Body */}
        <div className="content-detail-body">
          {loading ? (
            <>
              <IonSkeletonText animated style={{ width: '100%', height: 16, marginBottom: 8 }} />
              <IonSkeletonText animated style={{ width: '90%', height: 16, marginBottom: 8 }} />
              <IonSkeletonText animated style={{ width: '95%', height: 16, marginBottom: 8 }} />
              <IonSkeletonText animated style={{ width: '80%', height: 16, marginBottom: 8 }} />
              <IonSkeletonText animated style={{ width: '85%', height: 16 }} />
            </>
          ) : (
            <div
              className="content-body-text"
              dangerouslySetInnerHTML={{ __html: content?.body?.replace(/\n/g, '<br/>') }}
            />
          )}
        </div>

        {/* Navigation */}
        {!loading && (
          <div className="content-nav">
            <button
              className="content-nav-btn"
              onClick={() => history.goBack()}
            >
              <IonIcon icon={arrowBackOutline} /> Kembali ke Modul
            </button>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default ContentDetail;