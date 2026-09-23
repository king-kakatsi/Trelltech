// Compatibility barrel: old memberService.js API re-exports the new members service.
export {
  getCurrentMembers,
  getAvailableMembers,
  addMember,
  removeMember,
} from './members';
