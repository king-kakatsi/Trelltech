// Compatibility barrel: old card.js API re-exports the new cards service.
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
