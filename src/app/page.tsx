import { TrackingForm } from '@/components/tracking-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
              <PackageSearch className="h-10 w-10" />
            </div>
            <CardTitle className="text-3xl font-bold text-primary font-headline">
              Colis Suivi Pro
            </CardTitle>
            <CardDescription className="text-base">
              Entrez votre code de suivi pour voir l'état de votre colis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingForm />
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Colis Suivi Pro. Tous droits réservés.</p>
          <Button asChild variant="link" className="text-primary">
            <Link href="/login">Espace Admin</Link>
          </Button>
        </footer>
      </div>
    </main>
  );
}
