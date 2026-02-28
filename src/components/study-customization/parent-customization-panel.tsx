'use client'

import { Lock, Unlock } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThemeEditor } from './theme-editor'
import { ContentManager } from './content-manager'
import { AIImagePanel } from './ai-image-panel'
import { GamificationPanelEditor } from './gamification-panel-editor'
import { cn } from '@/lib/utils'
import type {
  StudyCustomization,
  StudyTheme,
  StudyCard,
  StudyGamification,
} from '@/types/study-customization'

interface ParentCustomizationPanelProps {
  customization: StudyCustomization
  onCustomizationChange: (c: Partial<StudyCustomization>) => void
  className?: string
}

export function ParentCustomizationPanel({
  customization,
  onCustomizationChange,
  className,
}: ParentCustomizationPanelProps) {
  const isLocked = customization.isLocked ?? false
  const theme = customization.theme
  const cards = customization.cards ?? []
  const gamification = customization.gamification ?? {
    score: 0,
    level: 1,
    badges: [],
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col border-l border-border bg-card',
        'w-full sm:w-80 lg:w-96',
        'animate-slide-in-from-right',
        className
      )}
      role="complementary"
      aria-label="Parent customization panel"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">
          Parent Customization
        </h2>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="lock-toggle"
            className="text-sm text-muted-foreground"
          >
            {isLocked ? 'Locked' : 'Unlocked'}
          </Label>
          <Switch
            id="lock-toggle"
            checked={!isLocked}
            onCheckedChange={(checked) =>
              onCustomizationChange({ isLocked: !checked })
            }
            aria-label={isLocked ? 'Unlock customization' : 'Lock customization'}
          />
          {isLocked ? (
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          ) : (
            <Unlock className="h-4 w-4 text-primary" aria-hidden />
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs defaultValue="theme" className="w-full px-4 py-4">
          <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl sm:grid-cols-4">
            <TabsTrigger value="theme" className="rounded-lg">
              Theme
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-lg">
              Content
            </TabsTrigger>
            <TabsTrigger value="images" className="rounded-lg">
              AI Images
            </TabsTrigger>
            <TabsTrigger value="gamification" className="rounded-lg">
              Rewards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="mt-0">
            <ThemeEditor
              theme={theme}
              onThemeChange={(t: StudyTheme) =>
                onCustomizationChange({ theme: t })
              }
              disabled={isLocked}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-0">
            <ContentManager
              cards={cards}
              onCardsChange={(c: StudyCard[]) =>
                onCustomizationChange({ cards: c })
              }
              disabled={isLocked}
            />
          </TabsContent>

          <TabsContent value="images" className="mt-0">
            <AIImagePanel
              cards={cards}
              onCardsChange={(c: StudyCard[]) =>
                onCustomizationChange({ cards: c })
              }
              disabled={isLocked}
            />
          </TabsContent>

          <TabsContent value="gamification" className="mt-0">
            <GamificationPanelEditor
              gamification={gamification}
              onGamificationChange={(g: Partial<StudyGamification>) =>
                onCustomizationChange({
                  gamification: { ...gamification, ...g },
                })
              }
              disabled={isLocked}
            />
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}
