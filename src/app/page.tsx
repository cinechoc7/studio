

import { TrackingForm } from '@/components/tracking-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ShieldCheck, Zap, Package, ArrowRight, Star, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

function TestimonialCard({ name, avatar, text, rating }: { name: string, avatar: string, text: string, rating: number }) {
    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/30 p-6">
            <CardContent className="p-0">
                <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-foreground">{name}</p>
                        <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-current' : ''}`} />
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-muted-foreground italic">"{text}"</p>
            </CardContent>
        </Card>
    );
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
          </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-background via-indigo-950 to-background">
          <div className="container relative z-10 mx-auto grid min-h-dvh items-center gap-8 px-4 pt-24 pb-16 md:grid-cols-2 md:text-left">
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
                <div className="flex items-center mt-6 gap-4">
                  <div className="flex -space-x-4 rtl:space-x-reverse">
                      <Avatar className="w-10 h-10 border-2 border-background">
                          <AvatarImage src="https://i.pravatar.cc/150?u=a" alt="User A" />
                          <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                       <Avatar className="w-10 h-10 border-2 border-background">
                          <AvatarImage src="https://i.pravatar.cc/150?u=b" alt="User B" />
                          <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                       <Avatar className="w-10 h-10 border-2 border-background">
                          <AvatarImage src="https://i.pravatar.cc/150?u=c" alt="User C" />
                          <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                      <Avatar className="w-10 h-10 border-2 border-background bg-muted text-muted-foreground flex items-center justify-center">
                         <AvatarFallback className="bg-transparent">
                            <Plus className="h-5 w-5"/>
                         </AvatarFallback>
                      </Avatar>
                  </div>
                  <div className="text-sm text-muted-foreground">
                      <div className="flex text-primary">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 fill-current`} />
                          ))}
                      </div>
                       <p>Rejoignez des milliers d'utilisateurs satisfaits.</p>
                  </div>
                </div>
              </div>
            </div>
             <div className="relative h-64 md:h-full md:flex items-center justify-center hidden">
                 <Image
                    src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHwlMjBDT0xJU3xlbnwwfHx8fDE3NjI5NjgxODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Person holding a package"
                    width={600}
                    height={600}
                    className="object-cover rounded-xl shadow-2xl"
                    data-ai-hint="package transit"
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
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-secondary/20 md:py-24">
            <div className="container px-4 mx-auto md:px-6">
                <h2 className="mb-16 text-3xl font-bold text-center text-foreground md:text-4xl">
                    Ce que nos utilisateurs disent de nous
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <TestimonialCard
                        name="Sophie L."
                        avatar="https://i.pravatar.cc/150?u=sophie"
                        rating={5}
                        text="Enfin une application de suivi qui est à la fois belle et fonctionnelle. Je sais toujours exactement où est mon colis. C'est très rassurant !"
                    />
                    <TestimonialCard
                        name="Marc D."
                        avatar="https://i.pravatar.cc/150?u=marc"
                        rating={5}
                        text="Le suivi en temps réel est incroyablement précis. L'interface est super intuitive, même pour quelqu'un qui n'est pas très à l'aise avec la technologie."
                    />
                    <TestimonialCard
                        name="Julien B."
                        avatar="https://i.pravatar.cc/150?u=julien"
                        rating={5}
                        text="Colimove a changé ma façon de gérer mes livraisons professionnelles. C'est devenu un outil indispensable pour mon e-commerce. Bravo à l'équipe !"
                    />
                </div>
            </div>
        </section>

      </main>

      <footer className="w-full px-4 py-8 border-t bg-card md:px-6">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="mb-4 md:mb-0">
                     <Link href="/" className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold text-foreground">Colimove</span>
                    </Link>
                    <p className="mt-2 text-sm text-muted-foreground">Suivi de colis simple, rapide et fiable pour tous vos besoins.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Navigation</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Accueil</Link></li>
                            <li><Link href="#features" className="hover:text-primary">Fonctionnalités</Link></li>
                            <li><Link href="#testimonials" className="hover:text-primary">Témoignages</Link></li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground mb-2">Légal</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Conditions d'utilisation</Link></li>
                            <li><Link href="#" className="hover:text-primary">Politique de confidentialité</Link></li>
                             <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="text-sm text-muted-foreground md:text-right">
                    &copy; {new Date().getFullYear()} Colimove. Tous droits réservés.
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
