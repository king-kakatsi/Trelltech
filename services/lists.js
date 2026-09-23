import { del, get, post, put } from './api';

/**
 * Get lists for a board.
 */
export async function getBoardLists(boardId) {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }

  return get(`/boards/${boardId}/lists`, {
    fields: 'id,name,pos,closed',
  });
}

/**
 * Get a single list.
 */
export async function getList(listId) {
  if (!listId) {
    return { success: false, error: 'List ID is required' };
  }

  return get(`/lists/${listId}`, {
    fields: 'id,name,pos,closed',
  });
}

/**
 * Create a list on a board.
 */
export async function createList(boardId, name, pos = 'bottom') {
  if (!boardId) {
    return { success: false, error: 'Board ID is required' };
  }
  if (!name || String(name).trim() === '') {
    return { success: false, error: 'List name is required' };
  }

  return post('/lists', {
    idBoard: boardId,
    name: String(name).trim(),
    pos,
  });
}

/**
 * Update a list (name or position).
 */
export async function updateList(listId, { name, pos, closed } = {}) {
  if (!listId) {
    return { success: false, error: 'List ID is required' };
  }

  const payload = {};
  if (name !== undefined) payload.name = String(name).trim();
  if (pos !== undefined) payload.pos = pos;
  if (closed !== undefined) payload.closed = closed;

  if (Object.keys(payload).length === 0) {
    return { success: false, error: 'No fields to update' };
  }

  return put(`/lists/${listId}`, payload);
}

/**
 * Archive a list.
 */
export async function archiveList(listId) {
  return updateList(listId, { closed: true });
}
