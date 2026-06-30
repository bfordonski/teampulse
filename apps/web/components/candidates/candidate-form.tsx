'use client';

import { Briefcase, Mail, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectListEditor,
  candidateProjectsToRows,
  projectsToPayload,
  type ProjectFormRow,
} from '@/components/candidates/project-list-editor';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
import { Badge } from '@/components/ui/badge';
import {
  AVAILABILITY_OPTIONS,
  formatCommaList,
  parseCommaList,
} from '@/lib/candidate-form-utils';
import type { Candidate, CreateCandidateInput, UpdateCandidateInput } from '@/lib/types';

type CandidateFormMode = 'create' | 'edit';

interface CandidateFormProps {
  mode: CandidateFormMode;
  candidate?: Candidate;
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCandidateInput | UpdateCandidateInput) => Promise<void>;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  title: '',
  yearsExperience: '0',
  availability: 'AVAILABLE',
  education: '',
  summary: '',
  profilePhotoUrl: '',
  technologySkills: '',
  keySkills: '',
  businessSkills: '',
  languages: '',
  industryExperience: '',
  certificates: '',
  selectedClients: '',
};

function availabilityVariant(availability: string) {
  if (availability === 'AVAILABLE') return 'success' as const;
  if (availability === 'PARTIALLY_AVAILABLE') return 'warning' as const;
  return 'secondary' as const;
}

function candidateToFormState(candidate: Candidate) {
  return {
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    email: candidate.email,
    title: candidate.title,
    yearsExperience: String(candidate.yearsExperience),
    availability: candidate.availability,
    education: candidate.education ?? '',
    summary: candidate.summary ?? '',
    profilePhotoUrl: candidate.profilePhotoUrl ?? '',
    technologySkills: formatCommaList(candidate.technologySkills),
    keySkills: formatCommaList(candidate.keySkills),
    businessSkills: formatCommaList(candidate.businessSkills),
    languages: candidate.languages.map((l) => `${l.language} (${l.level})`).join(', '),
    industryExperience: formatCommaList(candidate.industryExperience),
    certificates: formatCommaList(candidate.certificates),
    selectedClients: formatCommaList(candidate.selectedClients),
  };
}

function buildPayload(
  form: typeof emptyForm,
  projects: ProjectFormRow[],
  existing?: Candidate,
): CreateCandidateInput {
  const skills = [
    ...parseCommaList(form.technologySkills).map((name) => ({
      name,
      category: 'TECHNOLOGY',
      level: 3,
      yearsUsed: 0,
    })),
    ...parseCommaList(form.keySkills).map((name) => ({
      name,
      category: 'KEY',
      level: 3,
      yearsUsed: 0,
    })),
    ...parseCommaList(form.businessSkills).map((name) => ({
      name,
      category: 'BUSINESS',
      level: 3,
      yearsUsed: 0,
    })),
  ];

  const languages =
    form.languages.trim().length > 0
      ? parseCommaList(form.languages).map((entry) => {
          const match = entry.match(/^(.+?)\s*\((.+)\)$/);
          if (match) {
            return { language: match[1].trim(), level: match[2].trim() };
          }
          return { language: entry, level: 'B2' };
        })
      : (existing?.languages ?? []);

  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    title: form.title.trim(),
    yearsExperience: parseInt(form.yearsExperience, 10) || 0,
    availability: form.availability,
    education: form.education.trim() || undefined,
    summary: form.summary.trim() || undefined,
    profilePhotoUrl: form.profilePhotoUrl.trim() || undefined,
    skills: skills.length > 0 ? skills : existing?.skills,
    languages,
    industryExperience:
      form.industryExperience.trim().length > 0
        ? parseCommaList(form.industryExperience)
        : (existing?.industryExperience ?? []),
    certificates:
      form.certificates.trim().length > 0
        ? parseCommaList(form.certificates)
        : (existing?.certificates ?? []),
    selectedClients:
      form.selectedClients.trim().length > 0
        ? parseCommaList(form.selectedClients)
        : (existing?.selectedClients ?? []),
    projects: projectsToPayload(projects),
  };
}

