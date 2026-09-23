# Automation Studio Guide

## Overview

Automation Studio builds entire Trello boards from a written plan and stamps branch names on cards. It has two tabs: Board Builder and Branch Tools.

## User Personas

- Leads bootstrapping a project board from a spec
- Developers syncing branch names with Trello cards

## UI Walkthrough - Step-by-Step

### Step 1: Open the Studio

**What to click**: The profile tab, then the "Automation Studio" action card.

**What appears**: A dark screen with Builder and Branch Tools tabs plus a shared log timeline area.

**What happens next**: Stay on Builder to generate a board, or switch tabs for branch work.

### Step 2: Build a board from markdown

**What to click**: Paste your board plan into the text area, or switch to upload mode and pick a `.md` file, then tap the build button.

**What appears**: The input swaps for a live timeline streaming log lines, with an elapsed timer and a Cancel option.

**What to enter/select**: A board plan with organization, board, lists, and at least one card section. The Copy Prompt button gives you an AI prompt for generating such a plan.

**Visual feedback**: Green lines mark success, red lines mark errors, and a result banner summarizes the run with the board link.

**What happens next**: Open the linked board to verify lists, labels, cards, checklists, and assignments.

### Step 3: Stamp branch comments

**What to click**: Switch to the Branch Tools tab, tap auto-find or enter a board ID, then tap "Branch Comments".

**What appears**: The timeline logs each card as new, updated, or unchanged, and the result banner shows the counts.

**What happens next**: Every card carries a `Branch:` comment your team can copy into git.

### Step 4: Inject resource cards

**What to click**: The "Resource Cards" action on the Branch Tools tab.

**What appears**: Progress logs followed by a banner confirming two created cards.

**What happens next**: Find the convention reference cards inside the Resources list of the board.

## Navigation Flow

```mermaid
sequenceDiagram
    User->>+Studio: Paste markdown
    Studio->>+Builder: Start build
    Builder-->>-User: Live timeline logs
    Builder-->>-User: Result banner plus board link
    User->>+Branch: Run branch comments
    Branch-->>-User: Counts banner
```

## Expected Outcomes

Rerunning the same plan updates the board instead of duplicating it. Branch runs report new, updated, and total card counts.

## Common Issues

- If the build asks for markdown first, the text area is empty.
- If branch actions ask for a board, auto-find one or paste the ID manually.
- If lists or cards are skipped, check the timeline for the named reason.
