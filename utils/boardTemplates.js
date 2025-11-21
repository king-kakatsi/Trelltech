/**
 * Predefined board templates with their default lists
 * Each template defines the lists that should be created when the board is initialized
 */
export const BOARD_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    lists: [],
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Basic workflow board',
    lists: ['To Do', 'Doing', 'Done'],
  },
  {
    id: 'project_management',
    name: 'Project Management',
    description: 'Track project progress',
    lists: ['Backlog', 'In Progress', 'Review', 'Complete'],
  },
  {
    id: 'simple',
    name: 'Simple',
    description: 'Just the essentials',
    lists: ['To Do', 'Done'],
  },
  {
    id: 'team_hub',
    name: 'Team Hub',
    description: 'Collaborate with your team',
    lists: ['Updates', 'Resources', 'Questions'],
  },
];

/**
 * Get template by ID
 * @param {string} templateId
 * @returns {object|null}
 */
export const getTemplateById = (templateId) => {
  return BOARD_TEMPLATES.find(template => template.id === templateId) || null;
};

/**
 * Get default template (Blank)
 * @returns {object}
 */
export const getDefaultTemplate = () => {
  return BOARD_TEMPLATES[0];
};