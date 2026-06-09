import { TeamBuilder } from '@/components/team-builder/team-builder';

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeamBuilder teamId={id} />;
}
