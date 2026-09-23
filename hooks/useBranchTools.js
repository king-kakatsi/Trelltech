import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { addBranchCommentsToBoard, removeEmojisFromComments } from '../utils/addBranchComments';
import { addResourceCards } from '../utils/addResourceCards';
import { getWorkspaceBoards } from '../services/boardService';
import { getAllWorkspaces } from '../services/workspaces';

/**
 * Hook for the Branch Tools tab: board discovery and branch-related actions.
 */
export default function useBranchTools({ addLog, runWithLogs, abortedRef }) {
  const [branchLoading, setBranchLoading] = useState(null);
  const [boardId, setBoardId] = useState(null);
  const [branchResult, setBranchResult] = useState(null);

  const handleFindBoard = useCallback(async () => {
    setBranchLoading('find');
    setBranchResult(null);
    try {
      const workspacesResponse = await getAllWorkspaces();
      if (workspacesResponse.success && Array.isArray(workspacesResponse.data) && workspacesResponse.data.length > 0) {
        const boardsResponse = await getWorkspaceBoards(workspacesResponse.data[0].id);
        const boards = boardsResponse.success ? boardsResponse.data : [];
        if (boards.length > 0) {
          setBoardId(boards[0].id);
          setBranchResult({ success: true, message: `Board found: ${boards[0].name}` });
          addLog(`Found: ${boards[0].name} (${boards[0].id})`, 'success');
        } else {
          setBranchResult({ success: false, error: 'No boards found in workspace' });
        }
      } else {
        setBranchResult({ success: false, error: 'No workspaces found' });
      }
    } catch (err) {
      setBranchResult({ success: false, error: err.message });
    } finally {
      setBranchLoading(null);
    }
  }, [addLog]);

  const handleBranchAction = useCallback(
    async (actionId) => {
      if (!boardId) {
        Alert.alert('Board Required', 'Auto-find or enter a board ID first.');
        return;
      }
      setBranchLoading(actionId);
      setBranchResult(null);
      try {
        let res;
        if (actionId === 'comments') {
          addLog('Adding branch comments…', 'info');
          res = await runWithLogs(() => addBranchCommentsToBoard(boardId, false, true));
          if (abortedRef.current) return;
          setBranchResult(
            res.success
              ? {
                  success: true,
                  message: `${res.commentedCards ?? 0} new · ${res.updatedCards ?? 0} updated · ${res.totalCards ?? 0} total`,
                }
              : { success: false, error: res.error },
          );
          if (res.success) addLog(`Done — ${res.commentedCards} new, ${res.updatedCards} updated`, 'success');
        } else if (actionId === 'resources') {
          addLog('Creating resource cards…', 'info');
          res = await runWithLogs(() => addResourceCards(boardId));
          if (abortedRef.current) return;
          setBranchResult(
            res.success
              ? { success: true, message: `${res.cards?.length ?? 0} resource cards created` }
              : { success: false, error: res.error },
          );
          if (res.success) addLog(`Created ${res.cards?.length ?? 0} resource cards`, 'success');
        } else if (actionId === 'emojis') {
          addLog('Removing emojis from comments…', 'info');
          res = await runWithLogs(() => removeEmojisFromComments(boardId));
          if (abortedRef.current) return;
          setBranchResult(
            res.success
              ? { success: true, message: `Cleaned ${res.updatedCards ?? 0} comments` }
              : { success: false, error: res.error },
          );
          if (res.success) addLog(`Cleaned ${res.updatedCards} comments`, 'success');
        }
      } catch (err) {
        if (!abortedRef.current) {
          setBranchResult({ success: false, error: err.message });
          addLog(`Error: ${err.message}`, 'error');
        }
      } finally {
        setBranchLoading(null);
      }
    },
    [boardId, addLog, runWithLogs, abortedRef],
  );

  const clearLoading = useCallback(() => {
    setBranchLoading(null);
  }, []);

  return {
    branchLoading,
    boardId,
    branchResult,
    handleFindBoard,
    handleBranchAction,
    clearLoading,
  };
}
