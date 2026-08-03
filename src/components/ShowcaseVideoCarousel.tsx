import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  showcaseVideosDb,
  showcaseSettingsDb,
  propertiesDb,
  franchiseDb,
  businessDb,
  notifyDataChanged,
  addShowcaseVideo,
} from '../db/marketplaceDb';
import type { ShowcaseVideo } from '../db/marketplaceDb';
import {
  FaPlay,
  FaPause,
  FaVolumeMute,
  FaVolumeUp,
  FaUpload,
  FaLink,
  FaExpand,
  FaTimes,
  FaFilm,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaExternalLinkAlt
} from 'react-icons/fa';

// ── helpers ──────────────────────────────────────────────────────────────────

const getLinkedItem = (video: ShowcaseVideo) => {
  if (!video.linkedId) return null;
  switch (video.linkedCategory) {
    case 'Property':
      return propertiesDb.find((p) => p.id === video.linkedId) || null;
    case 'Franchise':
      return franchiseDb.find((f) => f.id === video.linkedId) || null;
    case 'Business':
      return businessDb.find((b) => b.id === video.linkedId) || null;
    default:
      return null;
  }
};

const getLocation = (video: ShowcaseVideo): string | null => {
  const item = getLinkedItem(video);
  if (!item) return null;
  if ('city' in item && 'state' in item) {
    return `${(item as any).city}, ${(item as any).state}`;
  }
  if ('location' in item) return (item as any).location;
  return null;
};

const getPrice = (video: ShowcaseVideo): string | null => {
  const item = getLinkedItem(video);
  if (!item) return null;
  if ('priceDisplay' in item) return (item as any).priceDisplay;
  if ('investmentDisplay' in item) return (item as any).investmentDisplay;
  return null;
};

