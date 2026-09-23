/**
 * Card-level orchestration for markdown-driven board creation.
 */

import { createCard, getCardsInList, updateCard } from '../../services/cards';
import { addMember } from '../../services/members';
import { addLabelToCard } from './labels';
import { applyCardChecklist, updateCardChecklist } from './checklists';
import { sleep } from '../trello/retry';

async function findExistingCard(listId, cardName) {
  try {
    const { success, data: cards, error } = await getCardsInList(listId);
    if (!success) throw new Error(error || 'Failed to fetch cards');
    return cards.find(
      (card) => card.name.trim().toLowerCase() === cardName.trim().toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error finding existing card:', error);
    return null;
  }
}

export function buildCardDescription(cardDef) {
  let description = cardDef.description || '';
  if (cardDef.acceptanceCriteria.length > 0) {
    if (description) description += '\n\n';
    description += '**Acceptance Criteria:**\n';
    description += cardDef.acceptanceCriteria.map((c) => `- ${c}`).join('\n');
  }
  return description;
}

export function findMember(name, members) {
  const lower = name.toLowerCase();
  return members.find(
    (m) => m.username?.toLowerCase() === lower ||
           m.fullName?.toLowerCase() === lower ||
           m.username?.toLowerCase().includes(lower)
  );
}

async function updateCardDescription(cardId, description) {
  const { success, error } = await updateCard(cardId, { description });
  if (!success) throw new Error(error || 'Failed to update card description');
  return true;
}

async function applyCardLabels(cardId, labelDefs, labelMap, silent = false) {
  for (const labelDef of labelDefs) {
    const labelId = labelMap.get(labelDef.name);
    if (!labelId) continue;
    try {
      await addLabelToCard(cardId, labelId);
      if (!silent) console.log(`    Added label: ${labelDef.name}`);
      await sleep(250);
    } catch (error) {
      console.error(`    Failed to add label ${labelDef.name}:`, error);
    }
  }
}

async function applyCardAssignee(cardId, assignee, members, delayMs = 200) {
  if (!assignee || assignee === 'You') return;
  const member = findMember(assignee, members);
  if (!member) return;
  try {
    await addMember('card', cardId, member.id);
    console.log(`    Assigned to: ${member.fullName || member.username}`);
    await sleep(delayMs);
  } catch (error) {
    console.error('    Failed to assign member:', error);
  }
}

async function updateExistingCard(card, cardDef, labelMap, members) {
  let updated = false;

  const description = buildCardDescription(cardDef);
  if (card.desc !== description) {
    await updateCardDescription(card.id, description);
    updated = true;
    console.log('    ↻ Updated description');
  }

  const existingLabelIds = new Set(card.idLabels || []);
  for (const labelDef of cardDef.labels) {
    const labelId = labelMap.get(labelDef.name);
    if (labelId && !existingLabelIds.has(labelId)) {
      try {
        await addLabelToCard(card.id, labelId);
        console.log(`    Added label: ${labelDef.name}`);
        await sleep(250);
      } catch (error) {
        console.error(`    Failed to add label ${labelDef.name}:`, error);
      }
    }
  }

  if (cardDef.assignee && cardDef.assignee !== 'You') {
    const member = findMember(cardDef.assignee, members);
    if (member && !card.idMembers?.includes(member.id)) {
      try {
        await addMember('card', card.id, member.id);
        console.log(`    Assigned to: ${member.fullName || member.username}`);
        await sleep(200);
      } catch (error) {
        console.error('    Failed to assign member:', error);
      }
    }
  }

  await updateCardChecklist(card, cardDef);
  return updated;
}

export async function createAllCards(boardId, listMap, labelMap, members, cards) {
  console.log(`\nProcessing ${cards.length} cards...`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const cardDef of cards) {
    try {
      const listId = listMap.get(cardDef.list);
      if (!listId) {
        console.log(`  Skipping card "${cardDef.title}" - list "${cardDef.list}" not found`);
        skippedCount++;
        continue;
      }

      const existingCard = await findExistingCard(listId, cardDef.title);

      if (existingCard) {
        console.log(`  ⊙ Found existing card: ${cardDef.title}`);
        const updated = await updateExistingCard(existingCard, cardDef, labelMap, members);
        if (updated) {
          updatedCount++;
        } else {
          console.log('    Card already up to date');
        }
      } else {
        const description = buildCardDescription(cardDef);
        const { success, data: card, error } = await createCard(listId, {
          name: cardDef.title,
          description,
        });
        if (!success) throw new Error(error || 'Failed to create card');

        console.log(`  Created card: ${cardDef.title}`);
        createdCount++;

        await applyCardLabels(card.id, cardDef.labels, labelMap, true);
        await applyCardAssignee(card.id, cardDef.assignee, members, 300);
        await applyCardChecklist(card.id, cardDef.checklist);
      }

      await sleep(800);
    } catch (error) {
      console.error(`  Failed to process card "${cardDef.title}":`, error);
      skippedCount++;
    }
  }

  console.log(`\nCard processing complete!`);
  console.log(`  Created: ${createdCount}`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
}
