import { VillaCard } from "@/components/VillaCard";
import { getPublishedVillas } from "@/lib/villa";

export default async function HomePage() {
  const villas = await getPublishedVillas();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-12 text-center sm:text-left">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Find your perfect villa
        </h1>
        <p className="mt-3 max-w-xl text-gray-500">
          Discover premium villas for rent across Azerbaijan — from Baku to the mountains of Quba.
        </p>
      </section>

      {villas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-gray-500">No villas listed yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </div>
      )}
    </div>
  );
}
