import { TrackingForm } from '@/components/tracking-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PackageCheck, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function Step({ icon, title, description, stepNumber }: { icon: React.ReactNode, title: string, description: string, stepNumber: string }) {
    return (
        <div className="relative flex flex-col items-center text-center p-4">
             <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {stepNumber}
            </div>
            <div className="mb-4 text-primary">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="p-4 sm:p-6 lg:p-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Colimove</h1>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">Atouts</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">Fonctionnement</Link>
          <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400">A propos</Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-16 md:py-24 lg:py-32">
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
        </section>

        <section id="features" className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Nos atouts pour votre tranquilité</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                title="Fiabilité Maximale"
                description="Nous offrons un suivi précis et des informations vérifiées à chaque étape du parcours de votre colis."
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8 text-primary" />}
                title="Rapidité en Temps Réel"
                description="Recevez des mises à jour instantanées sur la localisation de votre colis, sans aucun délai."
              />
              <FeatureCard 
                icon={<PackageCheck className="w-8 h-8 text-primary" />}
                title="Simplicité d'Utilisation"
                description="Une interface claire et intuitive pour suivre votre colis en quelques clics, sans complication."
              />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 lg:py-32">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <Step 
                        stepNumber="1"
                        icon={<Search className="w-10 h-10" />}
                        title="Entrez votre code"
                        description="Saisissez le numéro de suivi de votre colis dans le champ de recherche."
                    />
                    <Step 
                        stepNumber="2"
                        icon={<Zap className="w-10 h-10" />}
                        title="Lancez la recherche"
                        description="Cliquez sur le bouton de recherche pour obtenir les informations en temps réel."
                    />
                    <Step 
                        stepNumber="3"
                        icon={<PackageCheck className="w-10 h-10" />}
                        title="Suivez votre colis"
                        description="Visualisez l'historique complet et le statut actuel de votre livraison."
                    />
                </div>
            </div>
        </section>

        <section id="about" className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">À propos de Colimove</h2>
            <p className="text-muted-foreground md:text-lg">
              Chez Colimove, notre mission est de rendre le suivi de colis plus transparent, simple et accessible pour tous. Nous croyons en la tranquillité d'esprit que procure le fait de savoir exactement où se trouve son colis à tout moment. C'est pourquoi nous avons créé une plateforme puissante et intuitive, conçue pour vous offrir une expérience de suivi inégalée, de l'expédition à la livraison.
            </p>
          </div>
        </section>

      </main>

      <footer className="w-full py-8 px-4 md:px-6 border-t bg-gray-900 text-gray-400">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-white">Colimove</h3>
                <p className="text-sm">Suivi de colis simple et rapide.</p>
            </div>
            <nav className="flex gap-6 items-center">
                <Link href="#features" className="text-sm font-medium hover:text-white">Atouts</Link>
                <Link href="#how-it-works" className="text-sm font-medium hover:text-white">Fonctionnement</Link>
                <Link href="#about" className="text-sm font-medium hover:text-white">A propos</Link>
            </nav>
        </div>
        <div className="mt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Colimove. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
