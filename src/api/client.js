export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

function stripQuotes(etag) {
  return (etag || '').replace(/^"|"$/g, '');
}

/**
 * Thin REST client for the Reapit emulator. The emulator uses standard
 * ETag/If-Match optimistic concurrency on PATCH, and HAL-ish paged
 * collections (`_embedded`, `totalCount`, `totalPageCount`).
 */
export function createApiClient(baseUrl) {
  async function request(path, opts = {}) {
    const url = `${baseUrl}${path}`;
    let res;
    try {
      res = await fetch(url, {
        ...opts,
        headers: {
          Accept: 'application/json',
          ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
          ...(opts.headers || {}),
        },
      });
    } catch (err) {
      throw new ApiError(
        `Could not reach ${baseUrl}. Is the emulator running? (${err.message})`,
        0,
        null,
      );
    }

    if (res.status === 204) return null;

    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const message =
        (data && (data.description || data.message)) ||
        `${res.status} ${res.statusText}`;
      throw new ApiError(message, res.status, data);
    }

    return data;
  }

  return {
    baseUrl,

    get(path) {
      return request(path, { method: 'GET' });
    },

    async getPaged(path) {
      const data = await request(path, { method: 'GET' });
      return {
        items: data?._embedded || [],
        totalCount: data?.totalCount ?? (data?._embedded || []).length,
        totalPageCount: data?.totalPageCount ?? 1,
        pageNumber: data?.pageNumber ?? 1,
        pageSize: data?.pageSize ?? (data?._embedded || []).length,
      };
    },

    post(path, body) {
      return request(path, { method: 'POST', body: JSON.stringify(body) });
    },

    patch(path, body, etag) {
      return request(path, {
        method: 'PATCH',
        headers: etag ? { 'If-Match': `"${stripQuotes(etag)}"` } : {},
        body: JSON.stringify(body),
      });
    },

    delete(path) {
      return request(path, { method: 'DELETE' });
    },
  };
}

export function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(`${key}[]`, v));
    } else {
      qs.set(key, value);
    }
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}
