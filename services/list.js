// Compatibility barrel: old list.js API re-exports the new lists service.
export {
  getList,
  createList,
  updateList,
  archiveList,
  getBoardLists,
} from './lists';
