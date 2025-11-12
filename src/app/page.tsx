import { TrackingForm } from '@/components/tracking-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Express.PC</h1>
        <nav className="flex gap-6 items-center">
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">A propos</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">Services</Link>
          <Link href="#" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">Contact</Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-gray-900 dark:text-gray-100">
                Suivi de colis simple et rapide.
              </h1>
              <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl dark:text-gray-400">
                Entrez votre numéro de suivi ci-dessous pour obtenir l'état d'avancement de votre livraison en temps réel.
              </p>
            </div>
            <div className="w-full max-w-lg">
                <Card className="shadow-lg border-t-4 border-primary">
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2 text-xl'><Search className='text-primary'/> Suivre un colis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TrackingForm />
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 px-4 md:px-6 border-t">
        <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Express.PC. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
