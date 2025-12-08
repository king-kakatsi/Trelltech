/**
 * Script to automatically create a Trello board from TRELLO_BOARD_ORGANIZATION.md
 * 
 * This script parses the markdown file and creates:
 * - Organization (if needed)
 * - Board with all lists
 * - Labels
 * - Cards with checklists, labels, assignees, and due dates
 * 
 * Usage: node scripts/createBoardFromMarkdown.js
 */

const fs = require('fs');
const path = require('path');

// Note: This script needs to be run in a Node.js environment with access to the services
// For React Native/Expo, you may need to adapt the imports or run this via a separate Node.js process

// %%%%%%%% HELPER FUNCTIONS %%%%%%%

/**
 * Create a label on a board
 * @param {string} boardId - Board ID
 * @param {string} name - Label name
 * @param {string} color - Label color (red, orange, yellow, green, blue, purple, pink, sky, lime, black)
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} postWithApi - Post API function
 * @returns {Promise<object>} Created label
 */
async function createLabel(boardId, name, color, token, apiKey, postWithApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/boards/${boardId}/labels?key=${apiKey}&token=${token}&name=${encodeURIComponent(name)}&color=${color}`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error(`Error creating label ${name}:`, error);
    throw error;
  }
}

/**
 * Get all labels for a board
 * @param {string} boardId - Board ID
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} getFromApi - Get API function
 * @returns {Promise<Array>} List of labels
 */
async function getBoardLabels(boardId, token, apiKey, getFromApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/boards/${boardId}/labels?key=${apiKey}&token=${token}`;
    const [success, data] = await getFromApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error('Error fetching board labels:', error);
    throw error;
  }
}

/**
 * Add a label to a card
 * @param {string} cardId - Card ID
 * @param {string} labelId - Label ID
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} postWithApi - Post API function
 * @returns {Promise<boolean>} Success status
 */
async function addLabelToCard(cardId, labelId, token, apiKey, postWithApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/idLabels?key=${apiKey}&token=${token}&value=${labelId}`;
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
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} postWithApi - Post API function
 * @returns {Promise<object>} Created checklist
 */
async function createChecklist(cardId, name, token, apiKey, postWithApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}/checklists?key=${apiKey}&token=${token}&name=${encodeURIComponent(name)}`;
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
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} postWithApi - Post API function
 * @returns {Promise<object>} Created checklist item
 */
async function addChecklistItem(checklistId, name, checked, token, apiKey, postWithApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/checklists/${checklistId}/checkItems?key=${apiKey}&token=${token}&name=${encodeURIComponent(name)}&checked=${checked}`;
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
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} updateWithApi - Update API function
 * @returns {Promise<boolean>} Success status
 */
async function setCardDueDate(cardId, dueDate, token, apiKey, updateWithApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/cards/${cardId}?key=${apiKey}&token=${token}&due=${encodeURIComponent(dueDate)}`;
    const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });

    if (!success) throw data;
    return true;
  } catch (error) {
    console.error(`Error setting due date:`, error);
    throw error;
  }
}

/**
 * Get workspace members to map assignee names
 * @param {string} workspaceId - Workspace ID
 * @param {string} token - Trello token
 * @param {string} apiKey - Trello API key
 * @param {Function} getFromApi - Get API function
 * @returns {Promise<Array>} List of members
 */
async function getWorkspaceMembers(workspaceId, token, apiKey, getFromApi) {
  try {
    if (!token) throw new Error('No token found');

    const endpoint = `/organizations/${workspaceId}/members?key=${apiKey}&token=${token}`;
    const [success, data] = await getFromApi(endpoint);

    if (!success) throw data;
    return data;
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    throw error;
  }
}

// %%%%%%%% END - HELPER FUNCTIONS %%%%%%%

// %%%%%%%% PARSING FUNCTIONS %%%%%%%

/**
 * Parse the markdown file and extract board structure
 * @param {string} filePath - Path to markdown file
 * @returns {Promise<object>} Parsed board structure
 */
