import { PackageTable } from "@/components/admin/package-table";
import { getPackages } from "@/lib/data";

export default async function AdminDashboard() {
    const packages = await getPackages();

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard des Colis</h1>
            </div>
            <PackageTable packages={packages} />
        </main>
    );
}