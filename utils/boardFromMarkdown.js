/**
 * Utility to create Trello board from TRELLO_BOARD_ORGANIZATION.md
 * 
 * This module parses the markdown file and creates:
 * - Organization (if needed)
 * - Board with all lists
 * - Labels
 * - Cards with checklists, labels, assignees, and due dates
 * 
 * Usage: Import and call createBoardFromMarkdown() from within your React Native app
 */

import { createBoard, createList, getBoardLists, getWorkspaceBoards } from '../services/boardService';
import { createCard, getCardsInList } from '../services/card';
import { addMember } from '../services/memberService';
import { getAllWorkspaces, postWorkspace, getWorkspaceMembers } from '../services/workspaces';
import { TRELLO_CONFIG } from './constants';
import { fetchFromLocalStorage } from '../services/localStorageService';
import { postWithApi, getFromApi, updateWithApi } from '../services/axiosService';

// %%%%%%%% RETRY HELPER %%%%%%%

/**
 * Retry an async fn up to maxAttempts times with exponential back-off.
 * Waits baseMs, 2×baseMs, 4×baseMs … between attempts.
 */
async function withRetry(fn, maxAttempts = 3, baseMs = 1000) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) {
        const wait = baseMs * Math.pow(2, attempt - 1);
        console.warn(`  ↺ Attempt ${attempt} failed (${err.message}), retrying in ${wait}ms…`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

// %%%%%%%% END - RETRY HELPER %%%%%%%

// %%%%%%%% HELPER FUNCTIONS %%%%%%%

/**
 * Create a label on a board
 * @param {string} boardId - Board ID
 * @param {string} name - Label name
 * @param {string} color - Label color
 * @returns {Promise<object>} Created label
 */
async function createLabel(boardId, name, color = 'blue') {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/boards/${boardId}/labels?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(name)}&color=${color}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error(`Error creating label ${name}:`, error);
    throw error;
  }
}

/**
 * Add a label to a card
 * @param {string} cardId - Card ID
 * @param {string} labelId - Label ID
 * @returns {Promise<boolean>} Success status
 */
async function addLabelToCard(cardId, labelId) {
  return withRetry(async () => {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/idLabels?key=${TRELLO_CONFIG.API_KEY}&token=${token}&value=${labelId}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw new Error(data?.message || 'addLabelToCard failed');
    return true;
  });
}

/**
 * Create a checklist on a card
 * @param {string} cardId - Card ID
 * @param {string} name - Checklist name
 * @returns {Promise<object>} Created checklist
 */
async function createChecklist(cardId, name) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/checklists?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(name)}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error(`Error creating checklist:`, error);
    throw error;
  }
}

/**
 * Add an item to a checklist
 * @param {string} checklistId - Checklist ID
 * @param {string} name - Item name
 * @param {boolean} checked - Whether item is checked
 * @returns {Promise<object>} Created checklist item
 */
async function addChecklistItem(checklistId, name, checked = false) {
  const cleanName = stripMarkdown(name);
  return withRetry(async () => {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/checklists/${checklistId}/checkItems?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(cleanName)}&checked=${checked}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw new Error(data?.message || 'addChecklistItem failed');
    return data;
  });
}

/**
 * Get checklists for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} List of checklists
 */
async function getCardChecklists(cardId) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/checklists?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
    const [success, data] = await getFromApi(endpoint);

    if (!success) throw data;
    return data || [];
  } catch (error) {
    console.error(`Error getting checklists:`, error);
    return [];
  }
}

/**
 * Get checklist items
 * @param {string} checklistId - Checklist ID
 * @returns {Promise<Array>} List of checklist items
 */
async function getChecklistItems(checklistId) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/checklists/${checklistId}/checkItems?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
    const [success, data] = await getFromApi(endpoint);

    if (!success) throw data;
    return data || [];
  } catch (error) {
    console.error(`Error getting checklist items:`, error);
    return [];
  }
}

/**
 * Update card description
 * @param {string} cardId - Card ID
 * @param {string} description - New description
 * @returns {Promise<boolean>} Success status
 */
