import { FileText, Download } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { dataGuard } from '@/lib/data-guard'
import type {
  TopicContext,
  Material,
  ChildProfile,
  LearningStyle,
  GenerationOptions,
  Version,
} from '@/types/study-wizard'
import { cn } from '@/lib/utils'

export interface SidebarPanelProps {
  topicContext?: TopicContext | null
  childProfile?: ChildProfile | null
  learningStyle?: LearningStyle | null
  generationOptions?: GenerationOptions | null
  materials?: Material[]
  versions?: Version[]
  className?: string
}

export function SidebarPanel({
  topicContext,
  childProfile,
  learningStyle,
  generationOptions,
  materials = [],
  versions = [],
  className,
}: SidebarPanelProps) {
  const safeMaterials = dataGuard(materials)
  const safeVersions = dataGuard(versions)

  return (
    <aside
      className={cn(
        'hidden w-full shrink-0 border-l border-border bg-card md:block lg:w-80',
        className
      )}
    >
      <div className="sticky top-0 max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Generation Settings
        </h3>

        <Accordion type="multiple" defaultValue={['topic', 'materials', 'versions']}>
          <AccordionItem value="topic">
            <AccordionTrigger className="text-sm">
              Topic & Context
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                {topicContext?.topic && (
                  <p>
                    <span className="font-medium text-foreground">Topic:</span>{' '}
                    {topicContext.topic}
                  </p>
                )}
                {topicContext?.subject && (
                  <p>
                    <span className="font-medium text-foreground">Subject:</span>{' '}
                    {topicContext.subject}
                  </p>
                )}
                {topicContext?.examDate && (
                  <p>
                    <span className="font-medium text-foreground">Exam:</span>{' '}
                    {new Date(topicContext.examDate).toLocaleDateString()}
                  </p>
                )}
                {!topicContext?.topic && (
                  <p className="italic">Not set</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="child">
            <AccordionTrigger className="text-sm">
              Child & Style
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                {childProfile && (
                  <p>
                    <span className="font-medium text-foreground">Child:</span>{' '}
                    {childProfile.name} (Age {childProfile.age})
                  </p>
                )}
                {learningStyle && (
                  <p>
                    <span className="font-medium text-foreground">Style:</span>{' '}
                    {learningStyle.replace('-', ' ')}
                  </p>
                )}
                {!childProfile && <p className="italic">Not selected</p>}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="options">
            <AccordionTrigger className="text-sm">
              Generation Options
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 text-xs text-muted-foreground">
                {generationOptions && (
                  <>
                    <p>
                      <span className="font-medium text-foreground">Depth:</span>{' '}
                      {generationOptions.depth}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Outputs:</span>{' '}
                      {(generationOptions.outputs ?? []).join(', ') || 'None'}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Curriculum:</span>{' '}
                      {generationOptions.curriculumAligned ? 'Yes' : 'No'}
                    </p>
                  </>
                )}
                {!generationOptions?.depth && (
                  <p className="italic">Not configured</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="materials">
            <AccordionTrigger className="text-sm">
              Source Materials ({safeMaterials.length})
            </AccordionTrigger>
            <AccordionContent>
              {safeMaterials.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  No materials uploaded
                </p>
              ) : (
                <ul className="space-y-2">
                  {safeMaterials.map((m) => (
                    <li key={m.id} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-xs text-primary hover:underline"
                      >
                        {m.name}
                      </a>
                      <a
                        href={m.url}
                        download={m.name}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label={`Download ${m.name}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="versions">
            <AccordionTrigger className="text-sm">
              Version History ({safeVersions.length})
            </AccordionTrigger>
            <AccordionContent>
              {safeVersions.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">
                  No versions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {safeVersions.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-lg border border-border/60 bg-muted/30 px-2 py-1.5 text-xs"
                    >
                      <p className="font-medium text-foreground">
                        {new Date(v.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  )
}
