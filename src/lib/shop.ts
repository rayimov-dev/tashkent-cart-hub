import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_active: boolean;
  stock_quantity: number;
};

export type StoreSettings = {
  delivery_fee: number;
  free_delivery_threshold: number;
};

export const productsQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: ["products", includeInactive],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, price: Number(p.price), stock_quantity: Number((p as { stock_quantity?: number }).stock_quantity ?? 0) })) as Product[];
    },
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["store_settings"],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("delivery_fee, free_delivery_threshold")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return {
        delivery_fee: Number(data?.delivery_fee ?? 15000),
        free_delivery_threshold: Number(data?.free_delivery_threshold ?? 50000),
      };
    },
  });

export function computeDelivery(subtotal: number, settings: StoreSettings | undefined) {
  const fee = settings?.delivery_fee ?? 15000;
  const threshold = settings?.free_delivery_threshold ?? 50000;
  const free = subtotal >= threshold && subtotal > 0;
  const delivery = free ? 0 : subtotal > 0 ? fee : 0;
  return { free, threshold, delivery, total: subtotal + delivery, remaining: Math.max(0, threshold - subtotal) };
}

export const STATUS_LABELS: Record<string, string> = {
  yangi: "Yangi",
  tayyorlanmoqda: "Tayyorlanmoqda",
  yetkazilmoqda: "Yetkazilmoqda",
  yetkazildi: "Yetkazildi",
  bekor_qilindi: "Bekor qilindi",
};
