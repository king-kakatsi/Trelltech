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
import { createCard } from '../services/card';
import { addMember } from '../services/memberService';
import { getAllWorkspaces, postWorkspace, getWorkspaceMembers } from '../services/workspaces';
import { TRELLO_CONFIG } from './constants';
import { fetchFromLocalStorage } from '../services/localStorageService';
import { postWithApi, getFromApi, updateWithApi } from '../services/axiosService';

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
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/idLabels?key=${TRELLO_CONFIG.API_KEY}&token=${token}&value=${labelId}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return true;
  } catch (error) {
    console.error(`Error adding label to card:`, error);
    throw error;
  }
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
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    const endpoint = `/checklists/${checklistId}/checkItems?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(name)}&checked=${checked}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error(`Error adding checklist item:`, error);
    throw error;
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Parse organization
    if (line.startsWith('- **Organization:**')) {
      result.organization = line.replace('- **Organization:**', '').trim();
    }

    // Parse board name
    if (line.startsWith('- **Board:**')) {
      result.board = line.replace('- **Board:**', '').trim();
    }

    // Parse lists
    if (line === '## Lists (in order)' || line === '## Lists') {
      currentSection = 'lists';
      continue;
    }

    if (currentSection === 'lists' && /^\d+\./.test(line)) {
      const listMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*-\s*(.+)/);
      if (listMatch) {
        result.lists.push({
          name: listMatch[1],
          description: listMatch[2]
        });
      }
    }

    // Parse labels
    if (line === '## Labels') {
      currentSection = 'labels';
      continue;
    }

    if (currentSection === 'labels' && line.startsWith('- ')) {
      const labelMatch = line.match(/^-\s*(.+?)\s+\*\*(.+?)\*\*\s*\((.+?)\)/);
      if (labelMatch) {
        result.labels.push({
          emoji: labelMatch[1].trim(),
          name: labelMatch[2].trim(),
          description: labelMatch[3].trim()
        });
      }
    }

    // Parse cards
    if (line.startsWith('### Card:')) {
      if (currentCard && currentCard.title) {
        result.cards.push(currentCard);
      }
      currentCard = {
        title: line.replace('### Card:', '').replace(/"/g, '').trim(),
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
      // Parse list assignment
      if (line.startsWith('**List:**')) {
        currentCard.list = line.replace('**List:**', '').trim();
        currentSection = 'card';
      }

      // Parse labels
      if (line.startsWith('**Labels:**')) {
        const labelsText = line.replace('**Labels:**', '').trim();
        const labelMatches = labelsText.match(/([🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡])\s+([^\s,]+)/g);
        if (labelMatches) {
          currentCard.labels = labelMatches.map(match => {
            const parts = match.trim().split(/\s+/);
            return {
              emoji: parts[0],
              name: parts.slice(1).join(' ')
            };
          });
        }
        currentSection = 'card';
      }

      // Parse assignee
      if (line.startsWith('**Assignee:**')) {
        currentCard.assignee = line.replace('**Assignee:**', '').trim();
        currentSection = 'card';
      }

      // Parse due date
      if (line.startsWith('**Due Date:**')) {
        currentCard.dueDate = line.replace('**Due Date:**', '').trim();
        currentSection = 'card';
      }

      // Parse description
      if (line.startsWith('**Description:**')) {
        currentSection = 'description';
        continue;
      }

      if (currentSection === 'description' && line && !line.startsWith('**') && !line.startsWith('-') && !line.startsWith('##')) {
        if (currentCard.description) currentCard.description += '\n';
        currentCard.description += line;
      }

      // Parse checklist
      if (line === '**Checklist:**') {
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

      // Parse acceptance criteria
      if (line === '**Acceptance Criteria:**') {
        currentSection = 'acceptance';
        continue;
      }

      if (currentSection === 'acceptance' && line.startsWith('- ')) {
        currentCard.acceptanceCriteria.push(line.replace('- ', '').trim());
      }

      // Reset section on new headers (but not card headers)
      if (line.startsWith('##') && !line.startsWith('### Card:')) {
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
 * Map emoji to Trello label color
 * @param {string} emoji - Emoji character
 * @returns {string} Trello color name
 */
function getLabelColor(emoji) {
  const colorMap = {
    '🔴': 'red',
    '🟠': 'orange',
    '🟡': 'yellow',
    '🟢': 'green',
    '🔵': 'blue',
    '🟣': 'purple',
    '⚪': 'black',
    '🐛': 'red',
    '📝': 'blue',
    '🔧': 'orange',
    '⚡': 'yellow'
  };
  return colorMap[emoji] || 'blue';
}

/**
 * Find organization by name
 * @param {string} orgName - Organization name
 * @returns {Promise<string>} Organization ID
 */
async function findOrganization(orgName) {
  try {
    const [success, workspaces] = await getAllWorkspaces();
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

    throw new Error(`Organization "${orgName}" not found. Please create it first or check the name.`);
  } catch (error) {
    console.error('Error finding organization:', error);
    throw error;
  }
}

/**
 * Find board by name in organization
 * @param {string} orgId - Organization ID
 * @param {string} boardName - Board name
 * @returns {Promise<object>} Board object
 */
async function findBoard(orgId, boardName) {
  try {
    const boards = await getWorkspaceBoards(orgId);
    const existing = boards.find(board => 
      board.name?.toLowerCase() === boardName.toLowerCase() && !board.closed
    );
    
    if (existing) {
      console.log(`✓ Found board: ${boardName} (${existing.id})`);
      return existing;
    }

    throw new Error(`Board "${boardName}" not found in organization. Please create it first or check the name.`);
  } catch (error) {
    console.error('Error finding board:', error);
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
          const color = getLabelColor(label.emoji);
          const createdLabel = await createLabel(boardId, label.name, color);
          labelMap.set(label.name, createdLabel.id);
          console.log(`  ✓ Created label: ${label.emoji} ${label.name}`);
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`  ✗ Failed to create label ${label.name}:`, error);
        }
      } else {
        console.log(`  ✓ Label already exists: ${label.emoji} ${label.name}`);
      }
    }
  } catch (error) {
    console.error('Error finding/creating labels:', error);
    throw error;
  }
  
  return labelMap;
}

/**
 * Create all cards with their properties
 * @param {string} boardId - Board ID
 * @param {Map} listMap - Map of list name to list ID
 * @param {Map} labelMap - Map of label name to label ID
 * @param {Array} members - Array of workspace members
 * @param {Array} cards - Array of card definitions
 */
async function createAllCards(boardId, listMap, labelMap, members, cards) {
  console.log(`\nCreating ${cards.length} cards...`);
  
  for (const cardDef of cards) {
    try {
      const listId = listMap.get(cardDef.list);
      if (!listId) {
        console.log(`  ✗ Skipping card "${cardDef.title}" - list "${cardDef.list}" not found`);
        continue;
      }

      // Build card description
      let description = cardDef.description || '';
      if (cardDef.acceptanceCriteria.length > 0) {
        if (description) description += '\n\n';
        description += '**Acceptance Criteria:**\n';
        description += cardDef.acceptanceCriteria.map(c => `- ${c}`).join('\n');
      }

      // Create card
      const card = await createCard(listId, cardDef.title, description);
      console.log(`  ✓ Created card: ${cardDef.title}`);

      // Add labels
      for (const labelDef of cardDef.labels) {
        const labelId = labelMap.get(labelDef.name);
        if (labelId) {
          try {
            await addLabelToCard(card.id, labelId);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`    ✗ Failed to add label ${labelDef.name} to card`);
          }
        }
      }

      // Add assignee (if specified and member exists)
      if (cardDef.assignee && cardDef.assignee !== 'You') {
        // Try to find member by username or fullName
        const member = members.find(m => 
          m.username?.toLowerCase() === cardDef.assignee.toLowerCase() ||
          m.fullName?.toLowerCase() === cardDef.assignee.toLowerCase() ||
          m.username?.toLowerCase().includes(cardDef.assignee.toLowerCase())
        );
        
        if (member) {
          try {
            await addMember('card', card.id, member.id);
            console.log(`    ✓ Assigned to: ${member.fullName || member.username}`);
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`    ✗ Failed to assign member`);
          }
        }
      }

      // Set due date (skip for now - user can set manually)
      if (cardDef.dueDate) {
        console.log(`    ℹ Due date: ${cardDef.dueDate} (set manually in Trello)`);
      }

      // Create checklist
      if (cardDef.checklist.length > 0) {
        try {
          const checklist = await createChecklist(card.id, 'Checklist');
          console.log(`    ✓ Created checklist with ${cardDef.checklist.length} items`);
          
          for (const item of cardDef.checklist) {
            await addChecklistItem(checklist.id, item.name, item.checked);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`    ✗ Failed to create checklist`);
        }
      }

      // Delay between cards to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Failed to create card "${cardDef.title}":`, error);
    }
  }
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

    // Find existing organization
    const orgId = await findOrganization(boardStructure.organization);
    
    // Find existing board
    console.log(`\nFinding board: ${boardStructure.board}`);
    const board = await findBoard(orgId, boardStructure.board);
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

export { parseMarkdownContent };

