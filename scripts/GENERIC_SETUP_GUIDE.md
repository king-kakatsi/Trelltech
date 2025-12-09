# Generic Trello Board Setup Guide

This guide explains how to use the generic Trello board automation system for any project.

## Overview

The system allows you to:
1. Generate a Trello board organization markdown using AI
2. Automatically create/update Trello boards, lists, labels, and cards from markdown
3. Add branch name comments to cards
4. Update existing cards without creating duplicates

## Step 1: Generate Markdown from Project Specification

### Using AI Assistant

1. **Open the app** and navigate to **Profile** tab
2. Click **"Update Trello Board from Markdown"**
3. Click **"📋 Copy AI Prompt for Markdown Generation"**
4. **Open your AI assistant** (ChatGPT, Claude, etc.)
5. **Paste the prompt** you just copied
6. **Add your project specification** at the end of the prompt
7. **Copy the generated markdown** from the AI response

### What the AI Will Generate

The AI will create a markdown file with:
- Organization and board names (from your spec or generic names)
- Lists for your workflow (backlog, in progress, done, etc.)
- Labels (priorities, team members, task types)
- Cards with:
  - Titles
  - Descriptions
  - Checklists
  - Acceptance criteria
  - Labels
  - Assignees
  - Due dates

## Step 2: Create/Update Your Trello Board

1. **In the app**, go to **Profile** tab
2. Click **"Update Trello Board from Markdown"**
3. **Paste the markdown** you generated (or created manually)
4. Click **"Create Cards in Board"**

### What Happens

The script will:
- ✅ Find your organization and board (or create them if they don't exist)
- ✅ Use existing lists or create missing ones
- ✅ Create missing labels
- ✅ Create new cards that don't exist
- ✅ Update existing cards (add missing checklist items, labels, etc.)
- ✅ Never create duplicates

### Organization & Board Names

The script reads organization and board names from your markdown:
```markdown
## Board Structure
- **Organization:** Your Organization Name
- **Board:** Your Board Name
```

Make sure these match your Trello workspace and board names (case-insensitive).

## Step 3: Add Branch Comments (Optional)

1. Go to **Profile** tab
2. Click **"Add Branch Comments to All Cards"**
3. Click **"Auto-Find Board"** (or manually enter board ID)
4. Click **"Add Branch Comments"**

This will add branch name comments to all cards following Angular commit convention:
- Format: `Branch: \`feat/card-name\``
- No emojis
- Automatically generated from card titles

## Markdown Format

Your markdown should follow this structure:

```markdown
# Trello Board Organization - [Project Name]

## Board Structure
- **Organization:** [Organization Name]
- **Board:** [Board Name]

## Lists (in order)
1. **backlog** - All future tasks
2. **Sprint Of The Week** - Current week's main goals
...

## Labels
- **P0-Critical** (must complete)
- **P1-High** (important)
...

## Cards

### Card: "[Card Title]"
**List:** [List Name]
**Labels:** [Label1], [Label2]
**Assignee:** [Team Member or "You"]
**Due Date:** [Date or "End of Week X"]

**Description:**
[Description text]

**Checklist:**
- [ ] Task 1
- [ ] Task 2

**Acceptance Criteria:**
- Criterion 1
- Criterion 2

---
```

## Updating Your Board

You can update your board anytime:

1. **Modify your markdown** (add cards, update checklists, etc.)
2. **Paste the updated markdown** in the app
3. **Click "Create Cards in Board"**

The script will:
- ✅ Update existing cards (add missing items)
- ✅ Create new cards
- ✅ Never delete or remove existing data
- ✅ Preserve your existing work

## Tips

### For Best Results

1. **Use consistent naming**: Card titles in markdown should match Trello card names exactly (case-insensitive)
2. **Keep markdown updated**: Update your markdown as you plan, then sync to Trello
3. **Use the AI prompt**: It generates comprehensive, well-structured markdown
4. **Test with a small board first**: Try with a few cards to understand the workflow

### Common Workflows

**Initial Setup:**
1. Generate markdown with AI
2. Create board from markdown
3. Add branch comments

**Regular Updates:**
1. Update markdown (add new cards, update checklists)
2. Sync to Trello (updates existing, creates new)
3. Cards stay in their current lists

**Adding Branch Comments:**
- Run anytime to add/update branch comments
- Safe to run multiple times
- Updates existing comments to remove emojis

## Troubleshooting

**"Organization not found"**
- Check that organization name in markdown matches your Trello workspace name
- Names are matched case-insensitively

**"Board not found"**
- Check that board name in markdown matches your Trello board name
- Make sure the board is not archived

**Cards not updating**
- Card names must match exactly (case-insensitive)
- Cards are only checked in their target list

**Duplicate cards created**
- This shouldn't happen - the script checks for existing cards
- If it does, check that card names match exactly

## Generic vs Project-Specific

This system is **completely generic**:
- ✅ Works with any organization/board names
- ✅ Works with any list structure
- ✅ Works with any label system
- ✅ Works with any project type
- ✅ No hardcoded values

Just make sure your markdown follows the format, and the script will handle the rest!

