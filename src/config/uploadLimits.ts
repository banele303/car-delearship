// Centralized (non-env) upload limits for car photos.
// Tuned for up to 34 high-resolution car photos.
// After client-side WebP compression each image is typically 150–600 KB,
// so 34 images ≈ 5–20 MB total → very manageable for S3 one-at-a-time uploads.

export const CAR_UPLOAD_MAX_FILES: number = 34;       // max number of photos per car
export const CAR_UPLOAD_SINGLE_MAX_MB: number = 10;    // single file limit in MB (after compression)
export const CAR_UPLOAD_TOTAL_MAX_MB: number = 200;    // total batch limit in MB (generous safety net)

export function describeCarUploadLimits() {
  return {
    maxFiles: CAR_UPLOAD_MAX_FILES,
    maxSingleMB: CAR_UPLOAD_SINGLE_MAX_MB,
    maxTotalMB: CAR_UPLOAD_TOTAL_MAX_MB,
    totalDisabled: CAR_UPLOAD_TOTAL_MAX_MB === 0,
  };
}
