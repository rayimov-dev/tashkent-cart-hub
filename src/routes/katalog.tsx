import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, productsQuery } from "@/lib/shop";

type CatalogSearch = { kategoriya?: string; q?: string };

export const Route = createFileRoute("/katalog")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    kategoriya: typeof search["kategoriya"] === "string" ? search["kategoriya"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Katalog — Yangikent Market" },
      {
        name: "description",
        content: "Yangikent Market katalogi: oziq-ovqat, ichimliklar, maishiy texnika, go'zallik va bolalar mahsulotlari.",
      },
      { property: "og:title", content: "Mahsulotlar katalogi — Yangikent Market" },
      { property: "og:description", content: "Kategoriyalar bo'yicha mahsulotlarni tanlang va buyurtma bering." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { kategoriya, q } = Route.useSearch();
  const { data: products, isLoading } = useQuery(productsQuery());

  const list = (products ?? []).filter((p) => {
    const byCat = !kategoriya || p.category === kategoriya;
    const byQ = !q || `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase());
    return byCat && byQ;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">
          {kategoriya ?? (q ? `"${q}" bo'yicha natijalar` : "Barcha mahsulotlar")}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/katalog"
            search={{ kategoriya: undefined, q: undefined }}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${!kategoriya ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            Hammasi
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/katalog"
              search={{ kategoriya: c.name, q: undefined }}
              className={`rounded-xl px-3 py-2 text-sm font-medium ${kategoriya === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              <span className="mr-1">{c.emoji}</span>
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
            : list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {!isLoading && list.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Mahsulot topilmadi.</p>
        ) : null}
      </main>
    </div>
  );
}
