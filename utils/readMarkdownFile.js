/**
 * Helper to read TRELLO_BOARD_ORGANIZATION.md file
 * 
 * This provides multiple ways to get the markdown content
 */

import * as FileSystem from 'expo-file-system';

/**
 * Read markdown file from various possible locations
 * @returns {Promise<string>} File content
 */
export async function readMarkdownFile() {
  // Try different paths where the file might be accessible
  const possiblePaths = [
    // Development: relative to project root
    `${FileSystem.documentDirectory}../TRELLO_BOARD_ORGANIZATION.md`,
    // Bundle directory
    `${FileSystem.bundleDirectory}TRELLO_BOARD_ORGANIZATION.md`,
    // Assets
    `${FileSystem.bundleDirectory}assets/TRELLO_BOARD_ORGANIZATION.md`,
  ];

  for (const path of possiblePaths) {
    try {
      const content = await FileSystem.readAsStringAsync(path);
      if (content && content.length > 0) {
        console.log(`✓ Read markdown file from: ${path}`);
        return content;
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }

  throw new Error(
    'Could not read TRELLO_BOARD_ORGANIZATION.md file. ' +
    'Please provide the content manually or ensure the file is accessible.'
  );
}

/**
 * Read markdown file with fallback to manual input
 * @param {string} fallbackContent - Optional fallback content if file can't be read
 * @returns {Promise<string>} File content
 */
export async function readMarkdownFileWithFallback(fallbackContent = null) {
  try {
    return await readMarkdownFile();
  } catch (error) {
    if (fallbackContent) {
      console.log('Using fallback content');
      return fallbackContent;
    }
    throw error;
  }
}


