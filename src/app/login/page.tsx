'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@colimove.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    try {
        await initiateEmailSignIn(auth, email, password);
        toast({
            title: 'Connexion réussie',
            description: 'Redirection vers le tableau de bord...',
        });
        router.push('/admin');
    } catch (err: any) {
        let errorMessage = "Une erreur inconnue est survenue.";
        switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = "Email ou mot de passe incorrect.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Le format de l'email est invalide.";
                break;
            default:
                errorMessage = "Impossible de se connecter. Veuillez réessayer.";
                break;
        }
        setError(errorMessage);
    } finally {
        setIsPending(false);
    }
  };
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
       <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Package className="w-6 h-6 text-primary"/>
                <span className="text-xl font-bold">Colimove</span>
            </Link>
        </div>
      <Card className="w-full max-w-sm shadow-2xl border-t-4 border-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground">Espace Administrateur</CardTitle>
          <CardDescription>Connectez-vous pour accéder au tableau de bord.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
             {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur de connexion</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@colimove.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={isPending}>
              <LogIn className="mr-2 h-4 w-4" />
              {isPending ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
