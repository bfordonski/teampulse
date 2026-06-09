export const DROP_ZONE_TEAM = 'team-members';
export const DROP_ZONE_POOL = 'candidate-pool';

export function poolDragId(candidateId: string) {
  return `pool:${candidateId}`;
}

export function teamDragId(candidateId: string) {
  return `team:${candidateId}`;
}

export function parseDragId(id: string): { zone: 'pool' | 'team'; candidateId: string } {
  const [zone, candidateId] = id.split(':');
  return {
    zone: zone as 'pool' | 'team',
    candidateId,
  };
}
