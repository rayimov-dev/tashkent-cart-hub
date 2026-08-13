import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Users, Wallet, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [orders, customers, products] = await Promise.all([
        supabase.from("orders").select("total, created_at, status"),
        supabase.from("profiles").select("id"),
        supabase.from("products").select("id"),
      ]);
      if (orders.error) throw orders.error;

      const rows = orders.data ?? [];
      const todaySales = rows
        .filter((o) => new Date(o.created_at) >= startOfDay && o.status !== "bekor_qilindi")
        .reduce((s, o) => s + Number(o.total), 0);

      return {
        orderCount: rows.length,
        newOrders: rows.filter((o) => o.status === "yangi").length,
        todaySales,
        customerCount: customers.data?.length ?? 0,
        productCount: products.data?.length ?? 0,
      };
    },
  });

  if (isLoading || !data) return <Skeleton className="h-40 rounded-2xl" />;

  const cards = [
    { label: "Buyurtmalar", value: String(data.orderCount), hint: `${data.newOrders} ta yangi`, icon: ClipboardList },
    { label: "Bugungi savdo", value: formatSom(data.todaySales), hint: "Bekor qilinganlarsiz", icon: Wallet },
    { label: "Mijozlar", value: String(data.customerCount), hint: "Ro'yxatdan o'tganlar", icon: Users },
    { label: "Mahsulotlar", value: String(data.productCount), hint: "Katalogda", icon: Package },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Do'kon bo'yicha umumiy statistika.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <c.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
