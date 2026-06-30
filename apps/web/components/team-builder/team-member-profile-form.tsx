'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  ProjectListEditor,
  candidateProjectsToRows,
  projectsToPayload,
  type ProjectFormRow,
} from '@/components/candidates/project-list-editor';
import { CandidateAvatar } from '@/components/candidates/candidate-avatar';
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
import { AVAILABILITY_OPTIONS } from '@/lib/candidate-form-utils';
import type { TeamMember, UpdateTeamMemberProfileInput } from '@/lib/types';

interface TeamMemberProfileFormProps {
  member: TeamMember;
  open: boolean;
  onClose: () => void;
  onSave: (memberId: string, data: UpdateTeamMemberProfileInput) => Promise<void>;
  disabled?: boolean;
}

export function TeamMemberProfileForm({
  member,
  open,
  onClose,
  onSave,
  disabled,
}: TeamMemberProfileFormProps) {
  const [firstName, setFirstName] = useState(member.profile.firstName);
  const [lastName, setLastName] = useState(member.profile.lastName);
  const [email, setEmail] = useState(member.profile.email);
  const [title, setTitle] = useState(member.profile.title);
  const [yearsExperience, setYearsExperience] = useState(
    String(member.profile.yearsExperience),
  );
  const [availability, setAvailability] = useState(member.profile.availability);
  const [summary, setSummary] = useState(member.profile.summary ?? '');
  const [education, setEducation] = useState(member.profile.education ?? '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    member.profile.profilePhotoUrl ?? '',
  );
  const [projects, setProjects] = useState<ProjectFormRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setFirstName(member.profile.firstName);
      setLastName(member.profile.lastName);
      setEmail(member.profile.email);
      setTitle(member.profile.title);
      setYearsExperience(String(member.profile.yearsExperience));
      setAvailability(member.profile.availability);
      setSummary(member.profile.summary ?? '');
      setEducation(member.profile.education ?? '');
      setProfilePhotoUrl(member.profile.profilePhotoUrl ?? '');
      setProjects(candidateProjectsToRows(member.profile.projects));
      setError(null);
    }
  }, [open, member]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(member.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        title: title.trim(),
        yearsExperience: parseInt(yearsExperience, 10) || 0,
        availability,
        summary: summary.trim() || undefined,
        education: education.trim() || undefined,
        profilePhotoUrl: profilePhotoUrl.trim() || undefined,
        skills: member.profile.skills,
        languages: member.profile.languages,
        industryExperience: member.profile.industryExperience,
        certificates: member.profile.certificates,
        selectedClients: member.profile.selectedClients,
        projects: projectsToPayload(projects),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-profile-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Team copy
            </p>
            <h2 id="team-member-profile-title" className="text-lg font-semibold">
              Edit profile in team
            </h2>
            {member.sourceCandidateId && (
              <p className="mt-1 text-xs text-muted-foreground">
                Based on candidate {member.sourceCandidateId.slice(0, 8)}… — changes here do not
                affect the global profile.
              </p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tm-firstName">First name</Label>
              <Input
                id="tm-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={disabled || saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-lastName">Last name</Label>
              <Input
                id="tm-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={disabled || saving}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tm-email">Email</Label>
            <Input
              id="tm-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled || saving}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tm-title">Title</Label>
              <Input
                id="tm-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={disabled || saving}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tm-years">Years of experience</Label>
              <Input
                id="tm-years"
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                disabled={disabled || saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Availability</Label>
            <Select
              value={availability}
              onValueChange={setAvailability}
              disabled={disabled || saving}
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
            <Label htmlFor="tm-education">Education</Label>
            <Input
              id="tm-education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              disabled={disabled || saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tm-summary">Summary</Label>
            <textarea
              id="tm-summary"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={disabled || saving}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="tm-photo">Profile photo URL</Label>
            <div className="flex items-center gap-4">
              <CandidateAvatar
                firstName={firstName || '?'}
                lastName={lastName || '?'}
                profilePhotoUrl={profilePhotoUrl.trim() || undefined}
                size="md"
              />
              <Input
                id="tm-photo"
                value={profilePhotoUrl}
                onChange={(e) => setProfilePhotoUrl(e.target.value)}
                disabled={disabled || saving}
                placeholder="https://randomuser.me/api/portraits/..."
                className="flex-1"
              />
            </div>
          </div>

          <ProjectListEditor
            projects={projects}
            onChange={setProjects}
            disabled={disabled || saving}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={disabled || saving}>
              {saving ? 'Saving…' : 'Save team copy'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
