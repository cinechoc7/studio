
'use client';

import { TrackingForm } from '@/components/tracking-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ShieldCheck, Zap, Package, ArrowRight, Star, Plus, Map, Bell, Truck, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

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

const FloatingPackage = () => (
    <svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <path d="M20 50 L100 10 L180 50 L100 90 Z" fill="#FFA726" stroke="#FB8C00" strokeWidth="2"/>
        <path d="M20 50 L20 110 L100 150 L100 90 Z" fill="#FFB74D" stroke="#FB8C00" strokeWidth="2"/>
        <path d="M100 90 L100 150 L180 110 L180 50 Z" fill="#FFE0B2" stroke="#FB8C00" strokeWidth="2"/>
        <path d="M60 70 L140 70 L140 130 L60 130 Z" fill="rgba(255,255,255,0.3)" />
        <text x="100" y="110" fontFamily="sans-serif" fontSize="20" fill="white" textAnchor="middle" fontWeight="bold">C</text>
    </svg>
)

const FloatingEnvelope = () => (
    <svg viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <path d="M10 20 L75 60 L140 20 L10 20 Z" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="2"/>
        <path d="M10 20 L10 80 L140 80 L140 20 L75 60 Z" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="2"/>
        <circle cx="115" cy="35" r="15" fill="#FFA726"/>
    </svg>
)

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/a-propos', text: 'À Propos' },
        { href: '/nos-services', text: 'Nos Services' },
        { href: '/contact', text: 'Contact' }
    ];

    return (
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
            <header className="absolute top-0 left-0 right-0 z-20 px-4 py-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="container mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Package className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-foreground">Colimove</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="text-foreground/80 hover:text-primary transition-colors">
                                {link.text}
                            </Link>
                        ))}
                    </nav>
                    <div className="md:hidden">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Ouvrir le menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-card w-[80vw]">
                                <div className="flex flex-col h-full p-6">
                                    <Link href="/" className="flex items-center gap-2 mb-8">
                                        <Package className="w-8 h-8 text-primary" />
                                        <span className="text-2xl font-bold text-foreground">Colimove</span>
                                    </Link>
                                    <nav className="flex flex-col gap-6 text-lg font-medium">
                                        {navLinks.map(link => (
                                            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-foreground/80 hover:text-primary transition-colors">
                                                {link.text}
                                            </Link>
                                        ))}
                                    </nav>
                                    <Button asChild className="mt-auto">
                                        <Link href="/login">Espace Admin</Link>
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full overflow-hidden bg-gradient-to-b from-background via-background to-secondary/20">
                    <div className="container relative z-10 mx-auto grid min-h-dvh items-center gap-8 px-4 pt-24 pb-16 md:grid-cols-2 md:text-left">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                                Transport & Suivi de Colis.
                                <span className="block bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">Réinventés.</span>
                            </h1>
                            <p className="max-w-xl mt-6 text-lg text-muted-foreground">
                                Confiez-nous vos colis pour un transport sécurisé et suivez leur parcours en temps réel. Simple, rapide et fiable.
                            </p>
                            <div className="w-full max-w-lg mt-10">
                                <Card className="bg-card/80 backdrop-blur-sm border-border/30 shadow-2xl shadow-black/30">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
                                            <Search className="text-primary" /> Suivre un colis
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
                                                <Plus className="h-5 w-5" />
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
                                fill
                                className="object-cover rounded-xl shadow-2xl opacity-20"
                                data-ai-hint="package transit"
                                priority
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative w-full h-full">
                                    <div className="absolute top-8 left-8 w-48 h-32 animate-float-slow">
                                        <FloatingEnvelope />
                                    </div>
                                    <div className="absolute bottom-8 right-8 w-80 h-64 animate-float-fast">
                                        <FloatingPackage />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 bg-secondary/20 md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <h2 className="mb-4 text-3xl font-bold text-center text-foreground md:text-4xl">
                            Une solution logistique complète
                        </h2>
                        <p className="max-w-3xl mx-auto mb-16 text-lg text-center text-muted-foreground">
                            Colimove prend en charge vos colis de l'expédition à la livraison, avec une transparence totale à chaque étape.
                        </p>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <FeatureCard
                                icon={<Truck className="w-8 h-8" />}
                                title="Transport Efficace"
                                description="Nous assurons l'acheminement rapide et sécurisé de vos colis, de la collecte à la destination finale."
                            />
                            <FeatureCard
                                icon={<Zap className="w-8 h-8" />}
                                title="Suivi en Temps Réel"
                                description="Recevez des mises à jour instantanées sur la localisation de votre colis, sans aucun délai."
                            />
                            <FeatureCard
                                icon={<ShieldCheck className="w-8 h-8" />}
                                title="Fiabilité & Sécurité"
                                description="Chaque colis est traité avec le plus grand soin pour garantir une livraison en parfait état."
                            />
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section id="how-it-works" className="py-16 bg-background md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <h2 className="mb-4 text-3xl font-bold text-center text-foreground md:text-4xl">
                            Expédier et suivre, un jeu d'enfant
                        </h2>
                        <p className="max-w-3xl mx-auto mb-16 text-lg text-center text-muted-foreground">
                            Notre processus simplifié vous permet d'expédier et de savoir où est votre colis en un clin d'œil.
                        </p>
                        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
                            {/* Dotted line for desktop */}
                            <div className="absolute top-1/3 left-0 hidden w-full h-px -translate-y-1/2 md:block">
                                <svg width="100%" height="100%"><line x1="0" y1="0" x2="100%" y2="0" strokeWidth="2" stroke="hsl(var(--border))" strokeDasharray="8 8" /></svg>
                            </div>
                            {/* Vertical Dotted line for mobile */}
                            <div className="absolute top-0 left-10 md:hidden h-full w-px -translate-x-1/2">
                                <svg width="100%" height="100%"><line x1="0" y1="0" x2="0" y2="100%" strokeWidth="2" stroke="hsl(var(--border))" strokeDasharray="8 8" /></svg>
                            </div>

                            <div className="relative flex flex-col items-center text-center">
                                <div className="z-10 flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10 border-2 border-primary text-primary">
                                    <Package className="w-10 h-10" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">1. Confiez-nous votre colis</h3>
                                <p className="text-muted-foreground">Enregistrez votre envoi et obtenez instantanément un numéro de suivi unique.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                <div className="z-10 flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10 border-2 border-primary text-primary">
                                    <Map className="w-10 h-10" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">2. Suivez en temps réel</h3>
                                <p className="text-muted-foreground">Visualisez instantanément la localisation actuelle et l'historique de votre colis.</p>
                            </div>
                            <div className="relative flex flex-col items-center text-center">
                                <div className="z-10 flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10 border-2 border-primary text-primary">
                                    <Bell className="w-10 h-10" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold">3. Soyez notifié(e)</h3>
                                <p className="text-muted-foreground">Recevez des mises à jour à chaque étape importante jusqu'à la livraison finale.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-16 bg-secondary/20 md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <h2 className="mb-16 text-3xl font-bold text-center text-foreground md:text-4xl">
                            Ce que nos clients disent de nous
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
                            <p className="mt-2 text-sm text-muted-foreground">Votre partenaire de confiance pour le transport et le suivi de colis.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Navigation</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li><Link href="/a-propos" className="hover:text-primary">À Propos</Link></li>
                                    <li><Link href="/nos-services" className="hover:text-primary">Nos Services</Link></li>
                                    <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Support</h4>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                                    <li><Link href="#" className="hover:text-primary">Conditions d'utilisation</Link></li>
                                    <li><Link href="#" className="hover:text-primary">Politique de confidentialité</Link></li>
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
