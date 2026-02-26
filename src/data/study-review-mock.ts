/**
 * Mock data for Study Review page when API is unavailable.
 * Ensures the page renders without crashing.
 */

import type {
  Study,
  SectionBlock,
  SourceReference,
  Version,
  Revision,
} from '@/types/study-review'

export function getMockStudyReview(studyId: string): {
  study: Study
  sections: SectionBlock[]
  references: SourceReference[]
  versions: Version[]
  revisions: Revision[]
} {
  return {
    study: {
      id: studyId,
      title: 'Fractions & Decimals',
      ownerId: 'user-1',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    sections: [
      {
        id: 'sec-summary',
        studyId,
        type: 'summary',
        content: 'This study covers basic fractions and decimals. Key topics include equivalent fractions, adding and subtracting fractions, and converting between fractions and decimals.',
        order: 0,
      },
      {
        id: 'sec-lessons',
        studyId,
        type: 'lessons',
        content: {
          lessons: [
            { title: 'What is a fraction?', body: 'A fraction represents part of a whole. The top number (numerator) shows how many parts we have. The bottom number (denominator) shows how many equal parts the whole is divided into.' },
            { title: 'Equivalent fractions', body: 'Equivalent fractions represent the same value. For example, 1/2 = 2/4 = 4/8. We can find equivalent fractions by multiplying or dividing both numerator and denominator by the same number.' },
          ],
        },
        order: 1,
      },
      {
        id: 'sec-flashcards',
        studyId,
        type: 'flashcards',
        content: {
          flashcards: [
            { front: 'What is a numerator?', back: 'The top number in a fraction that shows how many parts we have.' },
            { front: 'What is a denominator?', back: 'The bottom number in a fraction that shows how many equal parts the whole is divided into.' },
          ],
        },
        order: 2,
      },
      {
        id: 'sec-quizzes',
        studyId,
        type: 'quizzes',
        content: {
          quizzes: [
            {
              question: 'Which fraction is equivalent to 1/2?',
              options: ['2/3', '2/4', '3/6', '1/4'],
              answer: '2/4',
            },
          ],
        },
        order: 3,
      },
    ],
    references: [
      {
        id: 'ref-1',
        studyId,
        url: 'https://example.com/math-curriculum.pdf',
        citation: 'Grade 4 Math Curriculum, Chapter 5',
      },
    ],
    versions: [
      {
        id: 'v1',
        studyId,
        versionNumber: 1,
        diffSummary: 'Initial AI-generated content',
        createdAt: new Date().toISOString(),
      },
    ],
    revisions: [],
  }
}
