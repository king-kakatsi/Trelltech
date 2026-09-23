import { get, post, put, del } from './api';

/**
 * Get current members for a given context.
 * Supported scopes: 'workspace', 'board', 'card'.
 */
export async function getCurrentMembers(scope, id) {
  if (!scope || !id) {
    return { success: false, error: 'Scope and ID are required' };
  }

  if (scope === 'workspace') {
    return get(`/organizations/${id}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });
  }

  if (scope === 'board') {
    return get(`/boards/${id}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });
  }

  if (scope === 'card') {
    return get(`/cards/${id}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });
  }

  return { success: false, error: `Unsupported scope: ${scope}` };
}

/**
 * Get available members for a given context.
 * Supported scopes: 'workspace', 'board', 'card'.
 */
export async function getAvailableMembers(scope, id) {
  if (!scope || !id) {
    return { success: false, error: 'Scope and ID are required' };
  }

  if (scope === 'workspace') {
    const response = await get(`/organizations/${id}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });
    return response;
  }

  if (scope === 'board') {
    const response = await get(`/boards/${id}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });
    return response;
  }

  if (scope === 'card') {
    const cardResponse = await get(`/cards/${id}`, {
      fields: 'idBoard',
    });

    if (!cardResponse.success) {
      return cardResponse;
    }

    const boardResponse = await get(`/boards/${cardResponse.data.idBoard}/members`, {
      fields: 'id,fullName,username,avatarUrl,initials',
    });

    return boardResponse;
  }

  return { success: false, error: `Unsupported scope: ${scope}` };
}

/**
 * Add a member to a board or card.
 */
export async function addMember(scope, id, memberId) {
  if (!scope || !id || !memberId) {
    return { success: false, error: 'Scope, ID and member ID are required' };
  }

  if (scope === 'board') {
    return put(`/boards/${id}/members/${memberId}`, { type: 'normal' });
  }

  if (scope === 'card') {
    return post(`/cards/${id}/idMembers`, { value: memberId });
  }

  return { success: false, error: `Unsupported scope: ${scope}` };
}

/**
 * Remove a member from a board or card.
 */
export async function removeMember(scope, id, memberId) {
  if (!scope || !id || !memberId) {
    return { success: false, error: 'Scope, ID and member ID are required' };
  }

  if (scope === 'board') {
    return del(`/boards/${id}/members/${memberId}`);
  }

  if (scope === 'card') {
    return del(`/cards/${id}/idMembers/${memberId}`);
  }

  return { success: false, error: `Unsupported scope: ${scope}` };
}
