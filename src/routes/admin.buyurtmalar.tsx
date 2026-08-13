import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABELS } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/admin/buyurtmalar")({
  component: AdminOrders,
});

type OrderStatus = "yangi" | "tayyorlanmoqda" | "yetkazilmoqda" | "yetkazildi" | "bekor_qilindi";

type AdminOrder = {
  id: string;
  created_at: string;
  status: string;
  full_name: string;
  phone: string;
  address: string;
  note: string | null;
  delivery_fee: number;
  total: number;
  order_items: { id: string; product_name: string; unit_price: number; quantity: number }[];
};

function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<AdminOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, created_at, status, full_name, phone, address, note, delivery_fee, total, order_items(id, product_name, unit_price, quantity)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminOrder[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status yangilandi");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: Error) => toast.error("Xatolik", { description: e.message }),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Buyurtmalar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Kelgan buyurtmalar va ularning holati.</p>

      {isLoading ? (
        <Skeleton className="mt-6 h-40 rounded-2xl" />
      ) : (orders ?? []).length === 0 ? (
        <p className="surface-card mt-6 p-10 text-center text-muted-foreground">Hozircha buyurtmalar yo'q.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {(orders ?? []).map((o) => (
            <article key={o.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString("uz-UZ")}</p>
                  <p className="mt-2 text-sm">
                    <b>{o.full_name}</b> · {o.phone}
                  </p>
                  <p className="text-sm text-muted-foreground">{o.address}</p>
                  {o.note ? <p className="mt-1 text-sm text-muted-foreground">Izoh: {o.note}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={
                      o.status === "yetkazildi" ? "default" : o.status === "bekor_qilindi" ? "outline" : "secondary"
                    }
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                  <Select
                    value={o.status}
                    onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v as OrderStatus })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                {o.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3">
                    <span>
                      {it.product_name} × {it.quantity}
                    </span>
                    <span className="text-muted-foreground">{formatSom(Number(it.unit_price) * it.quantity)}</span>
                  </li>
                ))}
                <li className="flex justify-between gap-3">
                  <span>Yetkazib berish</span>
                  <span className="text-muted-foreground">
                    {Number(o.delivery_fee) === 0 ? "Bepul" : formatSom(Number(o.delivery_fee))}
                  </span>
                </li>
                <li className="flex justify-between gap-3 font-bold">
                  <span>Jami</span>
                  <span>{formatSom(Number(o.total))}</span>
                </li>
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
