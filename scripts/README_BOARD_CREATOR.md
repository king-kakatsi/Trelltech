# Board Creator from Markdown

This script automatically adds cards to your **existing** Trello board based on the structure defined in `TRELLO_BOARD_ORGANIZATION.md`.

## ⚠️ Important: Uses Existing Board

The script will:
- ✅ **Find** your existing organization (doesn't create)
- ✅ **Find** your existing board (doesn't create)
- ✅ **Use** existing lists (creates missing ones if needed)
- ✅ **Create** missing labels if needed
- ✅ **Create** all cards with checklists, labels, and assignments

## What it creates

- **Cards**: Creates all cards from the markdown with:
  - Title and description
  - List assignment (uses existing lists)
  - Labels (creates if missing)
  - Assignees (if members match Dev1/Dev2/Dev3)
  - Checklists with items
  - Acceptance criteria in description

## How to Run

### Option 1: Using the Screen (Easiest)

1. Navigate to the screen in your app:
   - Go to `/create-board` route
   - Or add it to your navigation

2. Paste the content of `TRELLO_BOARD_ORGANIZATION.md` in the text area

3. Click "Create Cards in Board"

The script will:
- Find your organization "Starinx"
- Find your board "Rosey"
- Use existing lists
- Create all cards from the markdown

### Option 2: Direct Function Call

```javascript
import { createBoardFromMarkdown } from './utils/boardFromMarkdown';

// Read the markdown file content (you need to provide this)
const markdownContent = `...`; // Content of TRELLO_BOARD_ORGANIZATION.md

const result = await createBoardFromMarkdown(markdownContent);

if (result.success) {
  console.log('✅ Cards created!', result.boardUrl);
} else {
  console.error('❌ Error:', result.error);
}
```

### Option 3: Quick Test in Console

You can also test it directly in your React Native app's console:

```javascript
// In your app, open the console and run:
import { createBoardFromMarkdown } from './utils/boardFromMarkdown';

// Copy the content of TRELLO_BOARD_ORGANIZATION.md and paste it here
const content = `# Trello Board Organization - Rosey Backend MVP
...`; // Your full markdown content

createBoardFromMarkdown(content).then(result => {
  console.log(result);
});
```

## Features

- ✅ Parses markdown structure automatically
- ✅ Finds existing organization and board (doesn't create)
- ✅ Uses existing lists (creates missing ones)
- ✅ Creates missing labels with emoji-to-color mapping
- ✅ Creates cards with full details
- ✅ Adds checklists to cards
- ✅ Assigns members to cards (if found)
- ✅ Handles rate limiting with delays
- ✅ Provides detailed console output

## Label Color Mapping

- 🔴 → red (P0-Critical, Bug)
- 🟠 → orange (P1-High, Integration)
- 🟡 → yellow (P2-Medium, Real-time)
- 🟢 → green (Dev2)
- 🔵 → blue (Dev1, Documentation)
- 🟣 → purple (Dev3)
- ⚪ → black (Weekend)

## Notes

- The script includes delays between API calls to avoid rate limiting
- Member assignment works if usernames match "Dev1", "Dev2", "Dev3", etc.
- Due dates are logged but not automatically set (Trello API requires specific date format)
- The script will skip cards if their target list is not found
- All operations are logged to console for debugging

## Troubleshooting

- **"No token found"**: Make sure you're authenticated with Trello
- **"List not found"**: Check that list names in markdown match exactly (case-sensitive)
- **"Failed to create label"**: Label might already exist, script continues
- **Rate limiting**: Script includes delays, but if you hit limits, wait and retry

## Example Output

```
🚀 Starting board creation from markdown...

📖 Parsing markdown content...
✓ Parsed structure:
  - Organization: Starinx
  - Board: Rosey
  - Lists: 9
  - Labels: 10
  - Cards: 45

✓ Found organization: Starinx (org123...)

Finding board: Rosey
✓ Found board: Rosey (board123...)

Found 9 existing lists in board
  ✓ Found list: backlog
  ✓ Found list: Sprint Of The Week
  ...

Found 5 existing labels
  ✓ Found label: P0-Critical
Checking for missing labels...
  ✓ Created label: 🔴 P0-Critical
  ✓ Label already exists: 🟠 P1-High
  ...

Creating 45 cards...
  ✓ Created card: Orders & Cart Foundation - Week 1
    ✓ Created checklist with 10 items
    ✓ Assigned to: Dev1
  ...
```

## Quick Start Guide

1. **Open your app** and navigate to `/create-board` (or add the route)

2. **Copy the entire content** of `TRELLO_BOARD_ORGANIZATION.md` file

3. **Paste it** in the text area on the screen

4. **Click "Create Cards in Board"**

5. **Wait** for the script to complete (it will show progress in console)

6. **Check your Trello board** - all cards should be created!

## Requirements

- ✅ You must be authenticated with Trello (logged in)
- ✅ Organization "Starinx" must exist
- ✅ Board "Rosey" must exist
- ✅ Lists should exist (script will create missing ones)

