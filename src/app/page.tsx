import { TrackingForm } from '@/components/tracking-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <header className="absolute top-0 left-0 w-full z-10 p-4 sm:p-6 lg:p-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Express.PC</h1>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#" className="text-sm font-medium hover:text-primary">A propos</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">Services</Link>
          <Link href="#" className="text-sm font-medium hover:text-primary">Contact</Link>
          <Button asChild variant="outline">
            <Link href="/login">Espace Admin</Link>
          </Button>
        </nav>
        <Button asChild variant="ghost" className="md:hidden">
            <Link href="/login">Admin</Link>
        </Button>
      </header>

      <section className="flex-1 flex items-center justify-center pt-24 pb-12 lg:pt-32 lg:pb-20">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-24">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Colis Sécurisé, Esprit Tranquille
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Suivez votre colis à chaque étape. Entrez simplement votre numéro de suivi ci-dessous pour commencer.
                </p>
              </div>
              <div className="w-full max-w-md">
                <TrackingForm />
              </div>
            </div>
            <div className="relative flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-red-100/50 rounded-full blur-3xl z-0"></div>
                 <Image
                    src="https://picsum.photos/seed/deliveryman/600/600"
                    alt="Livreur tenant des colis"
                    width={550}
                    height={550}
                    className="relative rounded-full object-cover z-10 aspect-square"
                    data-ai-hint="delivery person"
                />
            </div>
          </div>
        </div>
      </section>
      
      <footer className="w-full py-6 px-4 md:px-6 border-t">
         <p className="text-center text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Express.PC. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
