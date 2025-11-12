import { RouteOptimizer } from "@/components/admin/route-optimizer";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OptimizeRoutePage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Optimiseur de Route IA</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Optimiser une nouvelle route</CardTitle>
                    <CardDescription>
                        Entrez les détails de la livraison pour obtenir une route optimisée par l'IA, en tenant compte du trafic et de la météo en temps réel.
                    </CardDescription>
                </CardHeader>
                <RouteOptimizer />
            </Card>
        </main>
    );
}
