import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, Percent, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES, productsQuery, settingsQuery, computeDelivery, discountPercent } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Yangikent Market — onlayn bozor va tez yetkazib berish" },
      {
        name: "description",
        content:
          "Yangikent Market: oziq-ovqat, ichimliklar, texnika va go'zallik mahsulotlari. 50 000 so'mdan yuqori buyurtmalarga yetkazib berish bepul.",
      },
      { property: "og:title", content: "Yangikent Market — onlayn bozor" },
      { property: "og:description", content: "Chegirmalar, mashhur mahsulotlar va tez yetkazib berish." },
    ],
  }),
  component: Index,
});

const CATEGORY_BG = [
  "gradient-candy",
  "gradient-sunset",
  "gradient-ocean",
  "gradient-lime",
  "gradient-berry",
  "gradient-sun",
  "gradient-ocean",
];

function Index() {
  const { data: products, isLoading } = useQuery(productsQuery());
  const { data: settings } = useQuery(settingsQuery());
  const { subtotal } = useCart();
  const { threshold, remaining } = computeDelivery(subtotal, settings);

  const all = products ?? [];
  const popular = all.filter((p) => p.is_popular).slice(0, 8);
  const discounted = all.filter((p) => discountPercent(p)).slice(0, 8);

  return (
    <div className="min-h-screen app-bg">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="relative overflow-hidden rounded-[2rem] hero-gradient px-6 py-10 text-white shadow-[var(--shadow-lift)] sm:px-10 sm:py-14">
          <span className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/20 blur-2xl" />
          <span className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-brand-yellow/40 blur-2xl" />
          <p className="inline-block rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold uppercase tracking-widest">Chegirmalar haftaligi 🎉</p>
          <h1 className="mt-3 max-w-xl text-3xl font-extrabold sm:text-5xl">
            Yangikent Market — 50% gacha chegirmalar
          </h1>
          <p className="mt-4 max-w-lg text-base opacity-90">
            {formatSom(threshold)} dan yuqori buyurtmalarga yetkazib berish <b>bepul</b>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-xl">
              <Link to="/katalog" search={{ kategoriya: "", q: "" }}>
                Xaridni boshlash
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl border-primary-foreground/40 bg-transparent">
              <Link to="/savat">Savat</Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Bepul yetkazish", text: `${formatSom(threshold)} dan yuqori buyurtmalarga`, bg: "gradient-lime" },
            { icon: Percent, title: "Har kuni chegirma", text: "Tanlangan mahsulotlarga -30% gacha", bg: "gradient-sunset" },
            { icon: Clock, title: "1-2 soatda", text: "Shahar bo'ylab tezkor yetkazish", bg: "gradient-ocean" },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 rounded-3xl border-2 border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-white ${f.bg}`}>
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="font-extrabold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <h2 className="text-2xl font-extrabold">🛍️ Kategoriyalar</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.name}
              to="/katalog"
              search={{ kategoriya: c.name, q: "" }}
              className={`flex items-center gap-3 rounded-3xl p-4 text-white shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${CATEGORY_BG[i % CATEGORY_BG.length]}`}
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/25 text-2xl">{c.emoji}</span>
              <span className="text-sm font-extrabold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {discounted.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold">🔥 Chegirmadagi mahsulotlar</h2>
            <Link to="/katalog" search={{ kategoriya: "", q: "" }} className="rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
              Hammasi
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {discounted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-extrabold">⭐ Mashhur mahsulotlar</h2>
          {subtotal > 0 && remaining > 0 ? (
            <p className="text-sm text-muted-foreground">
              Bepul yetkazishgacha yana <b className="text-foreground">{formatSom(remaining)}</b>
            </p>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
            : (popular.length > 0 ? popular : all.slice(0, 8)).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Yangikent Market. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
