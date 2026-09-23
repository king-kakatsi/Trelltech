// Compatibility barrel: old boardService.js API re-exports the new boards service.
// List helpers are also re-exported because the legacy monolithic
// boardService exposed them; this prevents "is not a function" runtime errors
// in screens that still import everything from boardService.
export {
  getWorkspaceBoards,
  getBoard,
  createBoard,
  updateBoardName,
  updateBoardDescription,
  updateBoardBackground,
  archiveBoard,
  getBoardMembers,
} from './boards';

export {
  getBoardLists,
  getList,
  createList,
  updateList,
  archiveList,
} from './lists';
