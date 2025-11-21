
const MEMBER_COLORS = [
  '#0079BF', // Trello Blue
  '#D29034', // Orange
  '#519839', // Green
  '#B04632', // Red
  '#89609E', // Purple
  '#CD5A91', // Pink
  '#4BBF6B', // Lime
  '#00AECC', // Sky Blue
  '#838C91', // Grey
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Light Blue
  '#F7B731', // Yellow
  '#5F27CD', // Deep Purple
  '#00D2D3', // Cyan
];

/**
 * Get a consistent color for a member based on their ID
 * @param {string} memberId - Member ID
 * @returns {string} Hex color code
 */
export const getMemberColor = (memberId) => {
  if (!memberId) return MEMBER_COLORS[0];
  
  // Generate consistent index from member ID
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = memberId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % MEMBER_COLORS.length;
  return MEMBER_COLORS[index];
};

/**
 * Get member initials from full name
 * @param {string} fullName - Member full name
 * @returns {string} Initials (max 2 characters)
 */
export const getMemberInitials = (fullName) => {
  if (!fullName) return '?';
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};