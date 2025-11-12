

import { TrackingForm } from '@/components/tracking-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ShieldCheck, Zap, Package, ArrowRight, Star, Plus, Forward } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Dhl, Fedex, Ups, LaPoste, Chronopost, Colissimo } from '@/components/carrier-logos';

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
        <Card className="bg-card/80 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/30 p-6 h-full">
            <CardContent className="p-0 flex flex-col h-full">
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
                <p className="text-muted-foreground italic flex-1">"{text}"</p>
            </CardContent>
        </Card>
    );
}

const testimonials = [
    {
        name: "Sophie L.",
        avatar: "https://i.pravatar.cc/150?u=sophie",
        rating: 5,
        text: "Enfin une application de suivi qui est à la fois belle et fonctionnelle. Je sais toujours exactement où est mon colis. C'est très rassurant !"
    },
    {
        name: "Marc D.",
        avatar: "https://i.pravatar.cc/150?u=marc",
        rating: 5,
        text: "Le suivi en temps réel est incroyablement précis. L'interface est super intuitive, même pour quelqu'un qui n'est pas très à l'aise avec la technologie."
    },
    {
        name: "Julien B.",
        avatar: "https://i.pravatar.cc/150?u=julien",
        rating: 5,
        text: "Colimove a changé ma façon de gérer mes livraisons professionnelles. C'est devenu un outil indispensable pour mon e-commerce. Bravo à l'équipe !"
    },
    {
        name: "Laura M.",
        avatar: "https://i.pravatar.cc/150?u=laura",
        rating: 5,
        text: "Service client au top ! J'avais une question sur mon colis et j'ai eu une réponse en moins de 5 minutes. Je recommande vivement !"
    },
    {
        name: "Alexandre P.",
        avatar: "https://i.pravatar.cc/150?u=alexandre",
        rating: 4,
        text: "Très bonne application, fait ce qu'elle promet. Juste un petit bémol sur l'estimation de l'heure d'arrivée qui est parfois un peu large, mais sinon c'est parfait."
    },
    {
        name: "Chloé T.",
        avatar: "https://i.pravatar.cc/150?u=chloe",
        rating: 5,
        text: "J'adore le design ! C'est tellement plus agréable que les sites de suivi habituels. Suivre un colis devient presque une expérience amusante."
    },
    {
        name: "Thomas R.",
        avatar: "https://i.pravatar.cc/150?u=thomas",
        rating: 5,
        text: "En tant que gestionnaire de stock, j'utilise Colimove tous les jours. La fiabilité est incroyable. Je ne pourrais plus m'en passer."
    },
     {
        name: "Émilie G.",
        avatar: "https://i.pravatar.cc/150?u=emilie",
        rating: 5,
        text: "L'application mobile est géniale. Je reçois les notifications en temps réel et je n'ai plus besoin de vérifier mes mails constamment. Un vrai gain de temps."
    },
    {
        name: "David C.",
        avatar: "https://i.pravatar.cc/150?u=david",
        rating: 5,
        text: "Le meilleur site de suivi de colis, et de loin. Simple, efficace, et pas de publicités envahissantes. C'est exactement ce que je cherchais."
    }
];

const partners = [
    { name: 'DHL', logo: <Dhl className="h-8 md:h-10 w-auto" /> },
    { name: 'FedEx', logo: <Fedex className="h-8 md:h-10 w-auto" /> },
    { name: 'UPS', logo: <Ups className="h-8 md:h-10 w-auto" /> },
    { name: 'La Poste', logo: <LaPoste className="h-8 md:h-10 w-auto" /> },
    { name: 'Chronopost', logo: <Chronopost className="h-8 md:h-10 w-auto" /> },
    { name: 'Colissimo', logo: <Colissimo className="h-8 md:h-10 w-auto" /> },
    { name: 'DHL', logo: <Dhl className="h-8 md:h-10 w-auto" /> },
    { name: 'FedEx', logo: <Fedex className="h-8 md:h-10 w-auto" /> },
    { name: 'UPS', logo: <Ups className="h-8 md:h-10 w-auto" /> },
    { name: 'La Poste', logo: <LaPoste className="h-8 md:h-10 w-auto" /> },
    { name: 'Chronopost', logo: <Chronopost className="h-8 md:h-10 w-auto" /> },
    { name: 'Colissimo', logo: <Colissimo className="h-8 md:h-10 w-auto" /> },
];

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

        {/* Partners Section */}
        <section id="partners" className="py-16 bg-secondary/20 md:py-24">
            <div className="container px-4 mx-auto md:px-6">
                <h2 className="mb-12 text-2xl font-bold text-center text-foreground md:text-3xl">Nos partenaires de confiance</h2>
                <div className="relative overflow-hidden">
                    <div className="flex animate-scroll group-hover:animation-pause">
                       {partners.map((partner, index) => (
                         <div key={index} className="flex-shrink-0 mx-6 w-36 flex justify-center items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                           {partner.logo}
                         </div>
                       ))}
                    </div>
                </div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-background md:py-24">
            <div className="container px-4 mx-auto md:px-6">
                <h2 className="mb-16 text-3xl font-bold text-center text-foreground md:text-4xl">
                    Ce que nos utilisateurs disent de nous
                </h2>
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <TestimonialCard {...testimonial} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 fill-black" />
                    <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 fill-black" />
                </Carousel>
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
