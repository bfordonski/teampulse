'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md';

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
};

interface CandidateAvatarProps {
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  size?: AvatarSize;
  className?: string;
}

export function CandidateAvatar({
  firstName,
  lastName,
  profilePhotoUrl,
  size = 'sm',
  className,
}: CandidateAvatarProps) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  if (profilePhotoUrl) {
    return (
      <Image
        src={profilePhotoUrl}
        alt={`${firstName} ${lastName}`}
        width={size === 'md' ? 64 : 40}
        height={size === 'md' ? 64 : 40}
        className={cn(
          'shrink-0 rounded-full object-cover ring-2 ring-background',
          sizeClasses[size],
          className,
        )}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background',
        sizeClasses[size],
        className,
      )}
      aria-hidden={!profilePhotoUrl}
    >
      {initials}
    </div>
  );
}
