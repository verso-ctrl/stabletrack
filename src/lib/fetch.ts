// Client-side fetch wrapper with automatic CSRF token injection

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;

  csrfPromise = fetch('/api/csrf')
    .then(res => res.json())
    .then(data => {
      csrfToken = data.csrfToken;
      csrfPromise = null;
      return csrfToken!;
    })
    .catch(() => {
      csrfPromise = null;
      return '';
    });

  return csrfPromise;
}

/** Clear cached CSRF token (e.g. after 403) */
export function clearCsrfToken() {
  csrfToken = null;
}

/**
 * Fetch wrapper that automatically includes CSRF token for mutation requests.
 * Drop-in replacement for `fetch()` — same API, but adds x-csrf-token header.
 */
export async function csrfFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (!isMutation) {
    return fetch(url, init);
  }

  const token = await getCsrfToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('x-csrf-token', token);
  }

  const response = await fetch(url, { ...init, headers });

  // If CSRF token expired, refresh and retry once
  if (response.status === 403) {
    const cloned = response.clone();
    const errorData = await cloned.json().catch(() => ({}));
    if (errorData.error?.includes('CSRF')) {
      clearCsrfToken();
      const newToken = await getCsrfToken();
      const retryHeaders = new Headers(init?.headers);
      if (newToken) retryHeaders.set('x-csrf-token', newToken);
      return fetch(url, { ...init, headers: retryHeaders });
    }
  }

  return response;
}
