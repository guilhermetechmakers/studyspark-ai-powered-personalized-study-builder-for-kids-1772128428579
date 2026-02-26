/**
 * Mock data for Study Viewer - simulates study sets with activities.
 * All arrays are safe for mapping; use dataGuard for runtime safety.
 */

import type { StudySet, Activity, CardItem, Question, LessonChapter, ProgressData } from '@/types/study-viewer'

const mockCards: CardItem[] = [
  { id: 'c1', front: 'What is 1/2 + 1/4?', back: '3/4' },
  { id: 'c2', front: 'Convert 0.5 to a fraction', back: '1/2' },
  { id: 'c3', front: 'What is 2 × 3/4?', back: '1 1/2 or 3/2' },
]

const mockQuestions: Question[] = [
  {
    id: 'q1',
    type: 'MCQ',
    prompt: 'Which is larger: 2/3 or 3/4?',
    options: ['2/3', '3/4', 'Equal'],
    answer: '3/4',
    hint: 'Compare by finding a common denominator.',
  },
  {
    id: 'q2',
    type: 'FILL',
    prompt: '1/2 + 1/4 = ___',
    answer: '3/4',
    hint: 'Find a common denominator first.',
  },
  {
    id: 'q3',
    type: 'DRAG',
    prompt: 'Drag the fractions in order from smallest to largest: 1/4, 1/2, 3/4',
    options: ['1/4', '1/2', '3/4'],
    answer: '1/4,1/2,3/4',
  },
]

const mockLessons: LessonChapter[] = [
  {
    id: 'l1',
    title: 'What is a fraction?',
    content: 'A fraction represents a part of a whole. The top number (numerator) tells how many parts you have. The bottom number (denominator) tells how many equal parts the whole is divided into.',
    steps: 3,
  },
  {
    id: 'l2',
    title: 'Adding fractions',
    content: 'To add fractions, first make sure they have the same denominator. Then add the numerators and keep the denominator the same.',
    steps: 4,
  },
]

const mockActivities: Activity[] = [
  { id: 'a1', type: 'flashcard', content: mockCards, progress: 0 },
  { id: 'a2', type: 'quiz', content: mockQuestions, progress: 0 },
  { id: 'a3', type: 'lesson', content: mockLessons, progress: 0 },
]

const defaultProgress: ProgressData = {
  total: mockActivities.length,
  completed: 0,
  stars: 0,
  timeSpent: 0,
  streak: 0,
  badges: [],
}

export function getMockStudySet(studyId: string): StudySet {
  return {
    id: studyId,
    title: 'Fractions Basics',
    activities: mockActivities,
    progress: { ...defaultProgress },
  }
}

export function getMockActivities(): Activity[] {
  return [...mockActivities]
}
