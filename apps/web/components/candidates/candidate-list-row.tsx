'use client';

import { Briefcase, Pencil } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Candidate } from '@/lib/types';

interface CandidateListRowProps {
  candidate: Candidate;
  onEdit: () => void;
}

function availabilityVariant(availability: string) {
  if (availability === 'AVAILABLE') return 'success' as const;
  if (availability === 'PARTIALLY_AVAILABLE') return 'warning' as const;
  return 'secondary' as const;
}

export function CandidateListRow({ candidate, onEdit }: CandidateListRowProps) {
  const skills = [...candidate.technologySkills, ...candidate.keySkills];
  const visibleSkills = skills.slice(0, 3);
  const extraSkills = skills.length - visibleSkills.length;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <CandidateAvatar
        firstName={candidate.firstName}
        lastName={candidate.lastName}
        profilePhotoUrl={candidate.profilePhotoUrl}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{candidate.fullName}</p>
          <Badge variant={availabilityVariant(candidate.availability)} className="text-xs">
            {candidate.availability.replace(/_/g, ' ')}
          </Badge>
        </div>
        <p className="truncate text-sm text-muted-foreground">{candidate.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3" />
            {candidate.yearsExperience} yrs
          </span>
          {visibleSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {extraSkills > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{extraSkills}
            </Badge>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 gap-1"
        onClick={onEdit}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>
    </div>
  );
}
