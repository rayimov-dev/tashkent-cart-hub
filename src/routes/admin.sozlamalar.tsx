import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsQuery } from "@/lib/shop";

export const Route = createFileRoute("/admin/sozlamalar")({
  component: AdminSettings,
});

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(settingsQuery());
  const [fee, setFee] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<string | null>(null);

  const feeValue = fee ?? String(settings?.delivery_fee ?? "");
  const thresholdValue = threshold ?? String(settings?.free_delivery_threshold ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("store_settings")
        .update({
          delivery_fee: Number(feeValue) || 0,
          free_delivery_threshold: Number(thresholdValue) || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sozlamalar saqlandi");
      queryClient.invalidateQueries({ queryKey: ["store_settings"] });
    },
    onError: (e: Error) => toast.error("Xatolik", { description: e.message }),
  });

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />;

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Sozlamalar</h1>
      <p className="mt-1 text-sm text-muted-foreground">Yetkazib berish narxi va bepul yetkazish chegarasi.</p>
      <div className="surface-card mt-6 max-w-md space-y-4 p-5">
        <div className="space-y-2">
          <Label htmlFor="df">Yetkazib berish narxi (so'm)</Label>
          <Input id="df" type="number" min={0} value={feeValue} onChange={(e) => setFee(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ft">Bepul yetkazish chegarasi (so'm)</Label>
          <Input id="ft" type="number" min={0} value={thresholdValue} onChange={(e) => setThreshold(e.target.value)} />
        </div>
        <p className="text-sm text-muted-foreground">
          Buyurtma summasi chegaradan oshsa, yetkazib berish avtomatik bepul bo'ladi.
        </p>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Saqlash
        </Button>
      </div>
    </div>
  );
}
