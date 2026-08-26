import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  cost_price: number;
  category: string;
  is_popular: boolean;
  image_url: string | null;
  images: string[];
  is_active: boolean;
  is_archived: boolean;
  stock_quantity: number;
  created_at: string;
};

export type StoreSettings = {
  delivery_fee: number;
  free_delivery_threshold: number;
  app_name: string;
  logo_url: string | null;
  hero_title: string;
  hero_subtitle: string;
};

export type Category = { id: string; name: string; emoji: string; sort_order: number };
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
};
export type DeliveryZone = { id: string; name: string; fee: number; sort_order: number };
export type Courier = { id: string; name: string; phone: string; is_active: boolean };
export type Address = {
  id: string;
  label: string;
  address: string;
  phone: string | null;
  zone_name: string | null;
};

export const DEFAULT_CATEGORIES: { name: string; emoji: string }[] = [
  { name: "Oziq-ovqat", emoji: "🥫" },
  { name: "Ichimliklar", emoji: "🥤" },
  { name: "Maishiy texnika", emoji: "🔌" },
  { name: "Go'zallik", emoji: "💄" },
  { name: "Uy-ro'zg'or", emoji: "🧴" },
  { name: "Bolalar uchun", emoji: "🧸" },
  { name: "Boshqa", emoji: "📦" },
];

/** Kept for backwards compatibility with static category lists. */
export const CATEGORIES = DEFAULT_CATEGORIES;

type RawProduct = Record<string, unknown>;

function mapProduct(p: RawProduct): Product {
  return {
    id: String(p["id"]),
    name: String(p["name"] ?? ""),
    description: String(p["description"] ?? ""),
    price: Number(p["price"] ?? 0),
    old_price: p["old_price"] == null ? null : Number(p["old_price"]),
    cost_price: Number(p["cost_price"] ?? 0),
    category: String(p["category"] ?? "Boshqa"),
    is_popular: Boolean(p["is_popular"]),
    image_url: (p["image_url"] as string | null) ?? null,
    images: Array.isArray(p["images"]) ? (p["images"] as string[]) : [],
    is_active: Boolean(p["is_active"]),
    is_archived: Boolean(p["is_archived"]),
    stock_quantity: Number(p["stock_quantity"] ?? 0),
    created_at: String(p["created_at"] ?? ""),
  };
}

export const productsQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: ["products", includeInactive],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!includeInactive) q = q.eq("is_active", true).eq("is_archived", false);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((p) => mapProduct(p as RawProduct));
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, emoji, sort_order")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      const rows = (data ?? []) as Category[];
      if (rows.length > 0) return rows;
      return DEFAULT_CATEGORIES.map((c, i) => ({ id: c.name, name: c.name, emoji: c.emoji, sort_order: i }));
    },
  });

export const bannersQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: ["banners", includeInactive],
    queryFn: async (): Promise<Banner[]> => {
      let q = supabase.from("banners").select("*").order("sort_order");
      if (!includeInactive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Banner[];
    },
  });

export const zonesQuery = () =>
  queryOptions({
    queryKey: ["delivery_zones"],
    queryFn: async (): Promise<DeliveryZone[]> => {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("id, name, fee, sort_order")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []).map((z) => ({ ...z, fee: Number(z.fee) })) as DeliveryZone[];
    },
  });

export const couriersQuery = () =>
  queryOptions({
    queryKey: ["couriers"],
    queryFn: async (): Promise<Courier[]> => {
      const { data, error } = await supabase
        .from("couriers")
        .select("id, name, phone, is_active")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Courier[];
    },
  });

export const addressesQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["addresses", userId ?? "anon"],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Address[]> => {
      const { data, error } = await supabase
        .from("addresses")
        .select("id, label, address, phone, zone_name")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Address[];
    },
  });

export const settingsQuery = () =>
  queryOptions({
    queryKey: ["store_settings"],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("delivery_fee, free_delivery_threshold, app_name, logo_url, hero_title, hero_subtitle")
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return {
        delivery_fee: Number(data?.delivery_fee ?? 15000),
        free_delivery_threshold: Number(data?.free_delivery_threshold ?? 50000),
        app_name: data?.app_name ?? "Yangikent Market",
        logo_url: data?.logo_url ?? null,
        hero_title: data?.hero_title ?? "Yangikent Market — hamma narsa bir joyda!",
        hero_subtitle: data?.hero_subtitle ?? "50 000 so'mdan yuqori buyurtmalarga yetkazib berish bepul",
      };
    },
  });

export function computeDelivery(subtotal: number, settings: StoreSettings | undefined, zoneFee?: number) {
  const fee = zoneFee ?? settings?.delivery_fee ?? 15000;
  const threshold = settings?.free_delivery_threshold ?? 50000;
  const free = subtotal >= threshold && subtotal > 0;
  const delivery = free ? 0 : subtotal > 0 ? fee : 0;
  return { free, threshold, delivery, total: subtotal + delivery, remaining: Math.max(0, threshold - subtotal) };
}

export function discountPercent(p: Pick<Product, "price" | "old_price">) {
  if (!p.old_price || p.old_price <= p.price) return null;
  return Math.round(((p.old_price - p.price) / p.old_price) * 100);
}

export const STATUS_LABELS: Record<string, string> = {
  yangi: "Yangi",
  tayyorlanmoqda: "Tayyorlanmoqda",
  yetkazilmoqda: "Yo'lda",
  yetkazildi: "Yetkazildi",
  bekor_qilindi: "Bekor qilindi",
};

export const SORTS = [
  { value: "yangi", label: "Yangi mahsulotlar" },
  { value: "ommabop", label: "Ommaboplik" },
  { value: "arzon", label: "Narx: arzondan" },
  { value: "qimmat", label: "Narx: qimmatdan" },
] as const;

export type SortKey = (typeof SORTS)[number]["value"];

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case "arzon":
      return arr.sort((a, b) => a.price - b.price);
    case "qimmat":
      return arr.sort((a, b) => b.price - a.price);
    case "ommabop":
      return arr.sort((a, b) => Number(b.is_popular) - Number(a.is_popular) || a.price - b.price);
    default:
      return arr.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }
}
