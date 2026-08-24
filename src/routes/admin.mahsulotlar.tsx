import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, productsQuery, type Product } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/admin/mahsulotlar")({
  component: AdminProducts,
});

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  old_price: "",
  stock: "",
  image_url: "",
  category: "Boshqa",
  is_popular: false,
};

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
        old_price: form.old_price ? Number(form.old_price) : null,
        category: form.category,
        is_popular: form.is_popular,
        stock_quantity: Number(form.stock) || 0,
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
      old_price: p.old_price ? String(p.old_price) : "",
      category: p.category,
      is_popular: p.is_popular,
      stock: String(p.stock_quantity ?? 0),
      image_url: p.image_url ?? "",
    });
    setOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Mahsulotlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">Mahsulot qo'shish, tahrirlash, narx va qoldiqni yangilash.</p>
        </div>
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
        <Skeleton className="mt-6 h-40 rounded-2xl" />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(products ?? []).map((p) => (
            <div key={p.id} className="surface-card overflow-hidden">
              <div className="aspect-[4/3] bg-muted">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="size-full object-cover" /> : null}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{p.name}</p>
                  <Badge variant={(p.stock_quantity ?? 0) > 0 ? "secondary" : "outline"}>
                    Qoldiq: {p.stock_quantity ?? 0}
                  </Badge>
                </div>
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
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Label htmlFor="ps">Qoldiq (dona)</Label>
                <Input
                  id="ps"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="po">Eski narx (chegirma uchun)</Label>
                <Input
                  id="po"
                  type="number"
                  min={0}
                  value={form.old_price}
                  onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pc">Kategoriya</Label>
                <select
                  id="pc"
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-primary)]"
                checked={form.is_popular}
                onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
              />
              Mashhur mahsulot sifatida ko'rsatilsin
            </label>
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
