
'use client';

import { Button } from '@/components/ui/button';
import { Package, Menu, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


export default function ContactPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { toast } = useToast();

    const navLinks = [
        { href: '/', text: 'Accueil' },
        { href: '/a-propos', text: 'À Propos' },
        { href: '/nos-services', text: 'Nos Services' },
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast({
            title: "Message envoyé !",
            description: "Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.",
        });
        (e.target as HTMLFormElement).reset();
    };

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
                            Contactez-nous
                        </h1>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
                            Une question ? Une demande de devis ? Notre équipe est à votre écoute.
                        </p>
                    </div>
                </section>

                <section className="py-16 md:py-24">
                    <div className="container px-4 mx-auto md:px-6">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-6">Nos coordonnées</h2>
                                <div className="space-y-6 text-lg">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Adresse</h3>
                                            <p className="text-muted-foreground">123 Avenue de la Logistique, 75000 Paris, France</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Mail className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Email</h3>
                                            <a href="mailto:contact@colimove.com" className="text-primary hover:underline">contact@colimove.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Phone className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold">Téléphone</h3>
                                            <p className="text-muted-foreground">+33 1 23 45 67 89</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-6">Envoyez-nous un message</h2>
                                <Card>
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Votre nom</Label>
                                                <Input id="name" placeholder="John Doe" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Votre email</Label>
                                                <Input id="email" type="email" placeholder="john.doe@example.com" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Sujet</Label>
                                                <Input id="subject" placeholder="Demande d'information" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Votre message</Label>
                                                <Textarea id="message" placeholder="Écrivez votre message ici..." required rows={5}/>
                                            </div>
                                            <Button type="submit" className="w-full" size="lg">Envoyer le message</Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
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
