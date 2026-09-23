/**
 * Orchestrate creation and update of Trello resources from a parsed markdown plan.
 */

import { createBoard, getWorkspaceBoards } from '../../services/boards';
import { createList, getBoardLists } from '../../services/lists';
import { get, post } from '../../services/api';
import { parseMarkdownContent } from './parse';
import { findOrCreateLabels, getBoardLabels, deleteLabel } from './labels';
import { createAllCards } from './cards';
import { sleep } from '../trello/retry';

async function fetchWorkspaces() {
  const { success, data, error } = await get('/members/me/organizations');
  if (!success) throw new Error(error || 'Failed to fetch workspaces');
  return data || [];
}

async function createWorkspace(displayName) {
  const { success, data, error } = await post('/organizations', { displayName });
  if (!success) throw new Error(error || 'Failed to create workspace');
  return data;
}

async function fetchWorkspaceMembers(orgId) {
  const { success, data, error } = await get(`/organizations/${orgId}/members`, {
    fields: 'id,fullName,username,avatarUrl,initials',
  });
  if (!success) {
    console.error('Error fetching workspace members:', error);
    return [];
  }
  return data || [];
}

async function findOrCreateOrganization(orgName) {
  const workspaces = await fetchWorkspaces();
  const existing = workspaces.find(
    (ws) => ws.displayName?.toLowerCase() === orgName.toLowerCase() ||
            ws.name?.toLowerCase() === orgName.toLowerCase()
  );
  if (existing) {
    console.log(`Found organization: ${orgName} (${existing.id})`);
    return existing.id;
  }

  console.log(`Creating organization: ${orgName}`);
  const newOrg = await createWorkspace(orgName);
  console.log(`Created organization: ${orgName} (${newOrg.id})`);
  return newOrg.id;
}

async function findOrCreateBoard(orgId, boardName) {
  const { success, data: boards } = await getWorkspaceBoards(orgId);
  if (success && boards) {
    const existing = boards.find(
      (board) => board.name?.toLowerCase() === boardName.toLowerCase() && !board.closed
    );
    if (existing) {
      console.log(`Found board: ${boardName} (${existing.id})`);
      return existing;
    }
  }

  console.log(`Creating board: ${boardName}`);
  const { success: ok, data: board, error } = await createBoard(orgId, {
    name: boardName,
    description: 'Auto-generated from markdown board configuration',
  });
  if (!ok) throw new Error(error || 'Failed to create board');
  console.log(`Created board: ${boardName} (${board.id})`);
  return board;
}

async function findOrCreateLists(boardId, expectedLists) {
  const listMap = new Map();
  const { success, data: existingLists, error } = await getBoardLists(boardId);
  if (!success) throw new Error(error || 'Failed to fetch lists');

  console.log(`\nFound ${existingLists.length} existing lists in board`);
  for (const list of existingLists) {
    listMap.set(list.name, list.id);
    console.log(`  Found list: ${list.name}`);
  }

  for (const expectedList of expectedLists) {
    if (!listMap.has(expectedList.name)) {
      try {
        console.log(`  Creating missing list: ${expectedList.name}`);
        const { success: ok, data: newList, error: err } = await createList(boardId, expectedList.name);
        if (!ok) throw new Error(err.message || 'Failed to create list');
        listMap.set(expectedList.name, newList.id);
        console.log(`  Created list: ${expectedList.name}`);
        await sleep(300);
      } catch (error) {
        console.error(`  Failed to create list ${expectedList.name}:`, error);
      }
    }
  }

  return listMap;
}

export async function createBoardFromMarkdown(markdownContent) {
  try {
    console.log('Starting board creation from markdown...\n');

    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('markdownContent parameter is required. Please provide the content of TRELLO_BOARD_ORGANIZATION.md as a string.');
    }

    console.log('Parsing markdown content...');
    const boardStructure = parseMarkdownContent(markdownContent);

    console.log('Parsed structure:');
    console.log(`  - Organization: ${boardStructure.organization}`);
    console.log(`  - Board: ${boardStructure.board}`);
    console.log(`  - Lists: ${boardStructure.lists.length}`);
    console.log(`  - Labels: ${boardStructure.labels.length}`);
    console.log(`  - Cards: ${boardStructure.cards.length}\n`);

    const orgId = await findOrCreateOrganization(boardStructure.organization);

    console.log(`\nFinding/Creating board: ${boardStructure.board}`);
    const board = await findOrCreateBoard(orgId, boardStructure.board);
    console.log(`Using board: ${board.name} (${board.id})\n`);

    const listMap = await findOrCreateLists(board.id, boardStructure.lists);
    const labelMap = await findOrCreateLabels(board.id, boardStructure.labels);

    console.log(`\nFetching workspace members...`);
    const memberList = await fetchWorkspaceMembers(orgId);
    console.log(`Found ${memberList.length} members`);

    await createAllCards(board.id, listMap, labelMap, memberList, boardStructure.cards);

    console.log(`\nBoard creation complete!`);
    console.log(`\nBoard URL: https://trello.com/b/${board.shortLink}`);
    console.log(`Board ID: ${board.id}`);

    return {
      success: true,
      board,
      boardUrl: `https://trello.com/b/${board.shortLink}`,
    };
  } catch (error) {
    console.error('\nError creating board:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteMarkdownLabelsFromBoard(markdownContent) {
  try {
    if (!markdownContent || typeof markdownContent !== 'string') {
      throw new Error('markdownContent is required');
    }

    const { organization: orgName, board: boardName, labels: mdLabels } =
      parseMarkdownContent(markdownContent);

    const mdLabelNames = new Set(mdLabels.map((l) => l.name.trim().toLowerCase()));

    console.log(`Will delete labels matching: ${[...mdLabelNames].join(', ')}`);

    const orgId = await findOrCreateOrganization(orgName);
    const board = await findOrCreateBoard(orgId, boardName);

    const boardLabels = await getBoardLabels(board.id);
    const deleted = [];
    const kept = [];

    for (const label of boardLabels) {
      const nameLower = (label.name || '').trim().toLowerCase();
      if (mdLabelNames.has(nameLower)) {
        try {
          await deleteLabel(label.id);
          deleted.push(label.name);
          console.log(`  Deleted label: ${label.name}`);
        } catch (error) {
          console.warn(`  Could not delete label: ${label.name} (${error.message})`);
        }
        await sleep(300);
      } else {
        kept.push(label.name || '(unnamed)');
        console.log(`  — Kept label: ${label.name || '(unnamed)'}`);
      }
    }

    console.log(`\nDone – deleted ${deleted.length}, kept ${kept.length}`);
    return { success: true, deleted, kept };
  } catch (error) {
    console.error('deleteMarkdownLabelsFromBoard:', error);
    return { success: false, deleted: [], kept: [], error: error.message };
  }
}
