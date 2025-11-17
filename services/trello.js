import { getFromApi } from './axiosService';
import { TRELLO_CONFIG } from '../utils/constants';

export async function authenticate() {
  // TODO: Implement Trello OAuth authentication
  // For now, return a mock token
  return 'mock_token_for_testing';
}

export async function getCurrentUser(token) {
  const [success, data] = await getFromApi(
    `/members/me?key=${TRELLO_CONFIG.API_KEY}&token=${token}`
  );
  
  if (success) {
    return data;
  }
  
  throw new Error('Failed to get user');
}

export async function getWorkspaces(token) {
  const [success, data] = await getFromApi(
    `/members/me/organizations?key=${TRELLO_CONFIG.API_KEY}&token=${token}`
  );
  
  if (success) {
    return data;
  }
  
  return [];
}

export async function getBoards(workspaceId, token) {
  const [success, data] = await getFromApi(
    `/organizations/${workspaceId}/boards?key=${TRELLO_CONFIG.API_KEY}&token=${token}`
  );
  
  if (success) {
    return data;
  }
  
  return [];
}

export async function getLists(boardId, token) {
  const [success, data] = await getFromApi(
    `/boards/${boardId}/lists?key=${TRELLO_CONFIG.API_KEY}&token=${token}`
  );
  
  if (success) {
    return data;
  }
  
  return [];
}

export async function getCards(listId, token) {
  const [success, data] = await getFromApi(
    `/lists/${listId}/cards?key=${TRELLO_CONFIG.API_KEY}&token=${token}`
  );
  
  if (success) {
    return data;
  }
  
  return [];
}