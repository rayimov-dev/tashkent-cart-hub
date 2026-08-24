import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { productsQuery, discountPercent } from "@/lib/shop";
import { useCart } from "@/lib/cart";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/mahsulot/$id")({
  head: () => ({
    meta: [
      { title: "Mahsulot — Yangikent Market" },
      { name: "description", content: "Mahsulot tavsifi, narxi va miqdorini tanlab savatga qo'shing." },
      { property: "og:title", content: "Mahsulot — Yangikent Market" },
      { property: "og:description", content: "Yangikent Market mahsuloti: tavsif, narx va tez yetkazib berish." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: products, isLoading } = useQuery(productsQuery());
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  const product = (products ?? []).find((p) => p.id === id);
  const similar = (products ?? []).filter((p) => p.id !== id && p.category === product?.category).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-8">
          <Skeleton className="h-96 rounded-2xl" />
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-2xl font-extrabold">Mahsulot topilmadi</h1>
          <Button asChild className="mt-4">
            <Link to="/katalog" search={{ kategoriya: "", q: "" }}>
              Katalogga qaytish
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const off = discountPercent(product);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <nav className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Bosh sahifa
          </Link>{" "}
          /{" "}
          <Link to="/katalog" search={{ kategoriya: product.category, q: "" }} className="hover:text-foreground">
            {product.category}
          </Link>
        </nav>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="surface-card relative overflow-hidden">
            <div className="aspect-square bg-muted">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="size-full object-cover" />
              ) : null}
            </div>
            {off ? (
              <span className="absolute left-3 top-3 rounded-lg bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
                -{off}%
              </span>
            ) : null}
          </div>

          <div className="surface-card space-y-4 p-6">
            <h1 className="text-2xl font-extrabold">{product.name}</h1>
            <Badge variant="secondary">{product.category}</Badge>

            <div>
              {product.old_price && product.old_price > product.price ? (
                <p className="text-sm text-muted-foreground line-through">{formatSom(product.old_price)}</p>
              ) : null}
              <p className="text-3xl font-extrabold">{formatSom(product.price)}</p>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <p className="text-sm">
              Qoldiq: <b>{product.stock_quantity}</b> dona
            </p>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Miqdor</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-9" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <Button variant="outline" size="icon" className="size-9" onClick={() => setQty((q) => q + 1)}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={() => {
                add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url }, qty);
                toast.success("Savatga qo'shildi", { description: `${product.name} × ${qty}` });
              }}
            >
              <ShoppingCart className="size-5" /> Savatga qo'shish — {formatSom(product.price * qty)}
            </Button>

            <div className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
              <Truck className="mt-0.5 size-4 shrink-0" />
              <span>50 000 so'mdan yuqori buyurtmalarga yetkazib berish bepul.</span>
            </div>
          </div>
        </div>

        {similar.length > 0 ? (
          <section className="pt-10">
            <h2 className="text-xl font-extrabold">O'xshash mahsulotlar</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
