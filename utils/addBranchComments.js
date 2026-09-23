import { addComment, getCardComments, updateComment } from '../services/cards';
import { getCardsInList } from '../services/cards';
import { getBoardLists } from '../services/lists';
import { createThrottler } from './trello/throttle';
import { generateBranchName } from './branchNames';

const BRANCH_PREFIX = 'Branch:';
// Unicode for the historical branch emoji used in legacy comments.
const BRANCH_EMOJI = '\u{1F33F}';

const throttle = createThrottler(300);

function formatBranchComment(branchName) {
  return `${BRANCH_PREFIX} \`${branchName}\``;
}

function findBranchComment(comments) {
  return comments.find((comment) => {
    const text = comment.data?.text || comment.text || '';
    return text.includes(BRANCH_PREFIX) || text.includes('branch:') || text.includes(BRANCH_EMOJI);
  });
}

async function addBranchComment(cardId, branchName) {
  const commentText = formatBranchComment(branchName);
  const response = await addComment(cardId, commentText);
  return response.success;
}

async function updateBranchComment(cardId, commentId, branchName) {
  const commentText = formatBranchComment(branchName);
  const response = await updateComment(cardId, commentId, commentText);
  return response.success;
}

async function getExistingBranchComment(cardId) {
  const response = await getCardComments(cardId);

  if (!response.success) {
    return null;
  }

  return findBranchComment(response.data) || null;
}

async function loadBoardCards(boardId) {
  const listsResponse = await getBoardLists(boardId);

  if (!listsResponse.success) {
    throw new Error(listsResponse.error || 'Failed to load board lists');
  }

  const cardsByList = [];

  for (const list of listsResponse.data) {
    const cardsResponse = await getCardsInList(list.id);

    if (!cardsResponse.success) {
      throw new Error(cardsResponse.error || `Failed to load cards for list ${list.name}`);
    }

    cardsByList.push({ list, cards: cardsResponse.data });
  }

  return cardsByList;
}

async function processCard(card, { skipWeek1, updateExisting }) {
  if (skipWeek1 && card.name.toLowerCase().includes('week 1')) {
    return { status: 'skipped' };
  }

  const branchName = generateBranchName(card.name);
  const existingComment = await getExistingBranchComment(card.id);

  if (existingComment) {
    const commentText = existingComment.data?.text || existingComment.data?.comment?.text || existingComment.text || '';
    const expectedText = formatBranchComment(branchName);

    if (updateExisting && (commentText.includes(BRANCH_EMOJI) || commentText.trim() !== expectedText)) {
      const success = await updateBranchComment(card.id, existingComment.id, branchName);
      return success ? { status: 'updated' } : { status: 'error', name: card.name };
    }

    return { status: 'unchanged' };
  }

  const success = await addBranchComment(card.id, branchName);
  return success ? { status: 'added' } : { status: 'error', name: card.name };
}

/**
 * Add branch name comments to all cards in a board.
 */
export async function addBranchCommentsToBoard(boardId, skipWeek1 = false, updateExisting = true) {
  try {
    const cardsByList = await loadBoardCards(boardId);

    let totalCards = 0;
    let commentedCards = 0;
    let updatedCards = 0;
    let skippedCards = 0;
    const errors = [];

    for (const { list, cards } of cardsByList) {
      for (const card of cards) {
        totalCards++;
        await throttle();

        const result = await processCard(card, { skipWeek1, updateExisting });

        if (result.status === 'skipped') skippedCards++;
        else if (result.status === 'updated') updatedCards++;
        else if (result.status === 'added') commentedCards++;
        else if (result.status === 'error') errors.push(result.name);
      }
    }

    return {
      success: true,
      totalCards,
      commentedCards,
      updatedCards,
      skippedCards,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Remove emojis and normalize existing branch comments.
 */
export async function removeEmojisFromComments(boardId) {
  try {
    const cardsByList = await loadBoardCards(boardId);

    let totalCards = 0;
    let updatedCards = 0;
    const errors = [];

    for (const { cards } of cardsByList) {
      for (const card of cards) {
        totalCards++;
        await throttle();

        const existingComment = await getExistingBranchComment(card.id);

        if (!existingComment) {
          continue;
        }

        const commentText = existingComment.data?.text || existingComment.text || '';
        const branchName = generateBranchName(card.name);
        const expectedText = formatBranchComment(branchName);

        if (commentText.includes(BRANCH_EMOJI) || commentText !== expectedText) {
          const success = await updateBranchComment(card.id, existingComment.id, branchName);

          if (success) {
            updatedCards++;
          } else {
            errors.push(card.name);
          }
        }
      }
    }

    return {
      success: true,
      totalCards,
      updatedCards,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export { generateBranchName, getExistingBranchComment };
