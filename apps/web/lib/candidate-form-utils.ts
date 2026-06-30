export const AVAILABILITY_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'PARTIALLY_AVAILABLE', label: 'Partially available' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
] as const;

export function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function formatCommaList(items: string[]): string {
  return items.join(', ');
}
