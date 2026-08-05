/**
 * High-performance client-side image compression utility.
 * Reduces raw 5-15MB camera/phone photos to ~100KB-200KB JPEGs.
 * Prevents HTTP 413 Payload Too Large and LocalStorage QuotaExceededError.
 */
export const compressImage = (
  fileOrDataUrl: File | string,
  maxWidth = 1200,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) return resolve('');

    if (typeof fileOrDataUrl === 'string') {
      if (!fileOrDataUrl.startsWith('data:image')) return resolve(fileOrDataUrl);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(fileOrDataUrl);
          }
        } catch (e) {
          resolve(fileOrDataUrl);
        }
      };
      img.onerror = () => resolve(fileOrDataUrl);
      img.src = fileOrDataUrl;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return resolve('');

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(dataUrl);
          }
        } catch (err) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(fileOrDataUrl);
  });
};
