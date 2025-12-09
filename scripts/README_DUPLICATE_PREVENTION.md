# Duplicate Card Prevention

The board creator script has been updated to prevent duplicate cards and intelligently update existing cards.

## How It Works

### 1. **Existing Cards Detection**
- Before creating a card, the script checks if a card with the same name already exists in the target list
- Card names are matched case-insensitively (e.g., "Orders & Cart Foundation" matches "orders & cart foundation")

### 2. **Card Updates (If Card Exists)**
If a card already exists, the script will:
- ✅ **Update description** if it's different from the markdown
- ✅ **Add missing labels** (won't remove existing labels)
- ✅ **Add missing checklist items** (won't remove existing items)
- ✅ **Add missing assignees** (won't remove existing assignees)
- ✅ **Preserve existing card properties** (due dates, custom fields, etc.)

### 3. **New Card Creation (If Card Doesn't Exist)**
If a card doesn't exist, the script will:
- ✅ Create the card with full description
- ✅ Add all labels
- ✅ Add all checklist items
- ✅ Assign members
- ✅ Add branch comment (if configured)

## Example Scenarios

### Scenario 1: Card Already Exists in Backlog
```
Markdown has: "Orders & Cart Foundation - Week 1" in "Sprint Of The Week"
Trello has: "Orders & Cart Foundation - Week 1" in "backlog"

Result: 
- Card is found in backlog
- Script updates the card (adds missing checklist items, labels, etc.)
- Card stays in backlog (doesn't move it)
```

### Scenario 2: Card Exists in Same List
```
Markdown has: "Services Support" in "Sprint Of The Week"
Trello has: "Services Support" in "Sprint Of The Week"

Result:
- Card is found
- Script updates description, adds missing checklist items
- No duplicate created
```

### Scenario 3: New Card
```
Markdown has: "AI Personalization & Recommendation System" in "Sprint Of The Week"
Trello doesn't have this card

Result:
- Card is created with all properties
- All checklist items added
- All labels added
```

## What Gets Updated

### ✅ Updated Properties
- Card description (if different)
- Missing labels (added, not removed)
- Missing checklist items (added, not removed)
- Missing assignees (added, not removed)

### ❌ NOT Updated (Preserved)
- Card position in list
- Existing checklist items (even if checked/unchecked)
- Existing labels (won't remove labels not in markdown)
- Due dates (preserved if already set)
- Comments (preserved)
- Attachments (preserved)
- Custom fields (preserved)

## Usage

The script works the same way as before:

```javascript
import { createBoardFromMarkdown } from './utils/boardFromMarkdown';

const markdownContent = `...`; // Your markdown content
const result = await createBoardFromMarkdown(markdownContent);
```

The script will automatically:
1. Find existing cards
2. Update them with new information
3. Create only new cards that don't exist

## Console Output

The script provides detailed output:

```
Processing 50 cards...

  ⊙ Found existing card: Orders & Cart Foundation - Week 1
    ↻ Updated description
    ✓ Added 3 new checklist items
    ✓ Added label: P0-Critical

  ✓ Created card: AI Personalization & Recommendation System
    ✓ Created checklist with 15 items
    ✓ Assigned to: Dev3

✅ Card processing complete!
  Created: 10
  Updated: 40
  Skipped: 0
```

## Important Notes

1. **Card Matching**: Cards are matched by exact name (case-insensitive). Make sure card names in markdown match exactly with Trello card names.

2. **List Matching**: Cards are only checked in their target list. If a card exists in a different list, it won't be found and a new card will be created.

3. **Checklist Items**: Only missing items are added. Existing items are preserved with their current checked/unchecked status.

4. **Labels**: Only missing labels are added. Existing labels are not removed.

5. **Safe Operation**: The script never deletes or removes existing data. It only adds or updates.

## Troubleshooting

**Q: Why did it create a duplicate card?**
A: Check if the card name in markdown exactly matches the Trello card name (case-insensitive). Also verify the card is in the same list.

**Q: Why didn't it update my existing card?**
A: The card name might not match exactly, or the card might be in a different list than specified in the markdown.

**Q: Will it remove checklist items I manually added?**
A: No, the script only adds missing items. It never removes existing checklist items.

**Q: Will it remove labels I manually added?**
A: No, the script only adds missing labels. It never removes existing labels.

