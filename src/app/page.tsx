import { TrackingForm } from '@/components/tracking-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PackageCheck, ShieldCheck, Zap, Package, ArrowRight, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-6 text-center transition-transform duration-300 transform bg-card border rounded-xl shadow-lg border-border/20 hover:-translate-y-2 hover:shadow-primary/20">
      <div className="mb-4 text-primary flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
       <header className="absolute top-0 left-0 right-0 z-20 px-4 py-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Colimove</span>
            </Link>
             <Button asChild variant="outline" className="bg-transparent border-foreground/50 text-foreground hover:bg-foreground hover:text-background">
                <Link href="/login">
                  Espace Admin <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
          </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-background via-indigo-950 to-background">
          <div className="container relative z-10 mx-auto grid min-h-dvh items-center gap-8 px-4 pt-24 pb-16 text-center md:grid-cols-2 md:text-left">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Suivi de Colis.
                <span className="block bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Réinventé.</span>
              </h1>
              <p className="max-w-xl mt-6 text-lg text-muted-foreground">
                Entrez votre numéro de suivi pour voir la localisation de votre colis en temps réel. Simple, rapide et fiable.
              </p>
              <div className="w-full max-w-lg mt-10">
                <Card className="bg-card/80 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
                      <Search className="text-primary"/> Suivre un colis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrackingForm />
                  </CardContent>
                </Card>
              </div>
            </div>
             <div className="relative h-64 md:h-full flex items-center justify-center">
                 <Image
                    src="https://picsum.photos/seed/package3d/600/600"
                    alt="3D illustration of packages"
                    width={600}
                    height={600}
                    className="object-contain animate-pulse-slow"
                    data-ai-hint="3d package illustration"
                    priority
                />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-background md:py-24">
          <div className="container px-4 mx-auto md:px-6">
            <h2 className="mb-16 text-3xl font-bold text-center text-foreground md:text-4xl">
              Une expérience de suivi inégalée
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Fiabilité Maximale"
                description="Nous offrons un suivi précis et des informations vérifiées à chaque étape du parcours de votre colis."
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8" />}
                title="Rapidité en Temps Réel"
                description="Recevez des mises à jour instantanées sur la localisation de votre colis, sans aucun délai."
              />
              <FeatureCard 
                icon={<Star className="w-8 h-8" />}
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
                    <span className="text-xl font-bold text-foreground">Colimove</span>
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
