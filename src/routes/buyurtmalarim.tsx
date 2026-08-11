import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/buyurtmalarim")({
  head: () => ({
    meta: [
      { title: "Buyurtmalarim — Bozorcha" },
      { name: "description", content: "Bergan buyurtmalaringiz tarixi va ularning holatini kuzating." },
      { property: "og:title", content: "Buyurtmalarim — Bozorcha" },
      { property: "og:description", content: "Buyurtmalaringiz holatini real vaqtda kuzating." },
    ],
  }),
  component: MyOrders,
});

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  address: string;
  phone: string;
  order_items: { id: string; product_name: string; unit_price: number; quantity: number }[];
};

function MyOrders() {
  const { user, loading } = useSession();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, status, subtotal, delivery_fee, total, address, phone, order_items(id, product_name, unit_price, quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrderRow[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">Buyurtmalarim</h1>

        {!user && !loading ? (
          <div className="surface-card mt-6 p-10 text-center">
            <p className="text-muted-foreground">Buyurtmalar tarixini ko'rish uchun hisobingizga kiring.</p>
            <Button asChild className="mt-4">
              <Link to="/kirish">Kirish</Link>
            </Button>
          </div>
        ) : null}

        {user && isLoading ? <Skeleton className="mt-6 h-40 rounded-2xl" /> : null}

        {user && !isLoading && (orders ?? []).length === 0 ? (
          <div className="surface-card mt-6 p-10 text-center">
            <p className="text-muted-foreground">Hozircha buyurtmalaringiz yo'q.</p>
            <Button asChild className="mt-4">
              <Link to="/">Xarid qilishni boshlash</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {(orders ?? []).map((o) => (
            <article key={o.id} className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <Badge variant={o.status === "yetkazildi" ? "default" : "secondary"}>
                  {STATUS_LABELS[o.status] ?? o.status}
                </Badge>
              </div>

              <ul className="mt-4 space-y-1 text-sm">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {it.product_name} × {it.quantity}
                    </span>
                    <span>{formatSom(Number(it.unit_price) * it.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yetkazib berish</span>
                  <span>{Number(o.delivery_fee) === 0 ? "Bepul" : formatSom(Number(o.delivery_fee))}</span>
                </div>
                <div className="mt-1 flex justify-between font-bold">
                  <span>Jami</span>
                  <span>{formatSom(Number(o.total))}</span>
                </div>
                <p className="mt-3 text-muted-foreground">
                  {o.address} · {o.phone}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
