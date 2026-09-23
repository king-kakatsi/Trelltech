// Compatibility barrel: old trello.js API re-exports the new modular services.
export {
  authenticate,
  getCurrentUser,
  updateCurrentUser,
} from './auth';

export {
  getAllWorkspaces,
} from './workspaces';

export {
  getWorkspaceBoards,
  getBoard,
  createBoard,
} from './boards';

export {
  getBoardLists,
} from './lists';

export {
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getCardsInList,
  addComment,
  updateComment,
  deleteComment,
  getCardComments,
} from './cards';

export {
  addMember as addMemberToCard,
  removeMember as removeMemberFromCard,
} from './members';

export { updateCardDates } from './cards';
