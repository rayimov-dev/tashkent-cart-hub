import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, type Product } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = discountPercent(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border-2 border-border bg-card transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]">
      <Link to="/mahsulot/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-110"
          />
        ) : null}
        {off ? (
          <span className="absolute left-2 top-2 rounded-full gradient-sunset px-2.5 py-1 text-xs font-extrabold text-white shadow-[var(--shadow-card)]">
            -{off}%
          </span>
        ) : null}
        {product.is_popular ? (
          <span className="absolute right-2 top-2 rounded-full gradient-berry px-2.5 py-1 text-xs font-extrabold text-white">
            ⭐ Hit
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="w-fit rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-secondary-foreground">
          {product.category}
        </p>
        <Link to="/mahsulot/$id" params={{ id: product.id }}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug hover:text-primary">{product.name}</h3>
        </Link>
        <div className="mt-auto pt-2">
          {product.old_price && product.old_price > product.price ? (
            <p className="text-xs text-muted-foreground line-through">{formatSom(product.old_price)}</p>
          ) : null}
          <p className="text-base font-extrabold text-primary">{formatSom(product.price)}</p>
        </div>

        <Button
          size="sm"
          className="mt-2 w-full rounded-full font-bold"
          onClick={() => {
            add({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
            toast.success("Savatga qo'shildi", { description: product.name });
          }}
        >
          <Plus className="size-4" /> Savatga
        </Button>

      </div>
    </article>
  );
}
