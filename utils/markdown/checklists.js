/**
 * Checklist helpers for markdown-driven board creation.
 */

import { get, post } from '../../services/api';
import { stripMarkdown } from './parse';
import { withRetry, sleep } from '../trello/retry';

export async function createChecklist(cardId, name) {
  const { success, data, error } = await post(`/cards/${cardId}/checklists`, { name });
  if (!success) throw new Error(error || 'Failed to create checklist');
  return data;
}

export async function addChecklistItem(checklistId, name, checked = false) {
  const cleanName = stripMarkdown(name);
  return withRetry(async () => {
    const { success, data, error } = await post(`/checklists/${checklistId}/checkItems`, {
      name: cleanName,
      checked,
    });
    if (!success) throw new Error(error || 'Failed to add checklist item');
    return data;
  });
}

export async function getCardChecklists(cardId) {
  const { success, data, error } = await get(`/cards/${cardId}/checklists`);
  if (!success) {
    console.error('Error getting checklists:', error);
    return [];
  }
  return data || [];
}

export async function getChecklistItems(checklistId) {
  const { success, data, error } = await get(`/checklists/${checklistId}/checkItems`);
  if (!success) {
    console.error('Error getting checklist items:', error);
    return [];
  }
  return data || [];
}

export async function applyCardChecklist(cardId, checklistItems) {
  if (checklistItems.length === 0) return;
  try {
    const checklist = await createChecklist(cardId, 'Checklist');
    console.log(`    Created checklist with ${checklistItems.length} items`);
    for (const item of checklistItems) {
      await addChecklistItem(checklist.id, item.name, item.checked);
      await sleep(250);
    }
  } catch (error) {
    console.error('    Failed to create checklist:', error);
  }
}

export async function updateCardChecklist(card, cardDef) {
  if (cardDef.checklist.length === 0) return;
  try {
    const checklists = await getCardChecklists(card.id);
    let checklist = checklists.find((c) => c.name === 'Checklist');
    if (!checklist) {
      checklist = await createChecklist(card.id, 'Checklist');
      console.log('    Created checklist');
    }

    const existingItems = await getChecklistItems(checklist.id);
    const existingItemNames = new Set(existingItems.map((item) => item.name.trim().toLowerCase()));

    let addedItems = 0;
    for (const item of cardDef.checklist) {
      if (!existingItemNames.has(item.name.trim().toLowerCase())) {
        await addChecklistItem(checklist.id, item.name, item.checked);
        addedItems++;
        await sleep(250);
      }
    }

    if (addedItems > 0) {
      console.log(`    Added ${addedItems} new checklist items`);
    }
  } catch (error) {
    console.error('    Failed to update checklist:', error);
  }
}
