'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Mail, Briefcase } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
import type { Candidate } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CandidatePanelProps {
  candidate: Candidate;
  dragId?: string;
  isDragging?: boolean;
  draggable?: boolean;
  footer?: React.ReactNode;
}

export function CandidatePanel({
  candidate,
  dragId = `static:${candidate.id}`,
  isDragging,
  draggable = true,
  footer,
}: CandidatePanelProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: dragId,
    data: { candidateId: candidate.id, type: 'candidate' },
    disabled: !draggable,
  });

  const style = draggable
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const availabilityVariant =
    candidate.availability === 'AVAILABLE'
      ? 'success'
      : candidate.availability === 'PARTIALLY_AVAILABLE'
        ? 'warning'
        : 'secondary';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        isDragging && 'opacity-40',
      )}
    >
    <Card
      className={cn(
        'transition-shadow hover:shadow-panel-hover',
        isDragging && 'ring-2 ring-primary/30',
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {draggable ? (
            <button
              type="button"
              className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label="Drag to move"
              {...listeners}
              {...attributes}
            >
              <GripVertical className="h-5 w-5" />
            </button>
          ) : null}

          <CandidateAvatar
            firstName={candidate.firstName}
            lastName={candidate.lastName}
            profilePhotoUrl={candidate.profilePhotoUrl}
            size="sm"
            className={draggable ? 'mt-0.5' : undefined}
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{candidate.fullName}</p>
                <p className="text-sm text-muted-foreground">{candidate.title}</p>
              </div>
              <Badge variant={availabilityVariant}>
                {candidate.availability.replace(/_/g, ' ')}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {candidate.yearsExperience} yrs
              </span>
              <span className="inline-flex items-center gap-1 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {candidate.email}
              </span>
            </div>

            {(candidate.technologySkills.length > 0 ||
              candidate.keySkills.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {[...candidate.technologySkills, ...candidate.keySkills]
                  .slice(0, 4)
                  .map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                {candidate.technologySkills.length + candidate.keySkills.length > 4 && (
                  <Badge variant="secondary">
                    +
                    {candidate.technologySkills.length +
                      candidate.keySkills.length -
                      4}
                  </Badge>
                )}
              </div>
            )}

            {candidate.industryExperience.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {candidate.industryExperience.slice(0, 3).join(' · ')}
              </p>
            )}

            {candidate.summary && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {candidate.summary}
              </p>
            )}

            {(candidate.projects?.length ?? 0) > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Projects</p>
                {candidate.projects!.slice(0, 2).map((project) => (
                  <div
                    key={`${project.name}-${project.description.slice(0, 20)}`}
                    className="rounded-md border bg-muted/30 px-2 py-1.5"
                  >
                    <p className="text-xs font-medium">{project.name}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                    {project.technologies && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project.technologies}
                      </p>
                    )}
                  </div>
                ))}
                {(candidate.projects?.length ?? 0) > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{(candidate.projects?.length ?? 0) - 2} more project(s)
                  </p>
                )}
              </div>
            )}

            {footer}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
