import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { TRELLO_CONFIG } from '../utils/constants';
import { deleteWithApi, getFromApi, postWithApi, updateWithApi } from './axiosService';

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

	

	const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

	

	if (result.type === 'success' && result.url) {
		const url = result.url;
		// Chercher token dans le fragment (#token=...) ou dans les query params (?token=... ou &token=...)
		let tokenMatch = url.match(/#.*?token=([^&]+)/) || url.match(/[?&]token=([^&]+)/) || url.match(/token=([^&]+)/);
		if (tokenMatch) {
			return tokenMatch[1];
		}
		console.error('Token non trouvé dans l\'URL de redirection:', url);
		throw new Error('Token not found in redirect URL');
	}

	if (result.type === 'cancel' || result.type === 'dismiss') {
		throw new Error('Authentication cancelled');
	}

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



//    CARD CRUD


export async function createCard(listId, token, { name, desc = "", start = null, due = null }) {
	const endpoint = `/cards?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const payload = { idList: listId, name, desc, start, due };

	const [success, data] = await postWithApi(endpoint, payload, "post");
	return success ? data : null;
}

export async function getCard(cardId, token) {
  const endpoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&members=true&member_fields=fullName,avatarUrl`;
  const [success, data] = await getFromApi(endpoint);

  
  return success ? data : null;
}



export async function updateCard(cardId, token, payload) {
	const endpoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const [success, data] = await updateWithApi(endpoint, payload, {
		autoJoin: false,
		successStatus: 200
	});
	return success ? data : null;
}

export async function deleteCard(cardId, token) {
	const endpoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const [success] = await deleteWithApi(endpoint, { autoJoin: false });
	return success;
}



//    MEMBERS MANAGEMENT


export async function addMemberToCard(cardId, memberId, token) {
	const endpoint = `/cards/${cardId}/idMembers?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const payload = { value: memberId };

	const [success, data] = await postWithApi(endpoint, payload, "post");
	return success ? data : null;
}

export async function removeMemberFromCard(cardId, memberId, token) {
	const endpoint = `/cards/${cardId}/idMembers/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const [success] = await deleteWithApi(endpoint, { autoJoin: false });
	return success;
}


//    COMMENTS

export async function addComment(cardId, token, text) {
	const endpoint = `/cards/${cardId}/actions/comments?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const payload = { text };

	const [success, data] = await postWithApi(endpoint, payload, "post");
	return success ? data : null;
}

export async function getCardComments(cardId, token) {
	const endpoint = `/cards/${cardId}/actions?filter=commentCard&key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
	const [success, data] = await getFromApi(endpoint);
	return success ? data : [];
}
// UPDATE COMMENT
export async function updateComment(cardId, commentId, token, text) {
  const endpoint = `/cards/${cardId}/actions/${commentId}/comments?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
  const payload = { text };

  const [success, data] = await postWithApi(endpoint, payload, "put");
  return success ? data : null;
}
// SUPPRESSION DE COMMENTAIRE
export async function deleteComment(commentId, token) {
    const endpoint = `/actions/${commentId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
    const [success] = await deleteWithApi(endpoint, { autoJoin: false });
    return success;
}


// Utilitaire pour DELETE
async function fetchFromApiDelete(endpoint) {
	try {
		const res = await fetch(`https://api.trello.com/1${endpoint}`, {
			method: "DELETE",
		});
		if (res.ok) return [true, await res.json()];
		return [false, await res.json()];
	} catch (err) {
		console.error(err);
		return [false, null];
	}
}


//    DATES
export async function updateCardDates(cardId, token, start, due) {
	return await updateCard(cardId, token, { start, due });
}


