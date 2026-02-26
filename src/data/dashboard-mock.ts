/**
 * Mock dashboard data for UI preview when API is not configured.
 * All data shapes match dashboard types.
 */

import type { Child, Study, Recommendation } from '@/types/dashboard'

export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Emma',
    age: 9,
    progress: 72,
    streak: 5,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Liam',
    age: 6,
    progress: 45,
    streak: 2,
    lastActive: '1 day ago',
  },
]

export const mockStudies: Study[] = [
  {
    id: '1',
    title: 'Fractions & Decimals',
    updatedAt: '2 hours ago',
    status: 'saved',
  },
  {
    id: '2',
    title: 'World War II',
    updatedAt: '1 day ago',
    status: 'saved',
  },
  {
    id: '3',
    title: 'Photosynthesis',
    updatedAt: '2 days ago',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Multiplication Tables',
    updatedAt: '3 days ago',
    status: 'in-progress',
  },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    topic: 'Fractions Practice',
    confidence: 0.92,
    notes: 'Based on upcoming math test',
  },
  {
    id: '2',
    topic: 'Solar System',
    confidence: 0.85,
    notes: 'From teacher notes',
  },
  {
    id: '3',
    topic: 'Spelling Bee Prep',
    confidence: 0.78,
    notes: 'Suggested for next week',
  },
]
