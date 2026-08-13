import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/mijozlar")({
  component: AdminCustomers,
});

type Customer = { id: string; full_name: string | null; phone: string | null; created_at: string };

function AdminCustomers() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [profiles, orders] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total, status"),
      ]);
      if (profiles.error) throw profiles.error;
      const stats = new Map<string, { count: number; sum: number }>();
      for (const o of orders.data ?? []) {
        if (o.status === "bekor_qilindi") continue;
        const cur = stats.get(o.user_id) ?? { count: 0, sum: 0 };
        cur.count += 1;
        cur.sum += Number(o.total);
        stats.set(o.user_id, cur);
      }
      return ((profiles.data ?? []) as Customer[]).map((p) => ({
        ...p,
        orders: stats.get(p.id)?.count ?? 0,
        spent: stats.get(p.id)?.sum ?? 0,
      }));
    },
  });

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Mijozlar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ro'yxatdan o'tgan mijozlar ro'yxati.</p>
      <div className="surface-card mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Buyurtmalar</TableHead>
              <TableHead>Ro'yxatdan o'tgan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Hozircha mijozlar yo'q.
                </TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>{c.orders}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString("uz-UZ")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
