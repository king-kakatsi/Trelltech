import { del, get, post, put } from './api';

const DEFAULT_FIELDS = 'id,name,desc,idOrganization,url,prefs,closed';

/**
 * Get all boards for a workspace.
 */
export async function getWorkspaceBoards(workspaceId) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }

  return get(`/organizations/${workspaceId}/boards`, {
    fields: DEFAULT_FIELDS,
  });
}

/**
 * Get a single board by ID.
 */
export async function getBoard(boardId) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return get(`/boards/${boardId}`, {
    fields: `${DEFAULT_FIELDS},memberships,memberIds`,
  });
}

/**
 * Create a new board inside a workspace.
 */
export async function createBoard(workspaceId, { name, description = '', background = 'blue' } = {}) {
  if (!workspaceId) {
    return { success: false, error: 'Workspace ID is required' };
  }
  if (!name || String(name).trim() === '') {
    return { success: false, error: 'Board name is required' };
  }

  return post('/boards', {
    idOrganization: workspaceId,
    name: String(name).trim(),
    desc: String(description || '').trim(),
    prefs_background: background,
    defaultLists: false,
  });
}

/**
 * Update a board's name.
 */
export async function updateBoardName(boardId, name) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }
  if (!name || String(name).trim() === '') {
    return { success: false, error: 'Board name is required' };
  }

  return put(`/boards/${boardId}`, { name: String(name).trim() });
}

/**
 * Update a board's description.
 */
export async function updateBoardDescription(boardId, description) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return put(`/boards/${boardId}`, { desc: String(description || '').trim() });
}

/**
 * Update a board's background color.
 */
export async function updateBoardBackground(boardId, background) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return put(`/boards/${boardId}`, { prefs_background: background });
}

/**
 * Close (archive) a board.
 */
export async function archiveBoard(boardId) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return put(`/boards/${boardId}`, { closed: true });
}

/**
 * Get the members of a board.
 */
export async function getBoardMembers(boardId) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return get(`/boards/${boardId}/members`, {
    fields: 'id,fullName,username,avatarUrl,initials',
  });
}
