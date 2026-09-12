import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FolderDown,
  XCircle,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RefreshCcw,
} from 'lucide-react';
import JSZip from 'jszip';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
  onDownloadZip?: () => Promise<void>;
  isDownloadingZip?: boolean;
  zipProgress?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  initialIndex = 0,
  title = 'Photo Preview',
  onClose,
  onDownloadZip,
  isDownloadingZip = false,
  zipProgress = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [internalDownloadingZip, setInternalDownloadingZip] = useState(false);
  const [internalZipProgress, setInternalZipProgress] = useState('');

  // Sync index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Reset zoom & rotation when changing photos
  useEffect(() => {
    setRotation(0);
    setZoom(1);
  }, [currentIndex]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      } else if (e.key.toLowerCase() === 'r') {
        setRotation((r) => (r + 90) % 360);
      } else if (e.key === '+' || e.key === '=') {
        setZoom((z) => Math.min(z + 0.25, 3));
      } else if (e.key === '-' || e.key === '_') {
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setZoom(1);
        setRotation(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  // Prevent background scrolling while open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (images.length === 0) return null;

  const currentUrl = images[currentIndex];

  const getCleanExtension = (url: string, blob?: Blob) => {
    const keyMatch = url.match(/key=([^&]+)/i);
    if (keyMatch && keyMatch[1] && keyMatch[1].includes('.')) {
      const ext = keyMatch[1].split('.').pop()?.toLowerCase();
      if (ext && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext)) {
        return ext === 'jpeg' ? 'jpg' : ext;
      }
    }
    const dotMatch = url.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
    if (dotMatch && dotMatch[1] && ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(dotMatch[1].toLowerCase())) {
      return dotMatch[1].toLowerCase() === 'jpeg' ? 'jpg' : dotMatch[1].toLowerCase();
    }
    if (blob && blob.type) {
      if (blob.type.includes('png')) return 'png';
      if (blob.type.includes('webp')) return 'webp';
      if (blob.type.includes('avif')) return 'avif';
      if (blob.type.includes('gif')) return 'gif';
    }
    return 'jpg';
  };

  const handleDownloadSingle = async () => {
    if (!currentUrl) return;
    try {
      const res = await fetch(currentUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const ext = getCleanExtension(currentUrl, blob);
      const cleanTitle = (title || 'Photo').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      const filename = `${cleanTitle}_Photo_${currentIndex + 1}.${ext}`;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (_) {
      window.open(currentUrl, '_blank');
    }
  };

  const handleInternalZip = async () => {
    if (onDownloadZip) {
      await onDownloadZip();
      return;
    }
    if (images.length === 0) return;
    setInternalDownloadingZip(true);
    setInternalZipProgress(`Packing 0/${images.length}...`);
    try {
      const zip = new JSZip();
      const cleanTitle = (title || 'Photos').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
      let addedCount = 0;
      for (let i = 0; i < images.length; i++) {
        const u = images[i];
        setInternalZipProgress(`Downloading photo ${i + 1}/${images.length}...`);
        try {
          const res = await fetch(u);
          if (!res.ok) continue;
          const blob = await res.blob();
          if (blob.size > 0 && !blob.type.includes('text') && !blob.type.includes('html')) {
            const ext = getCleanExtension(u, blob);
            zip.file(`Photo_${i + 1}.${ext}`, blob, { binary: true });
            addedCount++;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (addedCount === 0) {
        alert('Could not download image files.');
        return;
      }
      setInternalZipProgress('Generating ZIP archive...');
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      const zipUrl = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${cleanTitle}_Photos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setInternalDownloadingZip(false);
      setInternalZipProgress('');
    }
  };

  const isZipLoading = isDownloadingZip || internalDownloadingZip;
  const currentZipMsg = zipProgress || internalZipProgress;

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[999999] flex items-center justify-center p-2 sm:p-4 backdrop-blur-xl animate-fadeIn select-none overflow-hidden"
      style={{ backgroundColor: 'rgba(3, 7, 18, 0.98)' }}
    >
      {/* Top Bar Controls */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-30 pointer-events-none">
        {/* Left Side Info / Tools */}
        <div className="pointer-events-auto flex items-center space-x-2">
          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-white shadow-xl backdrop-blur-md flex items-center space-x-2">
            <span className="font-bold text-xs sm:text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs">{title}</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/30">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Quick Image Manipulation Tools (Rotate / Zoom) */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-md">
            <button
              onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Rotate Left 90° (R)"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Rotate Right 90° (R)"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            {(rotation !== 0 || zoom !== 1) && (
              <button
                onClick={() => {
                  setRotation(0);
                  setZoom(1);
                }}
                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded-lg transition-colors text-[11px] font-bold flex items-center space-x-1"
                title="Reset View (0)"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="pointer-events-auto flex items-center space-x-2 sm:space-x-3">
          {images.length > 1 && (
            <button
              onClick={handleInternalZip}
              disabled={isZipLoading}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xl border border-emerald-400/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Download all photos as a ZIP archive"
            >
              <FolderDown className="h-4 w-4 shrink-0" />
              <span className="hidden xs:inline">
                {isZipLoading ? (currentZipMsg || 'Packing ZIP...') : `Download All (ZIP) (${images.length})`}
              </span>
              <span className="xs:hidden">ZIP ({images.length})</span>
            </button>
          )}

          <button
            onClick={handleDownloadSingle}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xl border border-slate-700 transition-all hover:scale-105 active:scale-95"
            title="Download this high-resolution photo"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline">Download Photo</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 bg-slate-900/90 hover:bg-rose-600 text-white rounded-xl shadow-xl border border-slate-700 transition-colors flex items-center justify-center hover:scale-105 active:scale-95"
            title="Close Preview (Esc)"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Left / Right Move Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white p-3 sm:p-4 rounded-full bg-slate-900/95 hover:bg-emerald-600 border-2 border-white/40 hover:border-emerald-400 shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-30 focus:outline-none"
            title="Previous Photo (Left Arrow Key)"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 text-white stroke-[2.5]" />
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white p-3 sm:p-4 rounded-full bg-slate-900/95 hover:bg-emerald-600 border-2 border-white/40 hover:border-emerald-400 shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-30 focus:outline-none"
            title="Next Photo (Right Arrow Key)"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 text-white stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Center Image Container */}
      <div className="relative flex flex-col items-center justify-center max-w-[95vw] max-h-[85vh] z-20">
        <div className="overflow-hidden flex items-center justify-center max-w-full max-h-[72vh] p-2">
          <img
            src={currentUrl}
            alt={`Photo ${currentIndex + 1}`}
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transition: 'transform 0.2s ease-out',
            }}
            className="max-w-full max-h-[68vh] rounded-xl object-contain shadow-2xl border border-white/10"
          />
        </div>

        {/* Mobile Tools (Rotate / Zoom on small screens) */}
        <div className="flex md:hidden items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl mt-2">
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1 text-slate-300 hover:text-white rounded-lg"
            title="Rotate"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            className="p-1 text-slate-300 hover:text-white rounded-lg"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            className="p-1 text-slate-300 hover:text-white rounded-lg"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex items-center space-x-2 pt-3 max-w-md sm:max-w-2xl overflow-x-auto p-1 scrollbar-none z-30">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-11 w-11 sm:h-14 sm:w-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-800 ${
                  idx === currentIndex
                    ? 'border-emerald-400 scale-110 shadow-lg ring-2 ring-emerald-400/60'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
                title={`Photo ${idx + 1}`}
              >
                <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
