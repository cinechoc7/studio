
'use client';

import { Button } from '@/components/ui/button';
import { Package, Menu, Truck, Zap, ShieldCheck, Globe, Building, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ServiceCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center h-full transition-transform duration-300 transform hover:-translate-y-2 hover:shadow-primary/20">
        <CardHeader>
            <div className="mb-4 text-primary flex items-center justify-center h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary">
                {icon}
            </div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription>{description}</CardDescription>
        </CardContent>
    </Card>
);

export default function ServicesPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', text: 'Accueil' },
        { href: '/a-propos', text: 'À Propos' },
        { href: '/contact', text: 'Contact' }
    ];
    
    const services = [
        {
            icon: <Truck className="w-8 h-8" />,
            title: "Transport National & International",
            description: "Que votre colis doive traverser la ville ou le monde, nous offrons des solutions de transport rapides, fiables et économiques pour toutes les destinations."
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Suivi en Temps Réel",
            description: "Grâce à notre technologie de pointe, suivez votre colis à chaque étape de son voyage, 24/7, avec des mises à jour précises et instantanées."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Sécurité & Assurance",
            description: "Chaque colis est une priorité. Nous garantissons la sécurité de vos envois avec des options d'assurance adaptées pour une tranquillité d'esprit totale."
        },
        {
            icon: <Building className="w-8 h-8" />,
            title: "Solutions E-commerce",
            description: "Intégrez notre API facilement à votre boutique en ligne pour automatiser les expéditions et offrir à vos clients une expérience de suivi transparente."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Gestion des Dédouanements",
            description: "Nos experts simplifient les formalités douanières pour vos envois internationaux, assurant une livraison rapide et sans tracas."
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Support Client Dédié",
            description: "Notre équipe de support est à votre disposition pour répondre à toutes vos questions et vous assister à chaque étape du processus."
        },
    ];

    return (
        <div className="flex flex-col min-h-dvh bg-background text-foreground">
            <header className="sticky top-0 z-20 px-4 py-4 sm:px-6 lg:px-8 bg-card shadow-md">
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
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-16 md:py-24 bg-secondary/20">
                    <div className="container px-4 mx-auto md:px-6 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Nos Services Logistiques
                        </h1>
                        <p className="max-w-3xl mx-auto mt-6 text-lg text-muted-foreground">
                            Des solutions complètes pour le transport et le suivi de vos colis, adaptées à tous vos besoins.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <ServiceCard key={index} {...service} />
                            ))}
                        </div>
                    </div>
                </section>
                
                 <section className="py-16 md:py-24 bg-secondary/20">
                     <div className="container px-4 mx-auto md:px-6 text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Un service sur-mesure pour vous.</h2>
                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                            Vous avez un besoin spécifique ? Notre équipe est prête à élaborer une solution logistique personnalisée pour votre entreprise.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/contact">Demander un devis</Link>
                        </Button>
                    </div>
                </section>
            </main>

            <footer className="w-full px-4 py-8 border-t bg-card md:px-6">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Colimove. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
