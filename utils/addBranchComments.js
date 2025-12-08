/**
 * Utility to add branch name comments to Trello cards
 * 
 * This script adds a comment to each card with the expected branch name
 * following Angular commit convention (feat/, fix/, etc.)
 */

import { addComment, getCardComments, updateComment } from '../services/trello';
import { fetchFromLocalStorage } from '../services/localStorageService';
import { getBoardLists } from '../services/boardService';
import { getCardsInList } from '../services/card';

// %%%%%%%% BRANCH NAME GENERATION %%%%%%%

/**
 * Generate branch name from card title
 * @param {string} cardTitle - Card title
 * @returns {string} Branch name
 */
function generateBranchName(cardTitle) {
  // Remove quotes and special characters
  let branch = cardTitle
    .replace(/"/g, '')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim();

  // Remove common prefixes
  branch = branch
    .replace(/^(orders?\s*&\s*cart|cart\s*&\s*orders?)\s*/i, 'orders-cart-')
    .replace(/^(order\s*entity|orders?)\s*/i, 'order-')
    .replace(/^(product\s*listing|productlisting)\s*/i, 'product-listing-')
    .replace(/^(stores?)\s*/i, 'store-')
    .replace(/^(payment|payments?)\s*/i, 'payment-')
    .replace(/^(escrow)\s*/i, 'escrow-')
    .replace(/^(auction|auctions?)\s*/i, 'auction-')
    .replace(/^(bid|bidding|bids?)\s*/i, 'bid-')
    .replace(/^(search)\s*/i, 'search-')
    .replace(/^(dashboard)\s*/i, 'dashboard-')
    .replace(/^(review|reviews?)\s*/i, 'review-')
    .replace(/^(admin)\s*/i, 'admin-')
    .replace(/^(notification|notifications?)\s*/i, 'notification-')
    .replace(/^(weekend\s*work|weekend)\s*/i, 'weekend-')
    .replace(/^(week\s*\d+)\s*/i, 'week-')
    .replace(/\s*-\s*week\s*\d+/i, '');

  // Determine prefix based on content
  let prefix = 'feat';
  const lowerTitle = cardTitle.toLowerCase();
  
  if (lowerTitle.includes('bug') || lowerTitle.includes('fix')) {
    prefix = 'fix';
  } else if (lowerTitle.includes('refactor')) {
    prefix = 'refactor';
  } else if (lowerTitle.includes('test') || lowerTitle.includes('testing')) {
    prefix = 'test';
  } else if (lowerTitle.includes('doc') || lowerTitle.includes('documentation')) {
    prefix = 'docs';
  } else if (lowerTitle.includes('review') || lowerTitle.includes('weekend')) {
    prefix = 'chore';
  }

  // Clean up and format
  branch = branch
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50); // Limit length

  return `${prefix}/${branch}`;
}

// %%%%%%%% END - BRANCH NAME GENERATION %%%%%%%

// %%%%%%%% COMMENT ADDING FUNCTIONS %%%%%%%

/**
 * Add branch name comment to a card
 * @param {string} cardId - Card ID
 * @param {string} branchName - Branch name
 * @returns {Promise<boolean>} Success status
 */
async function addBranchComment(cardId, branchName) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const commentText = `Branch: \`${branchName}\``;
    const result = await addComment(cardId, token, commentText);
    
    return result !== null;
  } catch (error) {
    console.error(`Error adding comment to card ${cardId}:`, error);
    return false;
  }
}

/**
 * Check if card already has a branch comment
 * @param {string} cardId - Card ID
 * @returns {Promise<object|null>} Existing comment or null
 */
async function getExistingBranchComment(cardId) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) return null;

    const comments = await getCardComments(cardId, token);
    
    // Find comment that starts with "Branch:" or "🌿 Branch:"
    // Trello API returns comments as actions, text is in action.data.text
    const branchComment = comments.find(comment => {
      const text = comment.data?.text || comment.text || '';
      return text.includes('Branch:') || text.includes('branch:') || text.includes('🌿');
    });

    return branchComment || null;
  } catch (error) {
    console.error(`Error checking comments for card ${cardId}:`, error);
    return null;
  }
}

/**
 * Update existing branch comment to remove emoji
 * @param {string} cardId - Card ID
 * @param {string} commentId - Comment ID
 * @param {string} branchName - Branch name
 * @returns {Promise<boolean>} Success status
 */
async function updateBranchComment(cardId, commentId, branchName) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const commentText = `Branch: \`${branchName}\``;
    const result = await updateComment(cardId, commentId, token, commentText);
    
    if (result === null) {
      console.error(`Update returned null for card ${cardId}, comment ${commentId}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating comment for card ${cardId}, comment ${commentId}:`, error);
    console.error(`Error details:`, error.message || error);
    return false;
  }
}

