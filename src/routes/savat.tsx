import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, Trash2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/auth";
import { computeDelivery, settingsQuery } from "@/lib/shop";
import { formatSom } from "@/lib/format";

export const Route = createFileRoute("/savat")({
  head: () => ({
    meta: [
      { title: "Savat va buyurtma berish — Yangikent Market" },
      {
        name: "description",
        content: "Savatingizni tekshiring, manzil va telefon kiriting hamda buyurtmani rasmiylashtiring.",
      },
      { property: "og:title", content: "Savat — Yangikent Market" },
      { property: "og:description", content: "Buyurtmangizni rasmiylashtiring va yetkazib berishni tanlang." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQuantity, remove, subtotal, clear } = useCart();
  const { data: settings } = useQuery(settingsQuery());
  const { free, delivery, total, remaining, threshold } = computeDelivery(subtotal, settings);
  const { user } = useSession();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setFullName((v) => v || data.full_name!);
        if (data?.phone) setPhone((v) => v || data.phone!);
      });
  }, [user]);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/kirish" });
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || null,
        subtotal,
        delivery_fee: delivery,
        total,
      })
      .select("id")
      .single();

    if (error || !order) {
      setSubmitting(false);
      toast.error("Buyurtma yuborilmadi", { description: error?.message });
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
      })),
    );
    setSubmitting(false);

    if (itemsError) {
      toast.error("Mahsulotlarni saqlashda xatolik", { description: itemsError.message });
      return;
    }

    clear();
    toast.success("Buyurtmangiz qabul qilindi!");
    navigate({ to: "/buyurtmalarim" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-extrabold">Savat</h1>

        {items.length === 0 ? (
          <div className="surface-card mt-6 p-10 text-center">
            <p className="text-muted-foreground">Savatingiz bo'sh.</p>
            <Button asChild className="mt-4">
              <Link to="/">Katalogga o'tish</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.id} className="surface-card flex items-center gap-3 p-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {i.image_url ? <img src={i.image_url} alt={i.name} className="size-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    <p className="text-sm text-muted-foreground">{formatSom(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-8" onClick={() => setQuantity(i.id, i.quantity - 1)}>
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{i.quantity}</span>
                      <Button variant="outline" size="icon" className="size-8" onClick={() => setQuantity(i.id, i.quantity + 1)}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold">{formatSom(i.price * i.quantity)}</span>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => remove(i.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="surface-card p-5">
                <h2 className="font-bold">Hisob-kitob</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahsulotlar</span>
                    <span className="font-semibold">{formatSom(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Yetkazib berish</span>
                    <span className="font-semibold">{free ? "Bepul" : formatSom(delivery)}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-base">
                    <span className="font-bold">Jami</span>
                    <span className="font-extrabold">{formatSom(total)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-secondary p-3 text-sm text-secondary-foreground">
                  <Truck className="mt-0.5 size-4 shrink-0" />
                  {free ? (
                    <span>Tabriklaymiz! Yetkazib berish bepul.</span>
                  ) : (
                    <span>
                      {formatSom(threshold)} dan yuqori buyurtmaga yetkazib berish bepul. Yana{" "}
                      <b>{formatSom(remaining)}</b> qo'shing.
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={submitOrder} className="surface-card space-y-4 p-5">
                <h2 className="font-bold">Yetkazib berish ma'lumotlari</h2>
                <div className="space-y-2">
                  <Label htmlFor="fn">Ism familiya</Label>
                  <Input id="fn" required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph">Telefon raqam</Label>
                  <Input
                    id="ph"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad">Yetkazib berish manzili</Label>
                  <Textarea
                    id="ad"
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    maxLength={300}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nt">Izoh (ixtiyoriy)</Label>
                  <Textarea id="nt" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
                </div>

                {user ? (
                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    Buyurtma berish — {formatSom(total)}
                  </Button>
                ) : (
                  <Button asChild className="w-full" size="lg">
                    <Link to="/kirish">Buyurtma berish uchun kiring</Link>
                  </Button>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
