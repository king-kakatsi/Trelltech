import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { TRELLO_CONFIG } from '../utils/constants';
import { getFromApi, updateWithApi } from './axiosService';

WebBrowser.maybeCompleteAuthSession();

export async function authenticate() {
	// Générer une redirect URI adaptée à l'environnement (Expo Go via proxy si possible)
	const redirectUri = AuthSession.makeRedirectUri({ useProxy: true, path: 'auth' }) || Linking.createURL('auth') || `${Linking.createURL('')}auth` || 'mobimobilo://auth';
	console.log('=== TRELLO AUTH DEBUG ===');
	console.log('Computed redirectUri:', redirectUri);

	// Encoder la redirectUri pour Trello
	const encodedRedirect = encodeURIComponent(redirectUri);

	const authUrl =
		`https://trello.com/1/authorize?` +
		`expiration=never&` +
		`name=${encodeURIComponent(TRELLO_CONFIG.APP_NAME)}&` +
		`scope=read,write&` +
		`response_type=token&` +
		`key=${TRELLO_CONFIG.API_KEY}&` +
		`return_url=${encodedRedirect}`;

	console.log('Opening auth URL:', authUrl);

	const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

	console.log('WebBrowser result type:', result.type);
	console.log('WebBrowser result URL:', result.url);

	if (result.type === 'success' && result.url) {
		const url = result.url;
		// Chercher token dans le fragment (#token=...) ou dans les query params (?token=... ou &token=...)
		let tokenMatch = url.match(/#.*?token=([^&]+)/) || url.match(/[?&]token=([^&]+)/) || url.match(/token=([^&]+)/);
		console.log('token match:', tokenMatch);
		if (tokenMatch) {
			console.log('token (truncated):', tokenMatch[1].substring(0, 10) + '...');
			return tokenMatch[1];
		}
		console.error('Token non trouvé dans l\'URL de redirection:', url);
		throw new Error('Token not found in redirect URL');
	}

	if (result.type === 'cancel' || result.type === 'dismiss') {
		console.log('User cancelled or dismissed authentication:', result.type);
		throw new Error('Authentication cancelled');
	}

	console.error('Authentication failed or unexpected result:', result);
	throw new Error('Authentication failed');
}

export async function getCurrentUser(token) {
  const endpoint = `/members/me?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const [success, data] = await getFromApi(endpoint); 
  if (success) return data;
  throw new Error('Failed to get user');
}


export async function updateCurrentUser(token, updates) {
  const params = new URLSearchParams({
    key: TRELLO_CONFIG.API_KEY,
    token: token,
  });
  Object.keys(updates).forEach(key => {
    params.append(key, updates[key]);
  });

  const endpoint = `/members/me?${params.toString()}`;
  const [success, data] = await updateWithApi(
    endpoint,
    { ...updates, key: TRELLO_CONFIG.API_KEY, token },
    { autoJoin: false }
  );
  if (success) return data; 
  console.log('Update failed:', data);
  throw new Error('Failed to update user');
}

export async function getWorkspaces(token) {
  const endpoint = `/members/me/organizations?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const [success, data] = await getFromApi(endpoint);
  return success ? data : [];
}

export async function getBoards(workspaceId, token) {
  const endpoint = `/organizations/${workspaceId}/boards?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const [success, data] = await getFromApi(endpoint);
  return success ? data : [];
}

export async function getLists(boardId, token) {
  const endpoint = `/boards/${boardId}/lists?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const [success, data] = await getFromApi(endpoint);
  return success ? data : [];
}

export async function getCards(listId, token) {
  const endpoint = `/lists/${listId}/cards?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const [success, data] = await getFromApi(endpoint);
  return success ? data : [];
}