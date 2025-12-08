/**
 * Utility to add resource cards to Trello board
 * 
 * Adds two cards to the Ressources list:
 * 1. Angular commit messages guide with cover image
 * 2. Sample PR description (KISS and DRY)
 */

import { createCard } from '../services/card';
import { getBoardLists } from '../services/boardService';
import { fetchFromLocalStorage } from '../services/localStorageService';
import { TRELLO_CONFIG } from './constants';
import { postWithApi } from '../services/axiosService';

// %%%%%%%% ADD COVER IMAGE %%%%%%%

/**
 * Add cover image to a card
 * @param {string} cardId - Card ID
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<boolean>} Success status
 */
async function addCoverImage(cardId, imageUrl) {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (!token) throw new Error('No token found');

    // Trello API: Add attachment and set as cover
    const endpoint = `/cards/${cardId}/attachments?key=${TRELLO_CONFIG.API_KEY}&token=${token}&url=${encodeURIComponent(imageUrl)}&setCover=true`;
    const [success, data] = await postWithApi(endpoint);

    if (!success) throw data;
    return true;
  } catch (error) {
    console.error(`Error adding cover image:`, error);
    return false;
  }
}

// %%%%%%%% END - ADD COVER IMAGE %%%%%%%

// %%%%%%%% RESOURCE CARDS %%%%%%%

/**
 * Create Angular commit messages card
 * @param {string} listId - List ID (Ressources)
 * @returns {Promise<object>} Created card
 */
async function createAngularCommitCard(listId) {
  const title = 'Angular Commit Message Convention';
  const description = `# Angular Commit Message Convention

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
- \`fix(payment): resolve Flutterwave webhook issue\`
- \`docs(api): update endpoint documentation\`
- \`refactor(cart): simplify cart service logic\`

## Reference
See the official Angular commit message guidelines for more details.

**URL:** https://www.conventionalcommits.org/

## Best Practices
- Use imperative mood ("add" not "added" or "adds")
- First line should be 50 characters or less
- Leave blank line between header and body
- Wrap body at 72 characters
- Use footer for breaking changes or issue references

## Quick Reference
\`\`\`
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): code style changes
refactor(scope): code refactoring
perf(scope): performance improvements
test(scope): add or update tests
chore(scope): maintenance tasks
\`\`\``;

  const card = await createCard(listId, title, description);
  
  // Add cover image (Angular logo or commit message diagram)
  // Using Angular logo or a commit message diagram
  const coverImageUrl = 'https://raw.githubusercontent.com/angular/angular/main/aio/src/assets/images/logos/angular/angular.png';
  await addCoverImage(card.id, coverImageUrl);
  
  return card;
}

/**
 * Create PR description sample card
 * @param {string} listId - List ID (Ressources)
 * @returns {Promise<object>} Created card
 */
async function createPRDescriptionCard(listId) {
  const title = 'Sample Pull Request Description (KISS & DRY)';
  const description = `# Sample Pull Request Description

## 🎯 Purpose
Brief, clear description of what this PR does and why.

## 📝 Changes
- Added cart entity and repository
- Implemented cart service with CRUD operations
- Created cart controller with 4 endpoints
- Added unit tests for cart service

## 🧪 Testing
- [x] Unit tests passing
- [x] Integration tests passing
- [x] Manual testing completed
- [x] Postman collection updated

## 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## ✅ Checklist
- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex logic
- [x] Documentation updated
- [x] No breaking changes (or documented if any)

## 🔗 Related
- Closes #123
- Related to #456

---

**KISS (Keep It Simple, Stupid):** Simple, straightforward changes. No over-engineering.

**DRY (Don't Repeat Yourself):** Reused existing patterns and utilities. No code duplication.`;

  const card = await createCard(listId, title, description);
  
  return card;
}

// %%%%%%%% END - RESOURCE CARDS %%%%%%%

// %%%%%%%% MAIN FUNCTION %%%%%%%

/**
 * Add resource cards to Ressources list
 * @param {string} boardId - Board ID
 * @returns {Promise<object>} Results
 */
export async function addResourceCards(boardId) {
  try {
    console.log('🚀 Adding resource cards...\n');

    // Find Ressources list
    const lists = await getBoardLists(boardId);
    const ressourcesList = lists.find(list => 
      list.name.toLowerCase() === 'ressources' || 
      list.name.toLowerCase() === 'resources'
    );

    if (!ressourcesList) {
      throw new Error('Ressources list not found');
    }

    console.log(`✓ Found Ressources list: ${ressourcesList.name}\n`);

    // Create Angular commit card
    console.log('Creating Angular commit messages card...');
    const angularCard = await createAngularCommitCard(ressourcesList.id);
    console.log(`✓ Created: ${angularCard.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create PR description card
    console.log('Creating PR description sample card...');
    const prCard = await createPRDescriptionCard(ressourcesList.id);
    console.log(`✓ Created: ${prCard.name}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n✅ Resource cards created successfully!');

    return {
      success: true,
      cards: [angularCard, prCard]
    };
  } catch (error) {
    console.error('Error adding resource cards:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// %%%%%%%% END - MAIN FUNCTION %%%%%%%

