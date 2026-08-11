import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Truck, Clock, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { productsQuery, settingsQuery, computeDelivery } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bozorcha — mahsulotlarni onlayn buyurtma qiling" },
      {
        name: "description",
        content:
          "Yangi mahsulotlarni onlayn tanlang, savatga qo'shing va uyingizgacha yetkazib olish uchun buyurtma bering.",
      },
      { property: "og:title", content: "Bozorcha — onlayn do'kon" },
      { property: "og:description", content: "Mahsulotlar katalogi, tez yetkazib berish va qulay to'lov." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: products, isLoading } = useQuery(productsQuery());
  const { data: settings } = useQuery(settingsQuery());
  const { add, subtotal } = useCart();
  const { threshold, remaining } = computeDelivery(subtotal, settings);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="hero-gradient overflow-hidden rounded-3xl px-6 py-10 text-primary-foreground sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Onlayn do'kon</p>
          <h1 className="mt-3 max-w-xl text-3xl font-extrabold sm:text-5xl">
            Kundalik mahsulotlar — bir necha bosishda uyingizda
          </h1>
          <p className="mt-4 max-w-lg text-base opacity-90">
            {formatSom(threshold)} dan yuqori buyurtmalarga yetkazib berish <b>bepul</b>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="lg">
              <a href="#mahsulotlar">Mahsulotlarni ko'rish</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/40 bg-transparent">
              <Link to="/savat">Savatga o'tish</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Tez yetkazish", text: "Shahar bo'ylab 1-2 soat ichida" },
            { icon: Clock, title: "Har kuni 8:00 - 22:00", text: "Buyurtmani istagan vaqtda bering" },
            { icon: ShieldCheck, title: "Sifat kafolati", text: "Faqat yangi va tekshirilgan mahsulot" },
          ].map((f) => (
            <div key={f.title} className="surface-card flex items-start gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="mahsulotlar" className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Mahsulotlar</h2>
          {subtotal > 0 && remaining > 0 ? (
            <p className="text-sm text-muted-foreground">
              Bepul yetkazishgacha yana <b className="text-foreground">{formatSom(remaining)}</b>
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)
            : (products ?? []).map((p) => (
                <article key={p.id} className="surface-card group overflow-hidden transition hover:shadow-[var(--shadow-lift)]">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-lg font-extrabold">{formatSom(p.price)}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          add({ id: p.id, name: p.name, price: p.price, image_url: p.image_url });
                          toast.success("Savatga qo'shildi", { description: p.name });
                        }}
                      >
                        <Plus className="size-4" /> Savatga
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
        </div>

        {!isLoading && (products ?? []).length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">Hozircha mahsulotlar yo'q.</p>
        ) : null}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bozorcha. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
