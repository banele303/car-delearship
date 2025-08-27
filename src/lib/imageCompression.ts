// Simple in-browser image compression utility.
// Uses canvas to resize large images and reduce JPEG quality.
// Falls back to original file if anything fails.
export interface CompressOptions {
  maxWidth?: number; // target maximum width in pixels
  maxHeight?: number; // target maximum height in pixels
  quality?: number; // JPEG/WebP quality 0-1
  mimeType?: string; // override output mime type
  minCompressBytes?: number; // only attempt if file size >= this (default 400KB)
}

const isImageType = (type: string) => /image\/(jpeg|jpg|png|webp|avif)/i.test(type);

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  try {
    if (!isImageType(file.type)) return file;
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.82,
      mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      minCompressBytes = 400 * 1024,
    } = opts;
    if (file.size < minCompressBytes) return file; // small enough already

    const bitmapOrImg: ImageBitmap | HTMLImageElement = await (async () => {
      try {
        return await createImageBitmap(file);
      } catch {
        // Fallback: load into an image element
        const dataUrl = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result as string);
          fr.onerror = () => rej(fr.error);
          fr.readAsDataURL(file);
        });
        const imgEl: HTMLImageElement = await new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => res(img);
          img.onerror = (e) => rej(e);
          img.src = dataUrl;
        });
        return imgEl;
      }
    })();

    let srcW: number; let srcH: number;
    if ('width' in bitmapOrImg && 'height' in bitmapOrImg && !(bitmapOrImg instanceof HTMLImageElement)) {
      // ImageBitmap
      srcW = (bitmapOrImg as ImageBitmap).width;
      srcH = (bitmapOrImg as ImageBitmap).height;
    } else {
      const img = bitmapOrImg as HTMLImageElement;
      srcW = img.naturalWidth || img.width;
      srcH = img.naturalHeight || img.height;
    }
    let targetW = srcW;
    let targetH = srcH;
    // scale preserving aspect ratio
    if (srcW > maxWidth || srcH > maxHeight) {
      const ratio = Math.min(maxWidth / srcW, maxHeight / srcH);
      targetW = Math.round(srcW * ratio);
      targetH = Math.round(srcH * ratio);
    }
    // If no dimension changed and file already < 1.5MB skip recompress (avoid quality loss)
    if (targetW === srcW && targetH === srcH && file.size < 1.5 * 1024 * 1024) return file;

    const canvas = document.createElement('canvas');
    canvas.width = targetW; canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    (ctx as any).imageSmoothingQuality = 'high';
  ctx.drawImage(bitmapOrImg as any, 0, 0, targetW, targetH);
    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, mimeType, quality));
    if (!blob) return file;
    // Only keep if actually smaller
    if (blob.size >= file.size * 0.95) return file; // not worth it
    const newName = file.name.replace(/(\.[a-z0-9]+)?$/i, (ext) => `-cmp${ext || '.jpg'}`);
    return new File([blob], newName, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file; // fallback
  }
}

export async function batchCompress(files: File[], onProgress?: (done: number, total: number, name: string) => void, opts?: CompressOptions) {
  const out: File[] = [];
  let done = 0;
  for (const f of files) {
    const compressed = await compressImage(f, opts);
    out.push(compressed);
    done++;
    onProgress?.(done, files.length, f.name);
  }
  return out;
}
