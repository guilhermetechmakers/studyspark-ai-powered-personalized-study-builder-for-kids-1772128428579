/**
 * Mock data for Study Library when API is not configured.
 * All arrays use safe defaults; shapes match study-library types.
 */

import type { StudyCardType, FolderType, TagType } from '@/types/study-library'

export const mockStudyLibraryFolders: FolderType[] = [
  { id: 'f1', name: 'Math', parentFolderId: null, position: 0, color: '#5B57A5', childCount: 2 },
  { id: 'f2', name: 'Science', parentFolderId: null, position: 1, color: '#A9A6F9', childCount: 1 },
  { id: 'f3', name: 'History', parentFolderId: null, position: 2, color: '#FFAD5A', childCount: 1 },
  { id: 'f4', name: 'Languages', parentFolderId: null, position: 3, color: '#FFB085', childCount: 1 },
  { id: 'f5', name: 'Algebra', parentFolderId: 'f1', position: 0, color: '#5B57A5', childCount: 1 },
]

export const mockStudyLibraryStudies: StudyCardType[] = [
  {
    id: '1',
    title: 'Fractions & Decimals',
    thumbnailUrl: undefined,
    lastModified: '2025-02-26T10:00:00Z',
    subjectId: 'math',
    subject: 'Math',
    learningStyleId: 'visual',
    learningStyle: 'Visual',
    childId: '1',
    childName: 'Emma',
    folderId: 'f1',
    tags: ['fractions', 'decimals'],
    isStarred: true,
  },
  {
    id: '2',
    title: 'World War II',
    thumbnailUrl: undefined,
    lastModified: '2025-02-25T14:30:00Z',
    subjectId: 'history',
    subject: 'History',
    learningStyleId: 'reading',
    learningStyle: 'Reading',
    childId: '2',
    childName: 'Liam',
    folderId: 'f3',
    tags: ['ww2', 'history'],
    isStarred: false,
  },
  {
    id: '3',
    title: 'Photosynthesis',
    thumbnailUrl: undefined,
    lastModified: '2025-02-24T09:15:00Z',
    subjectId: 'science',
    subject: 'Science',
    learningStyleId: 'kinesthetic',
    learningStyle: 'Kinesthetic',
    childId: '1',
    childName: 'Emma',
    folderId: 'f2',
    tags: ['biology', 'plants'],
    isStarred: true,
  },
  {
    id: '4',
    title: 'Spanish Verbs',
    thumbnailUrl: undefined,
    lastModified: '2025-02-23T16:45:00Z',
    subjectId: 'spanish',
    subject: 'Spanish',
    learningStyleId: 'auditory',
    learningStyle: 'Auditory',
    childId: '2',
    childName: 'Liam',
    folderId: 'f4',
    tags: ['verbs', 'grammar'],
    isStarred: false,
  },
  {
    id: '5',
    title: 'US Constitution',
    thumbnailUrl: undefined,
    lastModified: '2025-02-22T11:20:00Z',
    subjectId: 'civics',
    subject: 'Civics',
    learningStyleId: 'reading',
    learningStyle: 'Reading',
    childId: '1',
    childName: 'Emma',
    folderId: null,
    tags: ['civics', 'government'],
    isStarred: false,
  },
  {
    id: '6',
    title: 'Linear Equations',
    thumbnailUrl: undefined,
    lastModified: '2025-02-21T08:00:00Z',
    subjectId: 'math',
    subject: 'Math',
    learningStyleId: 'visual',
    learningStyle: 'Visual',
    childId: '1',
    childName: 'Emma',
    folderId: 'f5',
    tags: ['algebra', 'equations'],
    isStarred: false,
  },
]

export const mockStudyLibraryTags: TagType[] = [
  { id: 't1', name: 'fractions', category: 'math', color: '#A9A6F9' },
  { id: 't2', name: 'decimals', category: 'math', color: '#FFAD5A' },
  { id: 't3', name: 'biology', category: 'science', color: '#FFB085' },
  { id: 't4', name: 'history', category: 'social', color: '#5B57A5' },
  { id: 't5', name: 'verbs', category: 'language', color: '#FFF5A5' },
]

export const mockSubjects = [
  { id: 'math', name: 'Math' },
  { id: 'science', name: 'Science' },
  { id: 'history', name: 'History' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'civics', name: 'Civics' },
]

export const mockLearningStyles = [
  { id: 'visual', name: 'Visual' },
  { id: 'reading', name: 'Reading' },
  { id: 'kinesthetic', name: 'Kinesthetic' },
  { id: 'auditory', name: 'Auditory' },
]
