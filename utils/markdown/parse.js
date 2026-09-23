/**
 * Parse a TRELLO_BOARD_ORGANIZATION.md document into a structured board plan.
 */

const LABEL_EMOJI = '[🔴🟠🟡🔵🟢🟣⚪🐛📝🔧⚡]';

/**
 * Strip markdown inline formatting (backticks, bold, italic) from text sent to Trello.
 * @param {string} text
 * @returns {string}
 */
export function stripMarkdown(text) {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Parse the markdown file and extract board structure.
 * @param {string} content - Markdown file content
 * @returns {object} Parsed board structure
 */
export function parseMarkdownContent(content) {
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
        new RegExp(`^-\\s*(?:${LABEL_EMOJI}\\s+)?\\*\\*(.+?)\\*\\*\\s*[-—]\\s*\`(.+?)\``)
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
          line.match(new RegExp(`^-\\s*(?:${LABEL_EMOJI}\\s+)?\\*\\*(.+?)\\*\\*\\s*\\((.+?)\\)`)) ||
          line.match(new RegExp(`^-\\s*(?:${LABEL_EMOJI}\\s+)?\\*\\*(.+?)\\*\\*\\s*[-—]\\s*(.+)`));
        if (labelMatch) {
          result.labels.push({ name: labelMatch[1].trim(), color: null, description: labelMatch[2].trim() });
        } else {
          const labelSimple = line.match(new RegExp(`^-\\s*(?:${LABEL_EMOJI}\\s+)?\\*\\*(.+?)\\*\\*`));
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
          const cleanName = name.replace(new RegExp(`^${LABEL_EMOJI}\\s+`), '').trim();
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
