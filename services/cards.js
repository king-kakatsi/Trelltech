import { del, get, post, put } from './api';

/**
 * Get cards in a list.
 */
export async function getCardsInList(listId) {
  if (!listId) {
    return { success: false, error: 'List ID is required' };
  }

  return get(`/lists/${listId}/cards`, {
    fields: 'id,name,desc,due,start,idMembers,labels,badges,closed',
  });
}

/**
 * Get a single card.
 */
export async function getCard(cardId) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }

  return get(`/cards/${cardId}`, {
    fields: 'id,name,desc,due,start,idMembers,labels,badges,closed,idList,idBoard',
  });
}

/**
 * Create a card in a list.
 */
export async function createCard(listId, { name, description, due, start, idMembers = [] } = {}) {
  if (!listId) {
    return { success: false, error: 'List ID is required' };
  }
  if (!name || String(name).trim() === '') {
    return { success: false, error: 'Card name is required' };
  }

  const payload = {
    idList: listId,
    name: String(name).trim(),
  };

  if (description !== undefined) payload.desc = String(description).trim();
  if (due) payload.due = due;
  if (start) payload.start = start;
  if (idMembers && idMembers.length > 0) payload.idMembers = idMembers.join(',');

  return post('/cards', payload);
}

/**
 * Update a card.
 */
export async function updateCard(cardId, { name, description, due, start, idList, closed } = {}) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }

  const payload = {};
  if (name !== undefined) payload.name = String(name).trim();
  if (description !== undefined) payload.desc = String(description).trim();
  if (due !== undefined) payload.due = due;
  if (start !== undefined) payload.start = start;
  if (idList !== undefined) payload.idList = idList;
  if (closed !== undefined) payload.closed = closed;

  if (Object.keys(payload).length === 0) {
    return { success: false, error: 'No fields to update' };
  }

  return put(`/cards/${cardId}`, payload);
}

/**
 * Update a card's start and due dates.
 * Pass null to clear a date.
 */
export async function updateCardDates(cardId, start, due) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }

  const payload = {};
  if (start !== undefined) payload.start = start;
  if (due !== undefined) payload.due = due;

  return put(`/cards/${cardId}`, payload);
}

/**
 * Delete a card.
 */
export async function deleteCard(cardId) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }

  return del(`/cards/${cardId}`);
}

/**
 * Get comments on a card.
 */
export async function getCardComments(cardId) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }

  return get(`/cards/${cardId}/actions`, {
    filter: 'commentCard',
    fields: 'id,idMemberCreator,data,date',
  });
}

/**
 * Add a comment to a card.
 */
export async function addComment(cardId, text) {
  if (!cardId) {
    return { success: false, error: 'Card ID is required' };
  }
  if (!text || String(text).trim() === '') {
    return { success: false, error: 'Comment text is required' };
  }

  return post(`/cards/${cardId}/actions/comments`, {
    text: String(text).trim(),
  });
}

/**
 * Update a comment on a card.
 */
export async function updateComment(cardId, commentId, text) {
  if (!cardId || !commentId) {
    return { success: false, error: 'Card ID and comment ID are required' };
  }
  if (!text || String(text).trim() === '') {
    return { success: false, error: 'Comment text is required' };
  }

  return put(`/cards/${cardId}/actions/${commentId}/comments`, {
    text: String(text).trim(),
  });
}

/**
 * Delete a comment from a card.
 */
export async function deleteComment(cardId, commentId) {
  if (!cardId || !commentId) {
    return { success: false, error: 'Card ID and comment ID are required' };
  }

  return del(`/cards/${cardId}/actions/${commentId}/comments`);
}