async function updateCardDescription(cardId, description) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&desc=${encodeURIComponent(description)}`;
    const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });

    if (!success) throw data;
    return true;
  } catch (error) {
    console.error(`Error updating card description:`, error);
    return false;
  }
}

/**
 * Find existing card by name in a list
 * @param {string} listId - List ID
 * @param {string} cardName - Card name to search for
 * @returns {Promise<object|null>} Existing card or null
 */
async function findExistingCard(listId, cardName) {
  try {
    const cards = await getCardsInList(listId);
    const existingCard = cards.find(card => 
      card.name.trim().toLowerCase() === cardName.trim().toLowerCase()
    );
    return existingCard || null;
  } catch (error) {
    console.error(`Error finding existing card:`, error);
    return null;
  }
}

/**
 * Update card due date
 * @param {string} cardId - Card ID
 * @param {string} dueDate - Due date in ISO format
 * @returns {Promise<boolean>} Success status
 */
async function setCardDueDate(cardId, dueDate) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&due=${encodeURIComponent(dueDate)}`;
    const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });

    if (!success) throw data;
    return true;
  } catch (error) {
    console.error(`Error setting due date:`, error);
    throw error;
  }
}

// %%%%%%%% END - HELPER FUNCTIONS %%%%%%%

// %%%%%%%% PARSING FUNCTIONS %%%%%%%

/**
 * Parse the markdown file and extract board structure
 * @param {string} content - Markdown file content
 * @returns {object} Parsed board structure
 */