function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
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
  let currentChecklist = null;
  let currentAcceptanceCriteria = null;

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
      if (currentCard) {
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
      }

      // Parse assignee
      if (line.startsWith('**Assignee:**')) {
        currentCard.assignee = line.replace('**Assignee:**', '').trim();
      }

      // Parse due date
      if (line.startsWith('**Due Date:**')) {
        currentCard.dueDate = line.replace('**Due Date:**', '').trim();
      }

      // Parse description
      if (line.startsWith('**Description:**')) {
        currentSection = 'description';
        continue;
      }

      if (currentSection === 'description' && line && !line.startsWith('**') && !line.startsWith('-')) {
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

      // Reset section on new headers
      if (line.startsWith('##') || line.startsWith('###')) {
        if (line.startsWith('### Card:')) {
          continue; // Already handled
        }
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
 * Find or create organization
 * @param {string} orgName - Organization name
 * @returns {Promise<string>} Organization ID
 */
async function findOrCreateOrganization(orgName) {
  try {
    const [success, workspaces] = await getAllWorkspaces();
    if (success && workspaces) {
      const existing = workspaces.find(ws => ws.displayName === orgName || ws.name === orgName);
      if (existing) {
        console.log(`✓ Found existing organization: ${orgName}`);
        return existing.id;
      }
    }

    console.log(`Creating organization: ${orgName}`);
    const newOrg = await postWorkspace(orgName);
    console.log(`✓ Created organization: ${orgName}`);
    return newOrg.id;
  } catch (error) {
    console.error('Error finding/creating organization:', error);
    throw error;
  }
}

/**
 * Create all labels on the board
 * @param {string} boardId - Board ID
 * @param {Array} labels - Array of label definitions
 * @returns {Promise<Map>} Map of label name to label ID
 */
async function createAllLabels(boardId, labels) {
  const labelMap = new Map();
  
  console.log(`\nCreating ${labels.length} labels...`);
  
  for (const label of labels) {
    try {
      const color = getLabelColor(label.emoji);
      const createdLabel = await createLabel(boardId, label.name, color);
      labelMap.set(label.name, createdLabel.id);
      console.log(`  ✓ Created label: ${label.emoji} ${label.name}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`  ✗ Failed to create label ${label.name}:`, error);
    }
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

      // Set due date
      if (cardDef.dueDate) {
        try {
          // Parse "End of Week X" or similar dates
          let dueDate = null;
          if (cardDef.dueDate.includes('Week')) {
            // For now, skip automatic date parsing - user can set manually
            console.log(`    ℹ Due date: ${cardDef.dueDate} (set manually)`);
          } else {
            // Try to parse ISO date
            dueDate = new Date(cardDef.dueDate).toISOString();
            if (!isNaN(new Date(dueDate).getTime())) {
              await setCardDueDate(card.id, dueDate);
              console.log(`    ✓ Set due date: ${cardDef.dueDate}`);
            }
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`    ✗ Failed to set due date`);
        }
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

// %%%%%%%% MAIN SCRIPT %%%%%%%

/**
 * Main function to create board from markdown
 */
async function createBoardFromMarkdown() {
  try {
    console.log('🚀 Starting board creation from markdown...\n');

    // Parse markdown file
    const markdownPath = path.join(__dirname, '..', 'TRELLO_BOARD_ORGANIZATION.md');
    console.log(`📖 Parsing ${markdownPath}...`);
    const boardStructure = parseMarkdownFile(markdownPath);
    
    console.log(`✓ Parsed structure:`);
    console.log(`  - Organization: ${boardStructure.organization}`);
    console.log(`  - Board: ${boardStructure.board}`);
    console.log(`  - Lists: ${boardStructure.lists.length}`);
    console.log(`  - Labels: ${boardStructure.labels.length}`);
    console.log(`  - Cards: ${boardStructure.cards.length}\n`);

    // Find or create organization
    const orgId = await findOrCreateOrganization(boardStructure.organization);
    
    // Create board
    console.log(`\nCreating board: ${boardStructure.board}`);
    const board = await createBoard(orgId, {
      name: boardStructure.board,
      desc: `Auto-generated from TRELLO_BOARD_ORGANIZATION.md`,
      template: 'blank'
    });
    console.log(`✓ Created board: ${board.name} (${board.id})\n`);

    // Create lists
    console.log(`Creating ${boardStructure.lists.length} lists...`);
    const listMap = new Map();
    for (let i = 0; i < boardStructure.lists.length; i++) {
      const listDef = boardStructure.lists[i];
      try {
        const list = await createList(board.id, listDef.name, i + 1);
        listMap.set(listDef.name, list.id);
        console.log(`  ✓ Created list: ${listDef.name}`);
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`  ✗ Failed to create list ${listDef.name}:`, error);
      }
    }

    // Create labels
    const labelMap = await createAllLabels(board.id, boardStructure.labels);

    // Get workspace members
    console.log(`\nFetching workspace members...`);
    const members = await getWorkspaceMembers(orgId);
    console.log(`✓ Found ${members.length} members`);

    // Create cards
    await createAllCards(board.id, listMap, labelMap, members, boardStructure.cards);

    console.log(`\n✅ Board creation complete!`);
    console.log(`\nBoard URL: https://trello.com/b/${board.shortLink}`);
    console.log(`Board ID: ${board.id}`);
  } catch (error) {
    console.error('\n❌ Error creating board:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createBoardFromMarkdown();
}

export { createBoardFromMarkdown, parseMarkdownFile };

