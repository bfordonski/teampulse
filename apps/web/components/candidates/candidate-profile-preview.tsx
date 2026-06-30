'use client';

import { Briefcase, Mail, UserPlus, X } from 'lucide-react';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Candidate } from '@/lib/types';

interface CandidateProfilePreviewProps {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
  onAddToTeam?: () => void;
  addDisabled?: boolean;
  adding?: boolean;
}

function availabilityVariant(availability: string) {
  if (availability === 'AVAILABLE') return 'success' as const;
  if (availability === 'PARTIALLY_AVAILABLE') return 'warning' as const;
  return 'secondary' as const;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export function CandidateProfilePreview({
  candidate,
  open,
  onClose,
  onAddToTeam,
  addDisabled,
  adding,
}: CandidateProfilePreviewProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-preview-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-6 py-4">
          <div className="flex min-w-0 items-start gap-4">
            <CandidateAvatar
              firstName={candidate.firstName}
              lastName={candidate.lastName}
              profilePhotoUrl={candidate.profilePhotoUrl}
              size="md"
            />
            <div className="min-w-0">
              <h2 id="candidate-preview-title" className="text-lg font-semibold">
                {candidate.fullName}
              </h2>
              <p className="text-sm text-muted-foreground">{candidate.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={availabilityVariant(candidate.availability)}>
                  {candidate.availability.replace(/_/g, ' ')}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {candidate.yearsExperience} yrs experience
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {candidate.email}
                </span>
              </div>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {candidate.education && (
            <Section title="Education">
              <p className="text-sm text-muted-foreground">{candidate.education}</p>
            </Section>
          )}

          {candidate.summary && (
            <Section title="Summary">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {candidate.summary}
              </p>
            </Section>
          )}

          {candidate.technologySkills.length > 0 && (
            <Section title="Technology skills">
              <TagList items={candidate.technologySkills} />
            </Section>
          )}

          {candidate.keySkills.length > 0 && (
            <Section title="Key skills">
              <TagList items={candidate.keySkills} />
            </Section>
          )}

          {candidate.businessSkills.length > 0 && (
            <Section title="Business skills">
              <TagList items={candidate.businessSkills} />
            </Section>
          )}

          {candidate.languages.length > 0 && (
            <Section title="Languages">
              <p className="text-sm text-muted-foreground">
                {candidate.languages
                  .map((l) => `${l.language} (${l.level})`)
                  .join(' · ')}
              </p>
            </Section>
          )}

          {candidate.industryExperience.length > 0 && (
            <Section title="Industries">
              <TagList items={candidate.industryExperience} />
            </Section>
          )}

          {candidate.certificates.length > 0 && (
            <Section title="Certificates">
              <TagList items={candidate.certificates} />
            </Section>
          )}

          {candidate.selectedClients.length > 0 && (
            <Section title="Selected clients">
              <TagList items={candidate.selectedClients} />
            </Section>
          )}

          {(candidate.projects?.length ?? 0) > 0 && (
            <Section title="Projects">
              <div className="space-y-3">
                {candidate.projects!.map((project) => (
                  <div
                    key={`${project.name}-${project.description.slice(0, 30)}`}
                    className="rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    {project.technologies && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {project.technologies}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={adding}>
            Close
          </Button>
          {onAddToTeam && (
            <Button type="button" onClick={onAddToTeam} disabled={addDisabled || adding}>
              <UserPlus className="h-4 w-4" />
              {adding ? 'Adding…' : 'Add to team'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
