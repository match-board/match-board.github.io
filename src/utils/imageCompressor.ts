/**
 * Client-side logo compressor using FileReader API and HTML5 Canvas.
 * Downscales uploaded team logos to a max dimension (default 128px)
 * to keep localStorage and URL state compact while preserving transparency.
 */
export function downscaleLogoImage(file: File, maxDimension: number = 128): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not a valid image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty image data.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Use WebP for high compression with alpha channel, fallback to PNG
          let compressed = canvas.toDataURL('image/webp', 0.85);
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/png');
          }
          resolve(compressed);
        } catch (err) {
          reject(err);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
