import JSZip from 'jszip';

export interface DownloadablePhoto {
  url?: string | null;
  imageKey?: string;
  isPrimary?: boolean;
}

type ResolvePhotoUrl = (source: string) => string;
const identity: ResolvePhotoUrl = (source) => source;
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/avif': 'avif', 'image/gif': 'gif',
};

export function photoFilename(baseName: string, extension: string): string {
  const stem = baseName.replace(/\.(jpe?g|png|webp|avif|gif)$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 80) || 'Photo';
  return `${stem}.${extension}`;
}

export async function fetchPhoto(photo: DownloadablePhoto, resolveUrl: ResolvePhotoUrl = identity) {
  const source = photo.url?.trim() || photo.imageKey?.trim();
  if (!source) throw new Error('A photo has no download link. Refresh the listing and try again.');
  const url = resolveUrl(source);
  if (!url) throw new Error('The photo link is unavailable. Refresh the listing and try again.');
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Photo download failed (HTTP ${response.status}). Refresh the listing and try again.`);
  const blob = await response.blob();
  const mime = blob.type.split(';')[0].toLowerCase();
  if (!blob.size || (mime && !extensions[mime] && mime !== 'application/octet-stream')) {
    throw new Error('The server did not return an image. Refresh the listing and try again.');
  }
  let sourceExtension = '';
  try {
    const keyMatch = source.match(/[?&]key=([^&#]+)/i);
    const filename = keyMatch ? decodeURIComponent(keyMatch[1]) : source.split(/[?#]/)[0];
    sourceExtension = filename.match(/\.(jpg|jpeg|png|webp|avif|gif)$/i)?.[1].toLowerCase() || '';
  } catch { /* A malformed key must not override the image response type. */ }
  const extension = extensions[mime] || (sourceExtension === 'jpeg' ? 'jpg' : sourceExtension) || 'jpg';
  return { blob, extension };
}

/** Only produce a ZIP when every attached photo was downloaded successfully. */
export async function createPhotoZip(
  photos: DownloadablePhoto[],
  resolveUrl: ResolvePhotoUrl = identity,
  onProgress?: (message: string) => void,
): Promise<Blob> {
  if (!photos.length) throw new Error('No photos are attached to this listing.');
  const zip = new JSZip();
  for (let index = 0; index < photos.length; index++) {
    onProgress?.(`Downloading photo ${index + 1}/${photos.length}...`);
    try {
      const { blob, extension } = await fetchPhoto(photos[index], resolveUrl);
      const name = `Photo_${index + 1}${photos[index].isPrimary ? '_PRIMARY' : ''}.${extension}`;
      zip.file(name, await blob.arrayBuffer());
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Download failed.';
      throw new Error(`Could not download photo ${index + 1} of ${photos.length}. ${detail} No incomplete ZIP was saved.`);
    }
  }
  onProgress?.('Generating ZIP archive...');
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function saveDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
