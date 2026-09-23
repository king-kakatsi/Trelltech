/**
 * Label helpers for markdown-driven board creation.
 */

import { get, post, del } from '../../services/api';
import { withRetry, sleep } from '../trello/retry';

const EMOJI_MAP = {
  '🔴': 'red', '🟠': 'orange', '🟡': 'yellow', '🟢': 'green',
  '🔵': 'blue', '🟣': 'purple', '⚪': 'black',
  '🐛': 'red', '📝': 'blue', '🔧': 'orange', '⚡': 'yellow',
};

const FRENCH_MAP = {
  vert: 'green', bleu: 'blue', rouge: 'red', jaune: 'yellow',
  orange: 'orange', violet: 'purple', turquoise: 'green',
  cyan: 'sky', rose: 'pink', lime: 'lime', magenta: 'pink',
  sky: 'sky', noir: 'black', blanc: null,
};

/**
 * Map an emoji or French color name to a Trello-accepted color string.
 * Trello valid colors: yellow, purple, blue, red, green, orange, black, sky, pink, lime
 * @param {string} hint
 * @returns {string|null}
 */
export function getLabelColor(hint) {
  return EMOJI_MAP[hint] || FRENCH_MAP[hint?.toLowerCase()] || 'blue';
}

export async function getBoardLabels(boardId) {
  const { success, data, error } = await get(`/boards/${boardId}/labels`, { limit: 1000 });
  if (!success) throw new Error(error || 'Failed to fetch board labels');
  return data || [];
}

/**
 * Create a label on a board.
 * @param {string} boardId
 * @param {string} name
 * @param {string} color
 * @returns {Promise<object>}
 */
export async function createLabel(boardId, name, color = 'blue') {
  return withRetry(async () => {
    const { success, data, error } = await post(`/boards/${boardId}/labels`, {
      name,
      color,
    });
    if (!success) throw new Error(error || `Failed to create label "${name}"`);
    return data;
  });
}

/**
 * Add a label to a card.
 * @param {string} cardId
 * @param {string} labelId
 * @returns {Promise<boolean>}
 */
export async function addLabelToCard(cardId, labelId) {
  return withRetry(async () => {
    const { success, error } = await post(`/cards/${cardId}/idLabels`, { value: labelId });
    if (!success) throw new Error(error || 'Failed to add label to card');
    return true;
  });
}

/**
 * Delete a single label.
 * @param {string} labelId
 * @returns {Promise<boolean>}
 */
export async function deleteLabel(labelId) {
  return withRetry(async () => {
    const { success, error } = await del(`/labels/${labelId}`);
    if (!success) throw new Error(error || 'Failed to delete label');
    return true;
  });
}

/**
 * Get existing labels and create missing ones.
 * @param {string} boardId
 * @param {Array} labels
 * @returns {Promise<Map<string, string>>} Map of label name to label ID
 */
export async function findOrCreateLabels(boardId, labels) {
  const labelMap = new Map();
  const existingLabels = await getBoardLabels(boardId);

  console.log(`\nFound ${existingLabels.length} existing labels`);
  for (const label of existingLabels) {
    if (label.name) {
      labelMap.set(label.name, label.id);
      console.log(`  Found label: ${label.name}`);
    }
  }

  console.log(`\nChecking for missing labels...`);
  for (const label of labels) {
    if (!labelMap.has(label.name)) {
      try {
        const color = getLabelColor(label.color || label.name);
        const createdLabel = await createLabel(boardId, label.name, color);
        labelMap.set(label.name, createdLabel.id);
        console.log(`  Created label: ${label.name} (${color})`);
        await sleep(400);
      } catch (error) {
        console.error(`  Failed to create label ${label.name}:`, error);
      }
    } else {
      console.log(`  Label already exists: ${label.name}`);
    }
  }

  return labelMap;
}
