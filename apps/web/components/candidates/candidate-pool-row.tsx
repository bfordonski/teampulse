'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Eye, GripVertical } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
import type { Candidate } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CandidatePoolRowProps {
  candidate: Candidate;
  dragId: string;
  isDragging?: boolean;
  onPreview?: () => void;
}

function availabilityVariant(availability: string) {
  if (availability === 'AVAILABLE') return 'success' as const;
  if (availability === 'PARTIALLY_AVAILABLE') return 'warning' as const;
  return 'secondary' as const;
}

export function CandidatePoolRow({
  candidate,
  dragId,
  isDragging,
  onPreview,
}: CandidatePoolRowProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: dragId,
    data: { candidateId: candidate.id, type: 'candidate' },
  });

  const skills = [...candidate.technologySkills, ...candidate.keySkills];
  const visibleSkills = skills.slice(0, 2);
  const extraSkills = skills.length - visibleSkills.length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm transition-shadow hover:shadow-md',
        isDragging && 'opacity-40 ring-2 ring-primary/30',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Drag to move"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <CandidateAvatar
        firstName={candidate.firstName}
        lastName={candidate.lastName}
        profilePhotoUrl={candidate.profilePhotoUrl}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium">{candidate.fullName}</p>
          <Badge
            variant={availabilityVariant(candidate.availability)}
            className="text-[10px] px-1.5 py-0"
          >
            {candidate.availability.replace(/_/g, ' ')}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{candidate.title}</p>
        {visibleSkills.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {visibleSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{extraSkills}
              </Badge>
            )}
          </div>
        )}
      </div>

      {onPreview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
      )}
    </div>
  );
}