function parseMarkdownContent(content) {
  const lines = content.split('\n');

  const result = {
    organization: null,
    board: null,
    lists: [],
    labels: [],
    cards: []
  };

  let currentSection = null;
  let currentCard = null;

  // Normalize a line: collapse " :" to ":" for field matching (handles French " :" spacing)
  const norm = (line) => line.replace(/\s+:/g, ':');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const n = norm(line);

    // Parse organization (English or French)
    if (n.startsWith('- **Organization:**') || n.startsWith('- **Organisation:**')) {
      result.organization = n.replace(/^-\s*\*\*(Organization|Organisation):\*\*\s*/, '').trim();
    }

    // Parse board name
    if (n.startsWith('- **Board:**')) {
      result.board = n.replace('- **Board:**', '').trim();
    }

    // Parse lists
    if (line === '## Lists (in order)' || line === '## Lists' || line === '## Listes') {
      currentSection = 'lists';
      continue;
    }

    if (currentSection === 'lists' && /^\d+\./.test(line)) {
      // Support both "- " and "—" as separator
      const listMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*[-—]\s*(.+)/);
      if (listMatch) {
        result.lists.push({
          name: listMatch[1],
          description: listMatch[2]
        });
      } else {
        // List with no description
        const listMatchSimple = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
        if (listMatchSimple) {
          result.lists.push({ name: listMatchSimple[1], description: '' });
        }
      }
    }

    // Parse labels
    if (line === '## Labels') {
      currentSection = 'labels';
      continue;
    }

    if (currentSection === 'labels' && line.startsWith('- ')) {
      // Format: - **Name** — `color` — description  (BUSGO style)
      const withBacktickColor = line.match(
        /^-\s*(?:[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]\s+)?\*\*(.+?)\*\*\s*[-—]\s*`(.+?)`/
      );
      if (withBacktickColor) {
        result.labels.push({
          name: withBacktickColor[1].trim(),
          color: withBacktickColor[2].trim(),
          description: '',
        });
      } else {
        // Format: - **Name** (description)  or  - **Name** — description
        const labelMatch =
          line.match(/^-\s*(?:[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]\s+)?\*\*(.+?)\*\*\s*\((.+?)\)/) ||
          line.match(/^-\s*(?:[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]\s+)?\*\*(.+?)\*\*\s*[-—]\s*(.+)/);
        if (labelMatch) {
          result.labels.push({ name: labelMatch[1].trim(), color: null, description: labelMatch[2].trim() });
        } else {
          const labelSimple = line.match(/^-\s*(?:[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]\s+)?\*\*(.+?)\*\*/);
          if (labelSimple) {
            result.labels.push({ name: labelSimple[1].trim(), color: null, description: '' });
          }
        }
      }
    }

    // Parse cards — support "### Card: title" and "### Carte : title" and "## Carte N : title"
    const cardHeaderMatch =
      line.match(/^###\s+(?:Card|Carte)\s*:\s*"?(.+?)"?\s*$/) ||
      line.match(/^##\s+Carte\s+[\d]*[a-zA-Z]?\s*:\s*(.+?)\s*$/);
    if (cardHeaderMatch) {
      if (currentCard && currentCard.title) {
        result.cards.push(currentCard);
      }
      currentCard = {
        title: cardHeaderMatch[1].replace(/"/g, '').trim(),
        list: null,
        labels: [],
        assignee: null,
        dueDate: null,
        description: '',
        checklist: [],
        acceptanceCriteria: []
      };
      currentSection = 'card';
      continue;
    }

    if (currentCard) {
      // Parse list assignment (English or French)
      if (n.startsWith('**List:**') || n.startsWith('**Liste:**')) {
        currentCard.list = n.replace(/^\*\*(List|Liste):\*\*\s*/, '').trim();
        currentSection = 'card';
      }

      // Parse labels
      if (n.startsWith('**Labels:**')) {
        const labelsText = n.replace('**Labels:**', '').trim();
        const labelNames = labelsText.split(',').map(l => l.trim()).filter(l => l);
        currentCard.labels = labelNames.map(name => {
          const cleanName = name.replace(/^[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]\s+/, '').trim();
          return { name: cleanName };
        });
        currentSection = 'card';
      }

      // Parse assignee
      if (n.startsWith('**Assignee:**')) {
        currentCard.assignee = n.replace('**Assignee:**', '').trim();
        currentSection = 'card';
      }

      // Parse due date (English or French)
      if (n.startsWith('**Due Date:**') || n.startsWith('**Échéance:**') || n.startsWith('**Echeance:**')) {
        currentCard.dueDate = n.replace(/^\*\*(Due Date|Échéance|Echeance):\*\*\s*/, '').trim();
        currentSection = 'card';
      }

      // Parse description (English or French)
      if (n.startsWith('**Description:**')) {
        currentSection = 'description';
        continue;
      }

      if (currentSection === 'description' && line && !line.startsWith('**') && !line.startsWith('##')) {
        // Allow "-" lines in description (file paths etc.), but stop on checklist markers
        if (line.startsWith('- [')) {
          // This is a checklist item, handled below — fall through
        } else {
          if (currentCard.description) currentCard.description += '\n';
          currentCard.description += line;
          continue;
        }
      }

      // Parse checklist (English or French)
      if (n === '**Checklist:**') {
        currentSection = 'checklist';
        continue;
      }

      if (currentSection === 'checklist' && line.startsWith('- [')) {
        const itemText = line.replace(/^-\s*\[[x\s]\]\s*/, '').trim();
        currentCard.checklist.push({
          name: itemText,
          checked: line.includes('[x]') || line.includes('[X]')
        });
      }

      // Parse acceptance criteria (English or French)
      if (n === "**Acceptance Criteria:**" || n === "**Critères d'acceptation:**" || n === "**Criteres d'acceptation:**") {
        currentSection = 'acceptance';
        continue;
      }

      if (currentSection === 'acceptance' && line.startsWith('- ')) {
        currentCard.acceptanceCriteria.push(line.replace(/^-\s*/, '').trim());
      }

      // Reset section on new card headers
      if (cardHeaderMatch) {
        currentSection = null;
      }

      // End of card section
      if (line === '---' && currentCard) {
        if (currentCard.title) {
          result.cards.push(currentCard);
        }
        currentCard = null;
        currentSection = null;
      }
    }
  }

  // Add last card if exists
  if (currentCard && currentCard.title) {
    result.cards.push(currentCard);
  }

  return result;
}

// %%%%%%%% END - PARSING FUNCTIONS %%%%%%%

// %%%%%%%% MAIN CREATION FUNCTIONS %%%%%%%

/**
 * Map an emoji or French color name to a Trello-accepted color string.
 * Trello valid colors: yellow, purple, blue, red, green, orange, black, sky, pink, lime
 */
function getLabelColor(hint) {
  const emojiMap = {
    '🔴': 'red', '🟠': 'orange', '🟡': 'yellow', '🟢': 'green',
    '🔵': 'blue', '🟣': 'purple', '⚪': 'black',
    '🐛': 'red', '📝': 'blue', '🔧': 'orange', '⚡': 'yellow',
  };
  const frenchMap = {
    vert: 'green', bleu: 'blue', rouge: 'red', jaune: 'yellow',
    orange: 'orange', violet: 'purple', turquoise: 'green',
    cyan: 'sky', rose: 'pink', lime: 'lime', magenta: 'pink',
    sky: 'sky', noir: 'black', blanc: null,
  };
  return emojiMap[hint] || frenchMap[hint?.toLowerCase()] || 'blue';
}

/** Strip markdown inline formatting (backticks, bold, italic) from text sent to Trello. */
function stripMarkdown(text) {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Find organization by name
 * @param {string} orgName - Organization name
 * @returns {Promise<string>} Organization ID
 */
async function findOrCreateOrganization(orgName) {
  try {
    const res = await getAllWorkspaces();
    const success = res[0];
    const workspaces = res[1];
    
    if (success && workspaces) {
      const existing = workspaces.find(ws => 
        ws.displayName?.toLowerCase() === orgName.toLowerCase() || 
        ws.name?.toLowerCase() === orgName.toLowerCase()
      );
      if (existing) {
        console.log(`✓ Found organization: ${orgName} (${existing.id})`);
        return existing.id;
      }
    }

    console.log(`Creating organization: ${orgName}`);
    const newOrg = await postWorkspace(orgName);
    console.log(`✓ Created organization: ${orgName} (${newOrg.id})`);
    return newOrg.id;
  } catch (error) {
    console.error('Error finding/creating organization:', error);
    throw error;
  }
}

/**
 * Find board by name in organization
 * @param {string} orgId - Organization ID
 * @param {string} boardName - Board name
 * @returns {Promise<object>} Board object
 */
async function findOrCreateBoard(orgId, boardName) {
  try {
    const boards = await getWorkspaceBoards(orgId);
    const existing = boards.find(board => 
      board.name?.toLowerCase() === boardName.toLowerCase() && !board.closed
    );
    
    if (existing) {
      console.log(`✓ Found board: ${boardName} (${existing.id})`);
      return existing;
    }

    console.log(`Creating board: ${boardName}`);
    const board = await createBoard(orgId, {
      name: boardName,
      desc: `Auto-generated from markdown board configuration`,
      template: 'blank'
    });
    console.log(`✓ Created board: ${boardName} (${board.id})`);
    return board;
  } catch (error) {
    console.error('Error finding/creating board:', error);
    throw error;
  }
}

/**
 * Find lists in board and create map
 * @param {string} boardId - Board ID
 * @param {Array} expectedLists - Array of expected list names
 * @returns {Promise<Map>} Map of list name to list ID
 */
async function findOrCreateLists(boardId, expectedLists) {
  const listMap = new Map();
  
  try {
    // Get existing lists
    const existingLists = await getBoardLists(boardId);
    console.log(`\nFound ${existingLists.length} existing lists in board`);
    
    // Map existing lists
    for (const list of existingLists) {
      listMap.set(list.name, list.id);
      console.log(`  ✓ Found list: ${list.name}`);
    }
    
    // Create missing lists
    for (const expectedList of expectedLists) {
      if (!listMap.has(expectedList.name)) {
        try {
          console.log(`  Creating missing list: ${expectedList.name}`);
          const newList = await createList(boardId, expectedList.name);
          listMap.set(expectedList.name, newList.id);
          console.log(`  ✓ Created list: ${expectedList.name}`);
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`  ✗ Failed to create list ${expectedList.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error finding/creating lists:', error);
    throw error;
  }
  
  return listMap;
}

/**
 * Get existing labels and create missing ones
 * @param {string} boardId - Board ID
 * @param {Array} labels - Array of label definitions
 * @returns {Promise<Map>} Map of label name to label ID
 */
async function findOrCreateLabels(boardId, labels) {
  const labelMap = new Map();
  
  try {
    // Get existing labels
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');
    
    const endpoint = `/boards/${boardId}/labels?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
    const [success, existingLabels] = await getFromApi(endpoint);
    
    if (success && existingLabels) {
      console.log(`\nFound ${existingLabels.length} existing labels`);
      for (const label of existingLabels) {
        if (label.name) {
          labelMap.set(label.name, label.id);
          console.log(`  ✓ Found label: ${label.name}`);
        }
      }
    }
    
    // Create missing labels
    console.log(`\nChecking for missing labels...`);
    for (const label of labels) {
      if (!labelMap.has(label.name)) {
        try {
          const color = getLabelColor(label.color || label.name);
          const createdLabel = await createLabel(boardId, label.name, color);
          labelMap.set(label.name, createdLabel.id);
          console.log(`  ✓ Created label: ${label.name} (${color})`);
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (error) {
          console.error(`  ✗ Failed to create label ${label.name}:`, error);
        }
      } else {
        console.log(`  ✓ Label already exists: ${label.name}`);
      }
    }
  } catch (error) {
    console.error('Error finding/creating labels:', error);
    throw error;
  }
  
  return labelMap;
}

/**
 * Update existing card with new properties
 * @param {object} card - Existing card object
 * @param {object} cardDef - Card definition from markdown
 * @param {Map} labelMap - Map of label name to label ID
 * @param {Array} members - Array of workspace members
 * @returns {Promise<boolean>} Success status
 */
async function updateExistingCard(card, cardDef, labelMap, members) {
  try {
    let updated = false;

    // Build card description
    let description = cardDef.description || '';
    if (cardDef.acceptanceCriteria.length > 0) {
      if (description) description += '\n\n';
      description += '**Acceptance Criteria:**\n';
      description += cardDef.acceptanceCriteria.map(c => `- ${c}`).join('\n');
    }

    // Update description if different
    if (card.desc !== description) {
      await updateCardDescription(card.id, description);
      updated = true;
      console.log(`    ↻ Updated description`);
    }

    // Add missing labels
    const existingLabelIds = new Set(card.idLabels || []);
    for (const labelDef of cardDef.labels) {
      const labelId = labelMap.get(labelDef.name);
      if (labelId && !existingLabelIds.has(labelId)) {
        try {
          await addLabelToCard(card.id, labelId);
          console.log(`    ✓ Added label: ${labelDef.name}`);
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`    ✗ Failed to add label ${labelDef.name}`);
        }
      }
    }

    // Add assignee (if specified and member exists and not already assigned)
    if (cardDef.assignee && cardDef.assignee !== 'You') {
      const member = members.find(m => 
        m.username?.toLowerCase() === cardDef.assignee.toLowerCase() ||
        m.fullName?.toLowerCase() === cardDef.assignee.toLowerCase() ||
        m.username?.toLowerCase().includes(cardDef.assignee.toLowerCase())
      );
      
      if (member) {
        const isAssigned = card.idMembers?.includes(member.id);
        if (!isAssigned) {
          try {
            await addMember('card', card.id, member.id);
            console.log(`    ✓ Assigned to: ${member.fullName || member.username}`);
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`    ✗ Failed to assign member`);
          }
        }
      }
    }

    // Update checklist - add missing items
    if (cardDef.checklist.length > 0) {
      try {
        const checklists = await getCardChecklists(card.id);
        let checklist = checklists.find(c => c.name === 'Checklist');
        
        if (!checklist) {
          checklist = await createChecklist(card.id, 'Checklist');
          console.log(`    ✓ Created checklist`);
        }

        // Get existing items
        const existingItems = await getChecklistItems(checklist.id);
        const existingItemNames = new Set(existingItems.map(item => item.name.trim().toLowerCase()));

        // Add missing items
        let addedItems = 0;
        for (const item of cardDef.checklist) {
          if (!existingItemNames.has(item.name.trim().toLowerCase())) {
            await addChecklistItem(checklist.id, item.name, item.checked);
            addedItems++;
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        }

        if (addedItems > 0) {
          console.log(`    ✓ Added ${addedItems} new checklist items`);
        }
      } catch (error) {
        console.error(`    ✗ Failed to update checklist`);
      }
    }

    return updated;
  } catch (error) {
    console.error(`Error updating card:`, error);
    return false;
  }
}

/**
 * Create all cards with their properties (or update existing ones)
 * @param {string} boardId - Board ID
 * @param {Map} listMap - Map of list name to list ID
 * @param {Map} labelMap - Map of label name to label ID
 * @param {Array} members - Array of workspace members
 * @param {Array} cards - Array of card definitions
 */
async function createAllCards(boardId, listMap, labelMap, members, cards) {
  console.log(`\nProcessing ${cards.length} cards...`);
  
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const cardDef of cards) {
    try {
      const listId = listMap.get(cardDef.list);
      if (!listId) {
        console.log(`  ✗ Skipping card "${cardDef.title}" - list "${cardDef.list}" not found`);
        skippedCount++;
        continue;
      }

      // Check if card already exists
      const existingCard = await findExistingCard(listId, cardDef.title);
      
      if (existingCard) {
        console.log(`  ⊙ Found existing card: ${cardDef.title}`);
        const updated = await updateExistingCard(existingCard, cardDef, labelMap, members);
        if (updated) {
          updatedCount++;
        } else {
          console.log(`    ✓ Card already up to date`);
        }
      } else {
        // Build card description
        let description = cardDef.description || '';
        if (cardDef.acceptanceCriteria.length > 0) {
          if (description) description += '\n\n';
          description += '**Acceptance Criteria:**\n';
          description += cardDef.acceptanceCriteria.map(c => `- ${c}`).join('\n');
        }

        // Create new card
        const card = await createCard(listId, cardDef.title, description);
        console.log(`  ✓ Created card: ${cardDef.title}`);
        createdCount++;

        // Add labels
        for (const labelDef of cardDef.labels) {
          const labelId = labelMap.get(labelDef.name);
          if (labelId) {
            try {
              await addLabelToCard(card.id, labelId);
              await new Promise(resolve => setTimeout(resolve, 250));
            } catch (error) {
              console.error(`    ✗ Failed to add label ${labelDef.name} to card`);
            }
          }
        }

        // Add assignee (if specified and member exists)
        if (cardDef.assignee && cardDef.assignee !== 'You') {
          const member = members.find(m =>
            m.username?.toLowerCase() === cardDef.assignee.toLowerCase() ||
            m.fullName?.toLowerCase() === cardDef.assignee.toLowerCase() ||
            m.username?.toLowerCase().includes(cardDef.assignee.toLowerCase())
          );

          if (member) {
            try {
              await addMember('card', card.id, member.id);
              console.log(`    ✓ Assigned to: ${member.fullName || member.username}`);
              await new Promise(resolve => setTimeout(resolve, 300));
            } catch (error) {
              console.error(`    ✗ Failed to assign member`);
            }
          }
        }

        // Create checklist
        if (cardDef.checklist.length > 0) {
          try {
            const checklist = await createChecklist(card.id, 'Checklist');
            console.log(`    ✓ Created checklist with ${cardDef.checklist.length} items`);

            for (const item of cardDef.checklist) {
              await addChecklistItem(checklist.id, item.name, item.checked);
              await new Promise(resolve => setTimeout(resolve, 250));
            }
          } catch (error) {
            console.error(`    ✗ Failed to create checklist`);
          }
        }
      }

      // Delay between cards to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error(`  ✗ Failed to process card "${cardDef.title}":`, error);
      skippedCount++;
    }
  }

  console.log(`\n✅ Card processing complete!`);
  console.log(`  Created: ${createdCount}`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
}

// %%%%%%%% END - MAIN CREATION FUNCTIONS %%%%%%%

// %%%%%%%% MAIN FUNCTION %%%%%%%


/**
 * Main function to create board from markdown
 * @param {string} markdownContent - Content of the markdown file (REQUIRED - pass the file content as string)
 * @returns {Promise<object>} Created board information
 */
export async function createBoardFromMarkdown(markdownContent) {
  try {
    console.log('🚀 Starting board creation from markdown...\n');

    // Require markdown content
    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('markdownContent parameter is required. Please provide the content of TRELLO_BOARD_ORGANIZATION.md as a string.');
    }

    const content = markdownContent;

    // Parse markdown file
    console.log(`📖 Parsing markdown content...`);
    const boardStructure = parseMarkdownContent(content);
    
    console.log(`✓ Parsed structure:`);
    console.log(`  - Organization: ${boardStructure.organization}`);
    console.log(`  - Board: ${boardStructure.board}`);
    console.log(`  - Lists: ${boardStructure.lists.length}`);
    console.log(`  - Labels: ${boardStructure.labels.length}`);
    console.log(`  - Cards: ${boardStructure.cards.length}\n`);

    // Find or create organization
    const orgId = await findOrCreateOrganization(boardStructure.organization);
    
    // Find or create board
    console.log(`\nFinding/Creating board: ${boardStructure.board}`);
    const board = await findOrCreateBoard(orgId, boardStructure.board);
    console.log(`✓ Using board: ${board.name} (${board.id})\n`);

    // Find existing lists (create missing ones if needed)
    const listMap = await findOrCreateLists(board.id, boardStructure.lists);

    // Find existing labels (create missing ones if needed)
    const labelMap = await findOrCreateLabels(board.id, boardStructure.labels);

    // Get workspace members
    console.log(`\nFetching workspace members...`);
    const [success, members] = await getWorkspaceMembers(orgId);
    const memberList = success ? members : [];
    console.log(`✓ Found ${memberList.length} members`);

    // Create cards
    await createAllCards(board.id, listMap, labelMap, memberList, boardStructure.cards);

    console.log(`\n✅ Board creation complete!`);
    console.log(`\nBoard URL: https://trello.com/b/${board.shortLink}`);
    console.log(`Board ID: ${board.id}`);
    
    return {
      success: true,
      board,
      boardUrl: `https://trello.com/b/${board.shortLink}`
    };
  } catch (error) {
    console.error('\n❌ Error creating board:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// %%%%%%%% END - MAIN FUNCTION %%%%%%%

// %%%%%%%% LABEL CLEANUP FUNCTION %%%%%%%

/**
 * Delete all labels on a board whose names match those defined in the provided
 * markdown content.  Labels that exist on the board but are NOT in the markdown
 * are left untouched.
 *
 * @param {string} markdownContent - Content of BUSGO_TRELLO.md
 * @returns {Promise<{success: boolean, deleted: string[], kept: string[], error?: string}>}
 */
export async function deleteMarkdownLabelsFromBoard(markdownContent) {
  try {
    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('markdownContent is required');
    }

    const { organization: orgName, board: boardName, labels: mdLabels } =
      parseMarkdownContent(markdownContent);

    const mdLabelNames = new Set(mdLabels.map((l) => l.name.trim().toLowerCase()));

    console.log(
      `🗑️  Will delete labels matching: ${[...mdLabelNames].join(', ')}`
    );

    // Resolve org → board
    const orgId = await findOrCreateOrganization(orgName);
    const board = await findOrCreateBoard(orgId, boardName);

    // Fetch all labels currently on the board
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No Trello token found – please log in first');

    const endpoint = `/boards/${board.id}/labels?key=${TRELLO_CONFIG.API_KEY}&token=${token}&limit=1000`;
    const [ok, boardLabels] = await getFromApi(endpoint);
    if (!ok) throw new Error('Failed to fetch board labels');

    const deleted = [];
    const kept = [];

    for (const label of boardLabels) {
      const nameLower = (label.name || '').trim().toLowerCase();
      if (mdLabelNames.has(nameLower)) {
        // Use fetch() directly — Axios adds Content-Type: application/json which
        // triggers a CORS preflight on DELETE that causes 30s timeouts.
        // A plain fetch DELETE with no custom headers is a "simple" CORS request.
        const url = `https://api.trello.com/1/labels/${label.id}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        const response = await fetch(url, { method: 'DELETE' });
        if (response.ok) {
          deleted.push(label.name);
          console.log(`  ✓ Deleted label: ${label.name}`);
        } else {
          console.warn(`  ✗ Could not delete label: ${label.name} (${response.status})`);
        }
        await new Promise((r) => setTimeout(r, 300));
      } else {
        kept.push(label.name || '(unnamed)');
        console.log(`  — Kept label: ${label.name || '(unnamed)'}`);
      }
    }

    console.log(`\n✅ Done – deleted ${deleted.length}, kept ${kept.length}`);
    return { success: true, deleted, kept };
  } catch (error) {
    console.error('❌ deleteMarkdownLabelsFromBoard:', error);
    return { success: false, deleted: [], kept: [], error: error.message };
  }
}

// %%%%%%%% END - LABEL CLEANUP FUNCTION %%%%%%%

export { parseMarkdownContent };

