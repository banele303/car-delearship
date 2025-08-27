// Centralized (non-env) upload limits for car photos.
// Adjust here if you need different limits.
export const CAR_UPLOAD_MAX_FILES: number = 75; // max number of photos per create request
export const CAR_UPLOAD_SINGLE_MAX_MB: number = 35; // single file size limit in MB
export const CAR_UPLOAD_TOTAL_MAX_MB: number = 400; // total batch limit in MB (set 0 to disable)

export function describeCarUploadLimits() {
  return {
    maxFiles: CAR_UPLOAD_MAX_FILES,
    maxSingleMB: CAR_UPLOAD_SINGLE_MAX_MB,
    maxTotalMB: CAR_UPLOAD_TOTAL_MAX_MB,
  totalDisabled: CAR_UPLOAD_TOTAL_MAX_MB === 0,
  };
}
