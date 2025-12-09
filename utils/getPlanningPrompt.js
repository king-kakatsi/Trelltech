/**
 * Get the Trello planning prompt for AI
 * This prompt can be used with any AI to generate a Trello board organization markdown
 */

export const TRELLO_PLANNING_PROMPT = `# Trello Board Planning Prompt for AI

You are a project management expert. Your task is to create a comprehensive Trello board organization markdown file based on a project specification.

## Instructions

Analyze the provided project specification and create a detailed Trello board organization markdown file following this exact format:

\`\`\`markdown
# Trello Board Organization - [Project Name]

## Board Structure
- **Organization:** [Organization Name]
- **Board:** [Board Name]

## Lists (in order)
1. **backlog** - All future tasks
2. **Sprint Of The Week** - Current week's main goals
3. **Sprint Of The Day** - Daily tasks to focus on
4. **In Progress** - Tasks currently being worked on
5. **Review** - Tasks ready for review
6. **Done** - Completed tasks
7. **Blocked** - Tasks that are blocked
8. **Ressources** - Resources and documentation
9. **[Custom List]** - Add any project-specific lists needed

## Labels
- **P0-Critical** (must complete)
- **P1-High** (important)
- **P2-Medium** (nice to have)
- **Dev1** (Team Member 1)
- **Dev2** (Team Member 2)
- **Dev3** (Team Member 3)
- **Weekend** (Optional weekend work)
- **Bug** (Bug fixes)
- **Documentation** (Documentation tasks)
- **Integration** (Third-party integrations)
- **Real-time** (Real-time features)

## Cards

### Card: "[Card Title]"
**List:** [List Name]
**Labels:** [Label1], [Label2]
**Assignee:** [Team Member Name or "You"]
**Due Date:** [Date or "End of Week X"]

**Description:**
[Detailed description of what this card represents and what needs to be done]

**Checklist:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Acceptance Criteria:**
- Criterion 1
- Criterion 2
- Criterion 3

---

[Repeat for each card]
\`\`\`

## Requirements

1. **Organization & Board**: Use the actual organization and board names from the project specification, or use generic names like "Project Team" and "Main Board" if not specified.

2. **Lists**: Create appropriate lists for the project workflow. Include standard lists (backlog, in progress, done) and any project-specific lists needed.

3. **Labels**: Create labels for:
   - Priority levels (P0-Critical, P1-High, P2-Medium)
   - Team members (Dev1, Dev2, Dev3, etc. - adjust based on team size)
   - Task types (Bug, Documentation, Integration, etc.)
   - Any project-specific categories

4. **Cards**: Break down the project into detailed cards:
   - Each major feature/functionality should be a card
   - Include cards for setup, infrastructure, testing, documentation
   - Organize cards by weeks/sprints if the project has a timeline
   - Each card should have:
     - Clear title
     - Appropriate list assignment
     - Relevant labels
     - Detailed description
     - Checklist of subtasks
     - Acceptance criteria

5. **Card Organization**:
   - Group related cards together
   - Use consistent naming conventions
   - Include week/sprint numbers if applicable (e.g., "Week 1", "Sprint 1")
   - Prioritize cards appropriately

6. **Checklists**: Each card should have a detailed checklist breaking down the work into actionable items.

7. **Acceptance Criteria**: Each card should have clear acceptance criteria that define when the card is complete.

8. **Assignees**: Assign cards to team members based on their roles/expertise mentioned in the specification, or use "You" if not specified.

9. **Due Dates**: Include realistic due dates based on the project timeline, or use relative dates like "End of Week 1".

## Output Format

Provide ONLY the markdown content, starting with the header and following the exact structure shown above. Do not include any explanations or additional text outside the markdown format.

## Example Structure

For a web application project, you might create cards like:
- Setup & Configuration
- Authentication System
- User Management
- Core Features (broken down by feature)
- API Development
- Frontend Components
- Testing
- Documentation
- Deployment

For each card, provide detailed checklists and acceptance criteria.

---

**Now, analyze the following project specification and generate the complete Trello board organization markdown:**

[PASTE PROJECT SPECIFICATION HERE]`;

