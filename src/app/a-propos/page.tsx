
'use client';

import { Button } from '@/components/ui/button';
import { Package, Menu, Users, Globe, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import Image from 'next/image';

const StatCard = ({ icon, value, label }: { icon: React.ReactNode, value: string, label: string }) => (
    <div className="p-6 text-center bg-card rounded-xl shadow-lg border-border/20">
        <div className="mb-3 text-primary flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary">
            {icon}
        </div>
        <p className="text-3xl font-extrabold text-foreground">{value}</p>
        <p className="text-muted-foreground">{label}</p>
    </div>
);

export default function AboutPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', text: 'Accueil' },
        { href: '/nos-services', text: 'Nos Services' },
        { href: '/contact', text: 'Contact' }
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
                <section className="py-16 md:py-24 bg-secondary/20">
                    <div className="container px-4 mx-auto md:px-6 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            Qui sommes-nous ?
                        </h1>
                        <p className="max-w-3xl mx-auto mt-6 text-lg text-muted-foreground">
                            Chez Colimove, nous redéfinissons l'expérience de la logistique. Notre mission est de connecter le monde, un colis à la fois, avec une efficacité et une fiabilité inégalées.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative w-full h-80 md:h-full rounded-xl overflow-hidden shadow-2xl">
                                <Image
                                    src="https://images.unsplash.com/photo-1586528116311-069241513465?q=80&w=2070&auto=format&fit=crop"
                                    alt="Entrepôt logistique Colimove"
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint="warehouse logistics"
                                />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-4">Notre Histoire</h2>
                                <p className="text-muted-foreground mb-4">
                                    Fondée sur le principe que chaque envoi est une promesse, Colimove a été créée pour combler le fossé entre l'expéditeur et le destinataire avec une technologie de pointe et un service client exceptionnel. Nous avons commencé comme une petite startup avec une grande vision : rendre le transport de colis simple, transparent et accessible à tous.
                                </p>
                                <p className="text-muted-foreground">
                                    Aujourd'hui, nous sommes fiers d'être un acteur de confiance dans le secteur de la logistique, servant des milliers de clients, des petites entreprises aux grandes corporations, avec le même dévouement et la même passion qu'à nos débuts.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-16 md:py-24 bg-secondary/20">
                    <div className="container px-4 mx-auto md:px-6">
                        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Colimove en chiffres</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard icon={<Package />} value="1M+" label="Colis livrés" />
                            <StatCard icon={<Users />} value="10k+" label="Clients satisfaits" />
                            <StatCard icon={<Globe />} value="50+" label="Pays desservis" />
                            <StatCard icon={<ShieldCheck />} value="99.9%" label="Taux de livraison à temps" />
                        </div>
                    </div>
                </section>
                
                <section className="py-16 md:py-24">
                     <div className="container px-4 mx-auto md:px-6 text-center">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Prêt à expédier avec nous ?</h2>
                        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                            Rejoignez les milliers de clients qui nous font confiance pour leurs envois.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/contact">Contactez-nous</Link>
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
