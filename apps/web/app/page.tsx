import Link from 'next/link';
import { ArrowRight, LayoutGrid, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Build client-ready teams
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Manage your candidate pool and compose project teams with drag-and-drop — fast, visual,
          and intuitive.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="group transition-shadow hover:shadow-panel-hover">
          <CardHeader>
            <LayoutGrid className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Candidates</h2>
            <p className="text-sm text-muted-foreground">
              Browse skills, experience, and availability across your talent pool.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/candidates">
                View candidates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-shadow hover:shadow-panel-hover">
          <CardHeader>
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Teams</h2>
            <p className="text-sm text-muted-foreground">
              Create teams, assign roles, and move people between roster and bench.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/teams/new">
                Create team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
