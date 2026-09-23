import axios from 'axios';
import { fetchFromLocalStorage } from '../localStorageService';
import { TRELLO_CONFIG } from '../../utils/constants';

const DEFAULT_BASE_URL = 'https://api.trello.com/1';
const DEFAULT_TIMEOUT = 30000;

const trelloClient = axios.create({
  baseURL: TRELLO_CONFIG.API_BASE_URL || DEFAULT_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: inject Trello API key and token.
 * The token is read from AsyncStorage on every request so that
 * the client always reflects the current session state.
 */
trelloClient.interceptors.request.use(async (config) => {
  const token = await fetchFromLocalStorage('trello_token');

  config.params = {
    ...config.params,
    key: TRELLO_CONFIG.API_KEY,
  };

  if (token) {
    config.params.token = token;
  }

  return config;
});

/**
 * Response helper that normalizes axios responses to a consistent
 * { success, data, error } shape.
 */
export function handleResponse(response) {
  return { success: true, data: response.data };
}

/**
 * Error helper that normalizes axios errors to a consistent
 * { success: false, error } shape.
 */
export function handleError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || `Request failed with status ${status}`;

    if (status === 401) {
      return { success: false, error: message };
    }

    return { success: false, error: message };
  }

  if (error.request) {
    return { success: false, error: 'Network error' };
  }

  return { success: false, error: error.message || 'Request error' };
}

/**
 * Generic request wrapper. Prefer named helpers below.
 */
export async function request(method, url, { data, params, config = {} } = {}) {
  try {
    const response = await trelloClient.request({
      method,
      url,
      data,
      params,
      ...config,
    });
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
}

export async function get(url, params, config) {
  return request('GET', url, { params, config });
}

export async function post(url, data, config) {
  return request('POST', url, { data, config });
}

export async function put(url, data, config) {
  return request('PUT', url, { data, config });
}

export async function del(url, config) {
  return request('DELETE', url, { config });
}

export default trelloClient;
export { trelloClient };
