/**
 * Mock data for About / Help page.
 * Replace with API responses when endpoints are available.
 * All arrays use safe defaults for null-safe rendering.
 */

import type { Article, Category, Tutorial, Guide } from '@/types/help'

export const mockCategories: Category[] = [
  { id: 'getting-started', name: 'Getting Started', description: 'Basics and first steps' },
  { id: 'child-profiles', name: 'Child Profiles', description: 'Managing learner profiles' },
  { id: 'ai-content', name: 'AI & Content', description: 'How AI tailors your studies' },
  { id: 'billing', name: 'Billing & Plans', description: 'Subscriptions and payments' },
]

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'How do I create my first study?',
    excerpt: 'Learn how to create your first personalized study in minutes.',
    content: '<p>Click "Create Study" from the dashboard. Enter the topic, upload teacher materials, select your child and learning style, then generate. You can review and edit before sharing.</p><p>We recommend starting with a single topic and one child profile to get familiar with the flow.</p>',
    categoryId: 'getting-started',
    lastUpdated: '2025-01-15',
  },
  {
    id: '2',
    title: 'What file types can I upload?',
    excerpt: 'Supported formats for materials upload.',
    content: '<p>We support photos (JPG, PNG), PDFs, and common document formats. Our OCR extracts text from handwritten notes and printed documents.</p><p>Maximum file size is 10MB per file. For best results, use clear, well-lit images.</p>',
    categoryId: 'getting-started',
    lastUpdated: '2025-01-14',
  },
  {
    id: '3',
    title: 'How do I add a child?',
    excerpt: 'Add and manage child profiles.',
    content: '<p>Go to Settings → Children → Add child. Enter name, age/grade, and learning preferences.</p><p>You can customize learning style, reading level, and interests for each child.</p>',
    categoryId: 'child-profiles',
    lastUpdated: '2025-01-13',
  },
  {
    id: '4',
    title: 'Can I have multiple children?',
    excerpt: 'Plan limits for child profiles.',
    content: '<p>Yes. The Free plan supports 1 child. Pro supports 2, and Family supports up to 4.</p><p>Each child gets their own personalized content based on their profile.</p>',
    categoryId: 'child-profiles',
    lastUpdated: '2025-01-12',
  },
  {
    id: '5',
    title: 'Can I edit AI-generated content?',
    excerpt: 'Full control over generated materials.',
    content: '<p>Yes. You can edit any block inline or request targeted revisions from the AI. Nothing goes to your child until you approve.</p><p>Use the revision panel to refine vocabulary, length, or format.</p>',
    categoryId: 'ai-content',
    lastUpdated: '2025-01-11',
  },
  {
    id: '6',
    title: 'How does the AI tailor content?',
    excerpt: 'Understanding personalization.',
    content: '<p>We use your child\'s age, grade, and chosen learning style to shape prompts. The AI adapts vocabulary, length, and format accordingly.</p><p>Learning styles include: playful, exam-like, research-based, printable, and interactive.</p>',
    categoryId: 'ai-content',
    lastUpdated: '2025-01-10',
  },
]

export const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Creating Your First Study',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: '',
    duration: '3:45',
    transcript: 'In this tutorial, we\'ll walk through creating your first study. Start by clicking Create Study on the dashboard...',
  },
  {
    id: '2',
    title: 'Uploading Materials',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: '',
    duration: '2:30',
    transcript: 'Learn how to upload photos, PDFs, and documents. We\'ll show you tips for best OCR results.',
  },
  {
    id: '3',
    title: 'Setting Up Child Profiles',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: '',
    duration: '4:00',
    transcript: 'Add your children and customize their learning preferences for personalized content.',
  },
]

export const mockGuides: Guide[] = [
  {
    id: '1',
    title: 'Set Up Your First Study',
    steps: [
      { id: 's1', title: 'Choose a topic', content: 'Enter the subject or topic for your study. Be specific for better results.', tip: 'Example: "Multiplication tables 1-10" or "World War II causes"' },
      { id: 's2', title: 'Upload materials', content: 'Add teacher notes, textbooks, or any reference materials. Our AI will use these to generate content.', tip: 'Clear, well-lit photos work best for handwritten notes.' },
      { id: 's3', title: 'Select child and learning style', content: 'Pick which child this study is for and choose their preferred learning style.', tip: 'Try "playful" for younger kids, "exam-like" for test prep.' },
      { id: 's4', title: 'Generate and review', content: 'Click Generate. Review the content, edit if needed, then share with your child.', tip: 'You can request revisions from the AI before sharing.' },
    ],
    progress: 0,
    printable: true,
  },
  {
    id: '2',
    title: 'Save and Share Studies',
    steps: [
      { id: 's1', title: 'Save to library', content: 'All studies are automatically saved to your Study Library.', tip: 'Organize with folders for different subjects.' },
      { id: 's2', title: 'Export options', content: 'Export as PDF for printing or offline use. Pro and Family plans include bulk export.', tip: 'Great for road trips or no-screen time.' },
      { id: 's3', title: 'Share with child', content: 'Assign studies to your child. They can access via the Study Viewer on any device.', tip: 'Track progress in the dashboard.' },
    ],
    progress: 0,
    printable: true,
  },
]
