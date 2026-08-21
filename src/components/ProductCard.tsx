import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent, type Product } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const off = discountPercent(product);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-[var(--shadow-lift)]">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
        {off ? (
          <span className="absolute left-2 top-2 rounded-lg bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
            -{off}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
        <div className="mt-auto pt-2">
          {product.old_price && product.old_price > product.price ? (
            <p className="text-xs text-muted-foreground line-through">{formatSom(product.old_price)}</p>
          ) : null}
          <p className="text-base font-extrabold">{formatSom(product.price)}</p>
        </div>
        <Button
          size="sm"
          className="mt-2 w-full rounded-xl"
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
