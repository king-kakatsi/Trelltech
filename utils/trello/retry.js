/**
 * Promise-based delay.
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function up to maxAttempts with exponential backoff.
 */
export async function withRetry(fn, maxAttempts = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        const delay = baseDelay * 2 ** (attempt - 1);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