// YouTube Link Parser & Embed Helper
const getYouTubeEmbedUrl = (url: string, autoplay = true, muted = true): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&enablejsapi=1&rel=0`;
  }
  return null;
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Property: { bg: '#10B981', text: '#fff' },
  Franchise: { bg: '#6366F1', text: '#fff' },
  Business: { bg: '#F59E0B', text: '#fff' },
  None: { bg: '#64748B', text: '#fff' },
};

// ── main component ─────────────────────────────────────────────────────────────

export const ShowcaseVideoCarousel: React.FC<{
  onNavigate: (page: string) => void;
  onPropertyClick?: (id: string) => void;
}> = ({ onNavigate, onPropertyClick }) => {
  const [activeVideos, setActiveVideos] = useState<ShowcaseVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Upload / Link Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<'upload' | 'link'>('link');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'Property' | 'Franchise' | 'Business' | 'None'>('Property');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Data Loader
  const loadVideos = useCallback(() => {
    const filtered = [...showcaseVideosDb]
      .filter((v) => v.status === 'Active')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    // Fallback default videos if database is empty
    if (filtered.length === 0) {
      const defaults: ShowcaseVideo[] = [
        {
          id: 'sv1',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          title: 'Luxury Sky Villa & Penthouse Showcase',
          linkedCategory: 'Property',
          linkedId: 'prop-c-guntur-1',
          displayOrder: 1,
          status: 'Active',
          thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
          createdDate: new Date().toLocaleDateString()
        },
        {
          id: 'sv2',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          title: 'Prime Commercial Office Complex',
          linkedCategory: 'Property',
          linkedId: 'prop-c-guntur-2',
          displayOrder: 2,
          status: 'Active',
          thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
          createdDate: new Date().toLocaleDateString()
        },
        {
          id: 'sv3',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
          title: 'CRDA Approved Plotting Township',
          linkedCategory: 'Property',
          linkedId: 'prop-c-guntur-3',
          displayOrder: 3,
          status: 'Active',
          thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
          createdDate: new Date().toLocaleDateString()
        }
      ];
      setActiveVideos(defaults);
      return;
    }

    setActiveVideos(filtered);
    setCurrentIndex((prev) => (prev >= filtered.length ? 0 : prev));
  }, []);

  useEffect(() => {
    loadVideos();
    const handler = () => loadVideos();
    window.addEventListener('nexopp_data_changed', handler);
    return () => window.removeEventListener('nexopp_data_changed', handler);
  }, [loadVideos]);

  // Navigation
  const goTo = useCallback(
    (idx: number) => {
      if (isTransitioning || activeVideos.length === 0) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(idx);
        setIsTransitioning(false);
        setIsPlaying(true);
      }, 300);
    },
    [isTransitioning, activeVideos.length]
  );

  const goNext = useCallback(() => {
    if (activeVideos.length === 0) return;
    goTo((currentIndex + 1) % activeVideos.length);
  }, [activeVideos.length, currentIndex, goTo]);

  const goPrev = useCallback(() => {
    if (activeVideos.length === 0) return;
    goTo((currentIndex - 1 + activeVideos.length) % activeVideos.length);
  }, [activeVideos.length, currentIndex, goTo]);

  // Toggle Video Controls
  const togglePlayPause = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      video.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  // Upload/Paste Submission Handler
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let finalVideoUrl = newVideoUrl.trim();

    if (uploadTab === 'upload' && uploadFile) {
      // Local Object URL for uploaded video file
      finalVideoUrl = URL.createObjectURL(uploadFile);
    }

    if (!finalVideoUrl) {
      alert('Please select a video file or paste a valid video URL!');
      setIsSubmitting(false);
      return;
    }

    const newVideoItem: ShowcaseVideo = {
      id: `sv-user-${Date.now()}`,
      videoUrl: finalVideoUrl,
      title: newVideoTitle.trim() || (uploadFile ? uploadFile.name : 'User Uploaded Showcase Video'),
      linkedCategory: newCategory,
      displayOrder: activeVideos.length + 1,
      status: 'Active',
      createdDate: new Date().toLocaleDateString()
    };

    // Update PostgreSQL DB via API handler
    addShowcaseVideo(newVideoItem);

    setIsSubmitting(false);
    setSuccessMessage('✓ Video added successfully to Showcase Carousel!');
    setTimeout(() => {
      setShowUploadModal(false);
      setSuccessMessage('');
      setNewVideoTitle('');
      setNewVideoUrl('');
      setUploadFile(null);
      setCurrentIndex(0);
    }, 1200);
  };

  const currentVideo = activeVideos[currentIndex] || activeVideos[0];
  const location = currentVideo ? getLocation(currentVideo) : null;
  const price = currentVideo ? getPrice(currentVideo) : null;
  const catColor = currentVideo ? (categoryColors[currentVideo.linkedCategory] || categoryColors.None) : categoryColors.None;
  const ytEmbed = currentVideo ? getYouTubeEmbedUrl(currentVideo.videoUrl, isPlaying, isMuted) : null;

  return (
    <section
      style={{
        width: '100%',
        backgroundColor: '#F8FAFC',
        padding: '20px 0 40px',
        position: 'relative',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
    >
      {/* Container */}
      <div ref={containerRef} style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>

        {/* 16:9 Video Box (No black glare or text blocking video) */}
        <div
          className="showcase-video-box"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: '#000000',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0'
          }}
        >
          {activeVideos.length > 0 && currentVideo ? (
            ytEmbed ? (
              // 1. YouTube 16:9 IFrame Player
              <iframe
                key={currentVideo.id}
                src={ytEmbed}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2
                }}
              />
            ) : (
              // 2. HTML5 Video Player (MP4 / WebM / Blob)
              <video
                key={currentVideo.id}
                ref={(el) => { videoRefs.current[currentIndex] = el; }}
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80'}
                autoPlay={isPlaying}
                muted={isMuted}
                loop
                playsInline
                controls
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 2,
                  backgroundColor: '#000000'
                }}
                onError={(e) => {
                  // Fallback video source if primary URL fails
                  const v = e.currentTarget;
                  v.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                }}
              />
            )
          ) : (
            // 3. Fallback Video Placeholder
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
              <FaFilm style={{ fontSize: '48px', marginBottom: '16px', color: '#10B981' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>No Video Loaded</div>
            </div>
          )}

          {/* Navigation Overlay Arrows (Discreet) */}
          {activeVideos.length > 1 && (
            <>
              <button
                onClick={goPrev}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <FaChevronLeft style={{ fontSize: '14px' }} />
              </button>

              <button
                onClick={goNext}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <FaChevronRight style={{ fontSize: '14px' }} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Dots Navigation */}
        {activeVideos.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
            {activeVideos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                style={{
                  width: idx === currentIndex ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: idx === currentIndex ? '#10B981' : 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

      </div>

      {/* ================= UPLOAD / PASTE LINK MODAL ================= */}
      {showUploadModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              color: '#FFFFFF'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>🎥</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  Upload / Add Showcase Video
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddVideoSubmit} style={{ padding: '24px' }}>
              
              {/* Tab Selector: Upload File vs Paste Link */}
              <div style={{ display: 'flex', backgroundColor: '#0F172A', padding: '4px', borderRadius: '14px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setUploadTab('link')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: uploadTab === 'link' ? '#10B981' : 'transparent',
                    color: uploadTab === 'link' ? '#FFFFFF' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FaLink /> Paste Video Link (YouTube / MP4)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab('upload')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: uploadTab === 'upload' ? '#10B981' : 'transparent',
                    color: uploadTab === 'upload' ? '#FFFFFF' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <FaUpload /> Direct Video Upload
                </button>
              </div>

              {/* Title Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Video Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 BHK Luxury Apartment Walkthrough"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {uploadTab === 'link' ? (
                /* Link Field */
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Video URL (YouTube or Direct MP4 Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://.../video.mp4"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#0F172A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Paste YouTube watch links or MP4/WebM video file URLs.
                  </span>
                </div>
              ) : (
                /* File Input */
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Select Video File from Computer
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#0F172A',
                      border: '1px dashed #10B981',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxSizing: 'border-box'
                    }}
                  />
                  {uploadFile && (
                    <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '6px', fontWeight: 700 }}>
                      Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </div>
                  )}
                </div>
              )}

              {/* Linked Category Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Category Tag
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#0F172A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Property">Property Listing</option>
                  <option value="Franchise">Franchise Business</option>
                  <option value="Business">Commercial Business</option>
                  <option value="None">General Showcase</option>
                </select>
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div style={{ backgroundColor: '#064E3B', color: '#34D399', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCheckCircle /> {successMessage}
                </div>
              )}

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'transparent',
                    color: '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Add Video to Showcase'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowcaseVideoCarousel;
