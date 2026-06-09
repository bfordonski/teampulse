'use client';

import { PROJECT_ROLES } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RoleSelectProps {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}

export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue placeholder="Role" />
      </SelectTrigger>
      <SelectContent>
        {PROJECT_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
