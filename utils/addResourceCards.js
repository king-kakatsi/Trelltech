import { createCard } from '../services/cards';
import { post } from '../services/api';
import { getBoardLists } from '../services/lists';
import { createThrottler } from './trello/throttle';

const throttle = createThrottler(500);

const ANGULAR_COMMIT_CARD = {
  title: 'Angular Commit Message Convention',
  description: `# Angular Commit Message Convention

Follow the Angular commit message convention for clear, consistent commit history.

## Format
\`\`\`
<type>(<scope>): <subject>

<body>

<footer>
\`\`\`

## Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## Examples
- \`feat(orders): add cart functionality\`
- \`fix(payment): resolve webhook issue\`
- \`docs(api): update endpoint documentation\`
- \`refactor(cart): simplify cart service logic\`

## Reference
See the official Angular commit message guidelines for more details.

**URL:** https://www.conventionalcommits.org/`,
  coverUrl: 'https://raw.githubusercontent.com/angular/angular/main/aio/src/assets/images/logos/angular/angular.png',
};

const PR_DESCRIPTION_CARD = {
  title: 'Sample Pull Request Description (KISS & DRY)',
  description: `# Sample Pull Request Description

## Purpose
Brief, clear description of what this PR does and why.

## Changes
- Added cart entity and repository
- Implemented cart service with CRUD operations
- Created cart controller with 4 endpoints
- Added unit tests for cart service

## Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Manual testing completed

## Checklist
- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex logic
- [x] Documentation updated
- [x] No breaking changes (or documented if any)

## Related
- Closes #123
- Related to #456

---

**KISS (Keep It Simple, Stupid):** Simple, straightforward changes. No over-engineering.

**DRY (Don't Repeat Yourself):** Reused existing patterns and utilities. No code duplication.`,
};

async function addCoverImage(cardId, imageUrl) {
  const response = await post(`/cards/${cardId}/attachments`, {
    url: imageUrl,
    setCover: true,
  });

  return response.success;
}

async function createResourceCard(listId, { title, description, coverUrl }) {
  const response = await createCard(listId, { name: title, description });

  if (!response.success) {
    throw new Error(response.error || `Failed to create card "${title}"`);
  }

  const card = response.data;

  if (coverUrl) {
    await addCoverImage(card.id, coverUrl);
  }

  return card;
}

/**
 * Add resource cards to the Resources list of a board.
 */
export async function addResourceCards(boardId) {
  try {
    const listsResponse = await getBoardLists(boardId);

    if (!listsResponse.success) {
      throw new Error(listsResponse.error || 'Failed to load board lists');
    }

    const resourcesList = listsResponse.data.find((list) => {
      const name = list.name.toLowerCase();
      return name === 'ressources' || name === 'resources';
    });

    if (!resourcesList) {
      throw new Error('Resources list not found');
    }

    await throttle();
    const angularCard = await createResourceCard(resourcesList.id, ANGULAR_COMMIT_CARD);

    await throttle();
    const prCard = await createResourceCard(resourcesList.id, PR_DESCRIPTION_CARD);

    return {
      success: true,
      cards: [angularCard, prCard],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
