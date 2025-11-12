import { TrackingForm } from '@/components/tracking-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PackageCheck, ShieldCheck, Zap, Package, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-6 text-center transition-transform duration-300 transform bg-white border rounded-xl shadow-lg border-border hover:-translate-y-2">
      <div className="mb-4 text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-primary">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
       <header className="absolute top-0 left-0 right-0 z-20 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Colimove</span>
            </Link>
             <Button asChild>
                <Link href="/admin">
                  Espace Admin <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
          </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex items-center justify-center w-full min-h-[60vh] md:min-h-screen pt-20 pb-20">
           <Image
              src="https://picsum.photos/seed/logistics1/1920/1080"
              alt="Warehouse background"
              fill
              className="object-cover"
              data-ai-hint="warehouse logistics"
              priority
            />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative z-10 px-4 text-center text-primary-foreground md:px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Suivi de Colis Simplifié.
              </h1>
              <p className="max-w-xl mx-auto mt-6 text-lg text-blue-100">
                Entrez votre numéro de suivi pour voir la localisation de votre colis en temps réel. Simple, rapide et fiable.
              </p>
            </div>
            <div className="w-full max-w-2xl mx-auto mt-10">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl text-white">
                    <Search/> Suivre mon colis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackingForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-secondary md:py-24">
          <div className="container px-4 mx-auto md:px-6">
            <h2 className="mb-12 text-3xl font-bold text-center text-primary md:text-4xl">
              Une expérience de suivi inégalée
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                icon={<ShieldCheck className="w-12 h-12" />}
                title="Fiabilité Maximale"
                description="Nous offrons un suivi précis et des informations vérifiées à chaque étape du parcours de votre colis."
              />
              <FeatureCard 
                icon={<Zap className="w-12 h-12" />}
                title="Rapidité en Temps Réel"
                description="Recevez des mises à jour instantanées sur la localisation de votre colis, sans aucun délai."
              />
              <FeatureCard 
                icon={<Star className="w-12 h-12" />}
                title="Simplicité d'Utilisation"
                description="Une interface claire et intuitive pour suivre votre colis en quelques clics, sans complication."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full px-4 py-8 border-t bg-card md:px-6">
        <div className="container flex flex-col items-center justify-between mx-auto md:flex-row">
            <div className="mb-4 md:mb-0">
                 <Link href="/" className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-primary" />
                    <span className="text-xl font-bold text-primary">Colimove</span>
                </Link>
                <p className="text-sm text-muted-foreground">Suivi de colis simple et rapide.</p>
            </div>
             <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Colimove. Tous droits réservés.
            </p>
        </div>
      </footer>
    </div>
  );
}
