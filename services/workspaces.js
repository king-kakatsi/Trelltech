import { del, get, post, put } from './api';

/**
 * Get all workspaces for the current user.
 */
export async function getAllWorkspaces() {
  return get('/members/me/organizations', {
    fields: 'id,displayName,name,desc,websiteUrl,url',
  });
}

/**
 * Get a single workspace.
 */
export async function getWorkspace(workspaceId) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }

  return get(`/organizations/${workspaceId}`, {
    fields: 'id,displayName,name,desc,websiteUrl,url',
  });
}

/**
 * Create a workspace.
 */
export async function createWorkspace({ displayName, name, description = '', website = '' } = {}) {
  if (!displayName || String(displayName).trim() === '') {
    return { success: false, error: 'Display name is required' };
  }

  const payload = {
    displayName: String(displayName).trim(),
    desc: String(description || '').trim(),
  };

  if (name) payload.name = String(name).trim().toLowerCase();
  if (website) payload.website = String(website).trim();

  return post('/organizations', payload);
}

/**
 * Update a workspace.
 */
export async function updateWorkspace(workspaceId, { displayName, name, description, website } = {}) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }

  const payload = {};
  if (displayName !== undefined) payload.displayName = String(displayName).trim();
  if (name !== undefined) payload.name = String(name).trim().toLowerCase();
  if (description !== undefined) payload.desc = String(description).trim();
  if (website !== undefined) payload.website = website ? String(website).trim() : '';

  if (Object.keys(payload).length === 0) {
    return { success: false, error: 'No fields to update' };
  }

  return put(`/organizations/${workspaceId}`, payload);
}

/**
 * Delete a workspace.
 */
export async function deleteWorkspace(workspaceId) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }

  return del(`/organizations/${workspaceId}`);
}

/**
 * Get workspace members.
 */
export async function getWorkspaceMembers(workspaceId) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }

  return get(`/organizations/${workspaceId}/members`, {
    fields: 'id,fullName,username,avatarUrl,initials',
  });
}

/**
 * Add a member to a workspace by email.
 */
export async function addWorkspaceMember(workspaceId, { email, fullName = '' } = {}) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }
  if (!email || String(email).trim() === '') {
    return { success: false, error: 'Email is required' };
  }

  return put(`/organizations/${workspaceId}/members`, {
    email: String(email).trim(),
    fullName: String(fullName || '').trim(),
    type: 'normal',
  });
}

/**
 * Remove a member from a workspace.
 */
export async function removeWorkspaceMember(workspaceId, memberId) {
  if (!workspaceId || !memberId) {
    return { success: false, error: 'Workspace ID and member ID are required' };
  }

  return del(`/organizations/${workspaceId}/members/${memberId}`);
}

// Legacy aliases for backwards compatibility.
export { createWorkspace as postWorkspace };
export { removeWorkspaceMember as deleteWorkspaceMember };
export { removeWorkspaceMember as deleteMember };
export { addWorkspaceMember as addMember };
