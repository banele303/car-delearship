export interface UploadResult {
  file: File;
  success: boolean;
  attempts: number;
  error?: any;
  responseStatus?: number;
}

export interface ConcurrentUploadOptions {
  concurrency?: number; // parallel uploads
  retries?: number;     // additional attempts after first failure
  baseDelayMs?: number; // base delay for exponential backoff
  onProgress?: (progress: {
    total: number;
    completed: number;
    success: number;
    failed: number;
    inFlight: number;
    currentFile?: string;
  }) => void;
  onFileStart?: (file: File, attempt: number) => void;
  onFileSuccess?: (file: File, attempt: number) => void;
  onFileFailure?: (file: File, attempt: number, error: any) => void;
}

/**
 * Runs uploads with limited concurrency & retry + backoff.
 * The worker should throw / reject to signal failure.
 */
export async function concurrentUpload(
  files: File[],
  worker: (file: File) => Promise<Response | void>,
  opts: ConcurrentUploadOptions = {}
): Promise<UploadResult[]> {
  const concurrency = Math.max(1, opts.concurrency || 3);
  const retries = Math.max(0, opts.retries ?? 2);
  const baseDelayMs = opts.baseDelayMs ?? 400;
  const queue = [...files];
  const results: UploadResult[] = [];
  let inFlight = 0;
  let completed = 0;
  let success = 0;
  let failed = 0;

  const report = (currentFile?: string) => {
    opts.onProgress?.({ total: files.length, completed, success, failed, inFlight, currentFile });
  };

  async function runSingle(file: File) {
    let attempt = 0;
    while (attempt <= retries) {
      attempt++;
      try {
        opts.onFileStart?.(file, attempt);
        const res = await worker(file);
        const ok = !res || (res as Response).ok;
        if (!ok) {
          const status = (res as Response).status;
            if (attempt <= retries) {
              opts.onFileFailure?.(file, attempt, new Error(`HTTP ${status}`));
              await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
              continue;
            }
            failed++; completed++;
            results.push({ file, success: false, attempts: attempt, responseStatus: status, error: `HTTP ${status}` });
            report();
            return;
        }
        success++; completed++;
        opts.onFileSuccess?.(file, attempt);
        results.push({ file, success: true, attempts: attempt, responseStatus: (res as Response | undefined)?.status });
        report();
        return;
      } catch (err) {
        if (attempt <= retries) {
          opts.onFileFailure?.(file, attempt, err);
          await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
          continue;
        }
        failed++; completed++;
        results.push({ file, success: false, attempts: attempt, error: err });
        report();
        return;
      }
    }
  }

  return await new Promise<UploadResult[]>((resolve) => {
    function launchNext() {
      if (queue.length === 0) {
        if (inFlight === 0) {
          resolve(results);
        }
        return;
      }
      while (inFlight < concurrency && queue.length) {
        const file = queue.shift()!;
        inFlight++; report(file.name);
        runSingle(file).finally(() => { inFlight--; launchNext(); });
      }
    }
    launchNext();
  });
}
