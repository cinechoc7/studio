'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // No auth logic, just redirect
    router.push('/admin');
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
          <CardDescription>Cliquez sur le bouton pour accéder au tableau de bord.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" />
              Accéder au Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
