/**
 * Example usage of createBoardFromMarkdown
 * 
 * This shows how to use the board creation utility
 */

// Example 1: Using with markdown content as string
import { createBoardFromMarkdown } from '../utils/boardFromMarkdown';

// Read your markdown file content (you'll need to do this based on your setup)
// For React Native, you might:
// 1. Import as text asset
// 2. Store in AsyncStorage
// 3. Fetch from server
// 4. Copy-paste the content

const markdownContent = `
# Trello Board Organization - Rosey Backend MVP

## Board Structure
- **Organization:** Starinx
- **Board:** Rosey

## Lists (in order)
1. **backlog** - All future tasks
2. **Sprint Of The Week** - Current week's main goals
...

## Labels
- 🔴 **P0-Critical** (must complete)
...

## Week 1 - Foundation (Jan 8-14)

### Card: "Orders & Cart Foundation - Week 1"
**List:** Sprint Of The Week  
**Labels:** 🔴 P0-Critical, 🔵 Dev1  
**Assignee:** Dev1  
**Due Date:** End of Week 1

**Checklist:**
- [ ] Create Cart entity
- [ ] Create CartRepository
...

**Acceptance Criteria:**
- Cart CRUD operations working
- All endpoints tested
...
`;

// Call the function
async function createBoard() {
  try {
    const result = await createBoardFromMarkdown(markdownContent);
    
    if (result.success) {
      console.log('✅ Board created successfully!');
      console.log('Board URL:', result.boardUrl);
      console.log('Board ID:', result.board.id);
    } else {
      console.error('❌ Failed to create board:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Using in a React Native component
/*
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import { createBoardFromMarkdown } from '../utils/boardFromMarkdown';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      // You need to provide the markdown content
      // Option 1: Import as text asset
      // Option 2: Read from AsyncStorage
      // Option 3: Fetch from server
      const markdownContent = await getMarkdownContent(); // Your implementation
      
      const result = await createBoardFromMarkdown(markdownContent);
      
      if (result.success) {
        Alert.alert('Success', `Board created: ${result.boardUrl}`);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return <Button title="Create Board" onPress={handleCreate} disabled={loading} />;
}
*/

export { createBoard };


