import { CandidateDirectory } from '@/components/candidates/candidate-directory';

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground">Your consulting talent pool</p>
      </div>
      <CandidateDirectory />
    </div>
  );
}