export function CandidateForm({
  mode,
  candidate,
  open,
  onClose,
  onSave,
}: CandidateFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [projects, setProjects] = useState<ProjectFormRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && candidate) {
      setForm(candidateToFormState(candidate));
      setProjects(candidateProjectsToRows(candidate.projects));
    } else {
      setForm(emptyForm);
      setProjects([]);
    }
    setError(null);
  }, [open, mode, candidate]);

  const displayName = useMemo(() => {
    const name = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ');
    if (name) return name;
    return mode === 'create' ? 'New candidate' : 'Candidate';
  }, [form.firstName, form.lastName, mode]);

  const availabilityLabel =
    AVAILABILITY_OPTIONS.find((o) => o.value === form.availability)?.label ??
    form.availability.replace(/_/g, ' ');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(buildPayload(form, projects, candidate));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save candidate');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-form-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-xl"
      >
        <div className="shrink-0 border-b px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <CandidateAvatar
                firstName={form.firstName || '?'}
                lastName={form.lastName || '?'}
                profilePhotoUrl={form.profilePhotoUrl.trim() || undefined}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {mode === 'create' ? 'Add candidate' : 'Edit candidate'}
                </p>
                <h2 id="candidate-form-title" className="text-lg font-semibold">
                  {displayName}
                </h2>
                {form.title.trim() && (
                  <p className="text-sm text-muted-foreground">{form.title}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant={availabilityVariant(form.availability)}>
                    {availabilityLabel}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    {form.yearsExperience || '0'} yrs experience
                  </span>
                  {form.email.trim() && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{form.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="c-photo">Profile photo URL</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="c-photo"
                  value={form.profilePhotoUrl}
                  onChange={(e) => set('profilePhotoUrl')(e.target.value)}
                  disabled={saving}
                  placeholder="https://randomuser.me/api/portraits/..."
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-firstName">First name</Label>
                <Input
                  id="c-firstName"
                  value={form.firstName}
                  onChange={(e) => set('firstName')(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-lastName">Last name</Label>
                <Input
                  id="c-lastName"
                  value={form.lastName}
                  onChange={(e) => set('lastName')(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => set('email')(e.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-title">Title / position</Label>
                <Input
                  id="c-title"
                  value={form.title}
                  onChange={(e) => set('title')(e.target.value)}
                  disabled={saving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-years">Years of experience</Label>
                <Input
                  id="c-years"
                  type="number"
                  min={0}
                  value={form.yearsExperience}
                  onChange={(e) => set('yearsExperience')(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select
                value={form.availability}
                onValueChange={set('availability')}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-education">Education</Label>
              <Input
                id="c-education"
                value={form.education}
                onChange={(e) => set('education')(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-summary">Summary</Label>
              <textarea
                id="c-summary"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={form.summary}
                onChange={(e) => set('summary')(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-tech">Technology skills (comma-separated)</Label>
              <Input
                id="c-tech"
                value={form.technologySkills}
                onChange={(e) => set('technologySkills')(e.target.value)}
                disabled={saving}
                placeholder="TypeScript, NestJS, PostgreSQL"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-key">Key skills</Label>
                <Input
                  id="c-key"
                  value={form.keySkills}
                  onChange={(e) => set('keySkills')(e.target.value)}
                  disabled={saving}
                  placeholder="Leadership, Communication"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-business">Business skills</Label>
                <Input
                  id="c-business"
                  value={form.businessSkills}
                  onChange={(e) => set('businessSkills')(e.target.value)}
                  disabled={saving}
                  placeholder="Agile, Scrum"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-languages">Languages</Label>
              <Input
                id="c-languages"
                value={form.languages}
                onChange={(e) => set('languages')(e.target.value)}
                disabled={saving}
                placeholder="English (C1), Polish (Native)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-industries">Industries</Label>
              <Input
                id="c-industries"
                value={form.industryExperience}
                onChange={(e) => set('industryExperience')(e.target.value)}
                disabled={saving}
                placeholder="Finance, Healthcare"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-certificates">Certificates</Label>
              <Input
                id="c-certificates"
                value={form.certificates}
                onChange={(e) => set('certificates')(e.target.value)}
                disabled={saving}
                placeholder="AWS Certified Developer Associate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="c-clients">Selected clients</Label>
              <Input
                id="c-clients"
                value={form.selectedClients}
                onChange={(e) => set('selectedClients')(e.target.value)}
                disabled={saving}
                placeholder="Acme Corp, Globex"
              />
            </div>

            <ProjectListEditor
              projects={projects}
              onChange={setProjects}
              disabled={saving}
            />
          </div>

          <div className="flex shrink-0 justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : mode === 'create' ? 'Add candidate' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
