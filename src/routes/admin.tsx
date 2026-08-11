import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsAdmin, useSession } from "@/lib/auth";
import { productsQuery, settingsQuery, STATUS_LABELS, type Product } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Bozorcha" },
      { name: "description", content: "Mahsulotlar, buyurtmalar va yetkazib berish sozlamalarini boshqarish." },
      { property: "og:title", content: "Admin panel — Bozorcha" },
      { property: "og:description", content: "Do'kon boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? <Skeleton className="h-64 rounded-2xl" /> : null}
        {!loading && !user ? <AdminLogin /> : null}
        {!loading && user && isAdmin === false ? <NoAccess /> : null}
        {!loading && user && isAdmin === null ? <Skeleton className="h-64 rounded-2xl" /> : null}
        {!loading && user && isAdmin ? <AdminDashboard /> : null}
      </main>
    </div>
  );
}

function NoAccess() {
  return (
    <div className="surface-card mx-auto max-w-md p-10 text-center">
      <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
      <h1 className="mt-4 text-xl font-bold">Ruxsat yo'q</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bu bo'lim faqat administratorlar uchun. Mijoz hisobi bilan admin panelga kirib bo'lmaydi.
      </p>
      <Button asChild className="mt-5">
        <Link to="/">Bosh sahifa</Link>
      </Button>
    </div>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Kirishda xatolik", { description: error.message });
      return;
    }
    toast.success("Admin panelga xush kelibsiz");
  }

  return (
    <div className="surface-card mx-auto max-w-md p-6">
      <h1 className="text-xl font-extrabold">Admin panelga kirish</h1>
      <p className="mt-1 text-sm text-muted-foreground">Administrator login va parolini kiriting.</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ae">Email</Label>
          <Input id="ae" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ap">Parol</Label>
          <Input id="ap" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          Kirish
        </Button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  return (
    <>
      <h1 className="text-2xl font-extrabold">Admin panel</h1>
      <Tabs defaultValue="orders" className="mt-5">
        <TabsList>
          <TabsTrigger value="orders">Buyurtmalar</TabsTrigger>
          <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
          <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-5">
          <AdminOrders />
        </TabsContent>
        <TabsContent value="products" className="mt-5">
          <AdminProducts />
        </TabsContent>
        <TabsContent value="settings" className="mt-5">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </>
  );
}

type OrderStatus = "yangi" | "tayyorlanmoqda" | "yetkazilmoqda" | "yetkazildi";

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
        .select("id, created_at, status, full_name, phone, address, note, delivery_fee, total, order_items(id, product_name, unit_price, quantity)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AdminOrder[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status yangilandi");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error("Xatolik", { description: e.message }),
  });

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />;
  if ((orders ?? []).length === 0)
    return <p className="surface-card p-10 text-center text-muted-foreground">Hozircha buyurtmalar yo'q.</p>;

  return (
    <div className="space-y-4">
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
              <Badge variant={o.status === "yetkazildi" ? "default" : "secondary"}>
                {STATUS_LABELS[o.status] ?? o.status}
              </Badge>
              <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v as OrderStatus })}>
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

          <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            {o.order_items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {it.product_name} × {it.quantity}
                </span>
                <span>{formatSom(Number(it.unit_price) * it.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between gap-3 pt-2 font-bold">
              <span>Jami (yetkazish {Number(o.delivery_fee) === 0 ? "bepul" : formatSom(Number(o.delivery_fee))})</span>
              <span>{formatSom(Number(o.total))}</span>
            </li>
          </ul>
        </article>
      ))}
    </div>
  );
}

const emptyForm = { id: "", name: "", description: "", price: "", image_url: "" };

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery(productsQuery(true));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price) || 0,
        image_url: form.image_url.trim() || null,
      };
      const { error } = form.id
        ? await supabase.from("products").update(payload).eq("id", form.id)
        : await supabase.from("products").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saqlandi");
      setOpen(false);
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error("Xatolik", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("O'chirildi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error("Xatolik", { description: e.message }),
  });

  function edit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      image_url: p.image_url ?? "",
    });
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Mahsulotlar</h2>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Yangi mahsulot
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-40 rounded-2xl" />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(products ?? []).map((p) => (
            <div key={p.id} className="surface-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="size-full object-cover" /> : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="font-semibold">{p.name}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <p className="font-bold">{formatSom(p.price)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => edit(p)}>
                    <Pencil className="size-4" /> Tahrirlash
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(p.id)}>
                    <Trash2 className="size-4" /> O'chirish
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pn">Nomi</Label>
              <Input id="pn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pd">Tavsifi</Label>
              <Textarea
                id="pd"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pp">Narxi (so'm)</Label>
              <Input
                id="pp"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pi">Rasm havolasi (URL)</Label>
              <Input
                id="pi"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={() => save.mutate()} disabled={!form.name.trim() || save.isPending}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
    <div className="surface-card max-w-md space-y-4 p-5">
      <h2 className="font-bold">Yetkazib berish sozlamalari</h2>
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
  );
}
