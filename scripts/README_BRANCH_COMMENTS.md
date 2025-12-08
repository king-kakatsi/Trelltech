# Add Branch Comments & Resource Cards

This utility adds branch name comments to Trello cards and creates resource cards.

## Features

### 1. Branch Comments
- Automatically generates branch names from card titles
- Follows Angular commit convention (feat/, fix/, etc.)
- Adds comment to each card with format: `🌿 Branch: \`feat/orders-cart\``
- Skips Week 1 cards (as requested)

### 2. Resource Cards
Creates two cards in the Ressources list:

1. **Angular Commit Message Convention**
   - Guide on Angular commit message format
   - Link to conventional commits website
   - Cover image (Angular logo)
   - Examples and best practices

2. **Sample Pull Request Description**
   - Professional PR template
   - KISS (Keep It Simple, Stupid) principles
   - DRY (Don't Repeat Yourself) approach
   - Includes checklist and structure

## How to Use

### Option 1: Using the Screen (Easiest)

1. Navigate to `/add-branch-comments` in your app
2. Click "Find Rosey Board" to auto-detect the board
3. Click "Add Branch Comments" to add comments to all cards
4. Click "Add Resource Cards" to create the resource cards

### Option 2: Direct Function Call

```javascript
import { addBranchCommentsToBoard } from './utils/addBranchComments';
import { addResourceCards } from './utils/addResourceCards';

// Add branch comments
const result = await addBranchCommentsToBoard(boardId, true); // true = skip Week 1

// Add resource cards
const resourceResult = await addResourceCards(boardId);
```

## Branch Name Generation

The script generates branch names based on card titles:

- **Orders & Cart Foundation** → `feat/orders-cart-foundation`
- **Order Entity & Repository** → `feat/order-entity-repository`
- **Complete ProductListing GET Endpoints** → `feat/product-listing-get-endpoints`
- **Payment Foundation Setup** → `feat/payment-foundation-setup`

### Prefix Detection
- `feat/` - New features (default)
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `test/` - Testing
- `docs/` - Documentation
- `chore/` - Maintenance tasks

## Example Output

```
🚀 Starting to add branch comments...

Found 9 lists

Processing list: backlog (15 cards)
  ✓ Added branch comment: Order Entity & Repository - Week 1 → feat/order-entity-repository-week-1
  ✓ Added branch comment: Complete ProductListing GET Endpoints → feat/product-listing-get-endpoints
  ...

✅ Completed!
  Total cards: 40
  Commented: 35
  Skipped: 5 (Week 1 cards)
  Errors: 0
```

## Requirements

- ✅ Board "Rosey" must exist
- ✅ Lists must exist (especially "Ressources")
- ✅ You must be authenticated with Trello

## Notes

- Comments are added with a small delay (300ms) to avoid rate limiting
- Week 1 cards are automatically skipped
- Branch names are limited to 50 characters
- Cover images are added to the Angular commit card automatically