/**
 * Add branch comments to all cards in a board
 * @param {string} boardId - Board ID
 * @param {boolean} skipWeek1 - Skip Week 1 cards
 * @param {boolean} updateExisting - Update existing comments to remove emojis
 * @returns {Promise<object>} Results summary
 */
export async function addBranchCommentsToBoard(boardId, skipWeek1 = false, updateExisting = true) {
  try {
    console.log('🚀 Starting to add branch comments...\n');

    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    // Get all lists
    const lists = await getBoardLists(boardId);
    console.log(`Found ${lists.length} lists\n`);

    let totalCards = 0;
    let commentedCards = 0;
    let updatedCards = 0;
    let skippedCards = 0;
    const errors = [];

    // Process each list
    for (const list of lists) {
      try {
        const cards = await getCardsInList(list.id);
        console.log(`\nProcessing list: ${list.name} (${cards.length} cards)`);

        for (const card of cards) {
          totalCards++;

          // Skip Week 1 cards if requested
          if (skipWeek1 && card.name.toLowerCase().includes('week 1')) {
            console.log(`  ⏭️  Skipped (Week 1): ${card.name}`);
            skippedCards++;
            continue;
          }

          const branchName = generateBranchName(card.name);
          
          // Check if card already has a branch comment
          const existingComment = await getExistingBranchComment(card.id);
          
          if (existingComment) {
            // Update existing comment to remove emoji if needed
            const commentText = existingComment.data?.text || existingComment.text || '';
            if (updateExisting && (commentText.includes('🌿') || commentText.includes('Branch:'))) {
              const success = await updateBranchComment(card.id, existingComment.id, branchName);
              if (success) {
                console.log(`  ↻ Updated branch comment: ${card.name} → ${branchName}`);
                updatedCards++;
              } else {
                console.log(`  ✗ Failed to update: ${card.name}`);
                errors.push(card.name);
              }
            } else {
              console.log(`  ⊙ Already has branch comment: ${card.name}`);
            }
          } else {
            // Add new comment
            const success = await addBranchComment(card.id, branchName);
            if (success) {
              console.log(`  ✓ Added branch comment: ${card.name} → ${branchName}`);
              commentedCards++;
            } else {
              console.log(`  ✗ Failed: ${card.name}`);
              errors.push(card.name);
            }
          }

          // Delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error processing list ${list.name}:`, error);
        errors.push(`List: ${list.name}`);
      }
    }

    console.log(`\n✅ Completed!`);
    console.log(`  Total cards: ${totalCards}`);
    console.log(`  New comments: ${commentedCards}`);
    console.log(`  Updated comments: ${updatedCards}`);
    console.log(`  Skipped: ${skippedCards}`);
    console.log(`  Errors: ${errors.length}`);

    return {
      success: true,
      totalCards,
      commentedCards,
      updatedCards,
      skippedCards,
      errors
    };
  } catch (error) {
    console.error('Error adding branch comments:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Remove emojis from existing branch comments
 * @param {string} boardId - Board ID
 * @returns {Promise<object>} Results summary
 */
export async function removeEmojisFromComments(boardId) {
  try {
    console.log('🚀 Starting to remove emojis from branch comments...\n');

    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    // Get all lists
    const lists = await getBoardLists(boardId);
    console.log(`Found ${lists.length} lists\n`);

    let totalCards = 0;
    let updatedCards = 0;
    const errors = [];

    // Process each list
    for (const list of lists) {
      try {
        const cards = await getCardsInList(list.id);
        console.log(`\nProcessing list: ${list.name} (${cards.length} cards)`);

        for (const card of cards) {
          totalCards++;

          // Check if card has a branch comment with emoji
          const existingComment = await getExistingBranchComment(card.id);
          
          if (existingComment) {
            const commentText = existingComment.data?.text || existingComment.text || '';
            if (commentText.includes('🌿') || (commentText.includes('Branch:') && commentText !== `Branch: \`${generateBranchName(card.name)}\``)) {
              const branchName = generateBranchName(card.name);
              const success = await updateBranchComment(card.id, existingComment.id, branchName);
              
              if (success) {
                console.log(`  ↻ Removed emoji from: ${card.name}`);
                updatedCards++;
              } else {
                console.log(`  ✗ Failed to update: ${card.name} (Comment ID: ${existingComment.id})`);
                errors.push(card.name);
              }
            }
          }

          // Delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        console.error(`Error processing list ${list.name}:`, error);
        errors.push(`List: ${list.name}`);
      }
    }

    console.log(`\n✅ Completed!`);
    console.log(`  Total cards: ${totalCards}`);
    console.log(`  Updated: ${updatedCards}`);
    console.log(`  Errors: ${errors.length}`);

    return {
      success: true,
      totalCards,
      updatedCards,
      errors
    };
  } catch (error) {
    console.error('Error removing emojis:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// %%%%%%%% END - COMMENT ADDING FUNCTIONS %%%%%%%

export { generateBranchName, addBranchComment, getExistingBranchComment, updateBranchComment };

