/**
 * Mock data and generators for Create Study Wizard.
 * Used when backend API is not configured.
 */

import type { ChildProfile, Material, Version, AIOutputBlock } from '@/types/study-wizard'

export const mockChildProfiles: ChildProfile[] = [
  { id: '1', name: 'Emma', age: 9, grade: '4th Grade', avatarUrl: undefined },
  { id: '2', name: 'Liam', age: 11, grade: '6th Grade', avatarUrl: undefined },
]

/** Simulates streaming AI output blocks for demo. */
export async function* mockStreamGeneration(
  _studyId: string,
  topic: string
): AsyncGenerator<AIOutputBlock, void, unknown> {
  const blocks: string[] = [
    `# ${topic}\n\nHere's a summary of the key concepts you need to know.`,
    '## Key Terms\n\n- **Term 1**: Definition and explanation\n- **Term 2**: Definition and explanation\n- **Term 3**: Definition and explanation',
    '## Practice Questions\n\n1. What is the main idea?\n2. How does X relate to Y?\n3. Explain the process.',
    '## Summary\n\nThis study set covers the essential material. Review the flashcards and take the quiz to reinforce your learning.',
  ]
  for (let i = 0; i < blocks.length; i++) {
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))
    yield { type: 'text', content: blocks[i], order: i, length: blocks[i].length }
  }
}

export function mockCreateStudy(): { id: string } {
  return { id: `study-${Date.now()}` }
}

export function mockFetchMaterials(_studyId: string): Material[] {
  return []
}

export function mockFetchVersionHistory(_studyId: string): Version[] {
  return [
    {
      id: 'v1',
      studyId: 'study-1',
      snapshot: {},
      createdAt: new Date().toISOString(),
    },
  ]
}
