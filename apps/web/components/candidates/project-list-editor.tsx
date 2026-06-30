'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CandidateProject } from '@/lib/types';

export type ProjectFormRow = CandidateProject;

export const emptyProjectRow = (): ProjectFormRow => ({
  name: '',
  description: '',
  technologies: '',
});

interface ProjectListEditorProps {
  projects: ProjectFormRow[];
  onChange: (projects: ProjectFormRow[]) => void;
  disabled?: boolean;
}

export function ProjectListEditor({
  projects,
  onChange,
  disabled,
}: ProjectListEditorProps) {
  const updateRow = (index: number, patch: Partial<ProjectFormRow>) => {
    onChange(projects.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(projects.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...projects, emptyProjectRow()]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label>Projects</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={addRow}
          disabled={disabled}
        >
          <Plus className="h-3 w-3" />
          Add project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-xs text-muted-foreground">No projects yet.</p>
      ) : (
        projects.map((project, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border bg-muted/20 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Project {index + 1}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => removeRow(index)}
                disabled={disabled}
                aria-label={`Remove project ${index + 1}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`project-name-${index}`}>Project name</Label>
              <Input
                id={`project-name-${index}`}
                value={project.name}
                onChange={(e) => updateRow(index, { name: e.target.value })}
                disabled={disabled}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`project-desc-${index}`}>Description</Label>
              <textarea
                id={`project-desc-${index}`}
                className="flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={project.description}
                onChange={(e) => updateRow(index, { description: e.target.value })}
                disabled={disabled}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`project-tech-${index}`}>
                Technologies <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id={`project-tech-${index}`}
                value={project.technologies ?? ''}
                onChange={(e) => updateRow(index, { technologies: e.target.value })}
                disabled={disabled}
                placeholder="React, TypeScript, PostgreSQL"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function projectsToPayload(projects: ProjectFormRow[]) {
  return projects
    .filter((p) => p.name.trim() && p.description.trim())
    .map((p) => ({
      name: p.name.trim(),
      description: p.description.trim(),
      technologies: p.technologies?.trim() || undefined,
    }));
}

export function candidateProjectsToRows(
  projects: CandidateProject[] | undefined,
): ProjectFormRow[] {
  return (projects ?? []).map((p) => ({
    name: p.name,
    description: p.description,
    technologies: p.technologies ?? '',
  }));
}
