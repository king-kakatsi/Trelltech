import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { TRELLO_CONFIG } from '../utils/constants';
import { get, put } from './api';
import { saveInLocalStorage } from './localStorageService';

WebBrowser.maybeCompleteAuthSession();

const AUTH_ENDPOINT = 'https://trello.com/1/authorize';

/**
 * Trigger Trello OAuth and return the access token.
 * @returns {Promise<string>}
 */
export async function authenticate() {
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'trelltech' });

  const authUrl = `${AUTH_ENDPOINT}?${new URLSearchParams({
    key: TRELLO_CONFIG.API_KEY,
    return_url: redirectUri,
    scope: TRELLO_CONFIG.SCOPES || 'read,write',
    expiration: 'never',
    name: TRELLO_CONFIG.APP_NAME || 'Trelltech',
    response_type: 'token',
  }).toString()}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Authentication cancelled or failed');
  }

  const params = new URLSearchParams(result.url.split('#')[1]);
  const token = params.get('token');

  if (!token) {
    throw new Error('Token not found in OAuth response');
  }

  await saveInLocalStorage('trello_token', token);
  return token;
}

/**
 * Fetch the current Trello member.
 * @returns {Promise<object>}
 */
export async function getCurrentUser() {
  const response = await get('/members/me', {
    fields: 'id,fullName,username,email,avatarUrl,bio,url',
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch user');
  }

  return response.data;
}

/**
 * Update the current Trello member.
 * @param {object} updates
 * @returns {Promise<object>}
 */
export async function updateCurrentUser(updates) {
  const { fullName, bio } = updates || {};
  const params = {};

  if (fullName !== undefined) params.fullName = fullName;
  if (bio !== undefined) params.bio = bio;

  const response = await put('/members/me', params);

  if (!response.success) {
    throw new Error(response.error || 'Failed to update user');
  }

  return response.data;
}
