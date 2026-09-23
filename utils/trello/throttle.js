import { sleep } from './retry';

/**
 * Simple rate-limiter: ensures at least `intervalMs` between calls.
 */
export function createThrottler(intervalMs = 500) {
  let lastCall = 0;

  return async function throttle() {
    const now = Date.now();
    const elapsed = now - lastCall;

    if (elapsed < intervalMs) {
      await sleep(intervalMs - elapsed);
    }

    lastCall = Date.now();
  };
}
