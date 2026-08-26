import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { phoneToEmail, normalizePhone } from "@/lib/phone";
import logo from "@/assets/logo-yk.png";

export const Route = createFileRoute("/kirish")({
  head: () => ({
    meta: [
      { title: "Telefon orqali kirish — Yangikent Market" },
      { name: "description", content: "Telefon raqamingiz bilan Yangikent Market hisobingizga kiring yoki ro'yxatdan o'ting." },
      { property: "og:title", content: "Kirish — Yangikent Market" },
      { property: "og:description", content: "Telefon raqam bilan tezkor kirish va buyurtma berish." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    const digits = normalizePhone(phone);
    if (digits.length < 9) return toast.error("Telefon raqam noto'g'ri");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: phoneToEmail(digits), password });
    setLoading(false);
    if (error) return toast.error("Kirishda xatolik", { description: "Raqam yoki parol noto'g'ri" });
    toast.success("Xush kelibsiz!");
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    const digits = normalizePhone(phone);
    if (digits.length < 9) return toast.error("Telefon raqam noto'g'ri");
    if (password.length < 6) return toast.error("Parol kamida 6 ta belgidan iborat bo'lsin");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: phoneToEmail(digits),
      password,
      options: { data: { full_name: fullName.trim(), phone: `+${digits}` } },
    });
    if (error) {
      setLoading(false);
      return toast.error("Ro'yxatdan o'tishda xatolik", { description: error.message });
    }
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName.trim(), phone: `+${digits}` });
    }
    setLoading(false);
    toast.success("Hisob yaratildi!");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <img src={logo} alt="Yangikent Market logotipi" className="mx-auto size-20 rounded-full" />
        <h1 className="mt-4 text-center text-2xl font-extrabold">Mijoz kabineti</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Telefon raqamingiz bilan tez va xavfsiz kiring.
        </p>

        <div className="surface-card mt-6 p-5">
          <Tabs defaultValue="kirish">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kirish">Kirish</TabsTrigger>
              <TabsTrigger value="royxat">Ro'yxatdan o'tish</TabsTrigger>
            </TabsList>

            <TabsContent value="kirish">
              <form onSubmit={signIn} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ph">Telefon raqam</Label>
                  <Input id="ph" inputMode="tel" placeholder="+998 90 123 45 67" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw">Parol</Label>
                  <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full rounded-full font-bold" disabled={loading}>
                  Kirish
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="royxat">
              <form onSubmit={signUp} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nm">Ism familiya</Label>
                  <Input id="nm" required maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph2">Telefon raqam</Label>
                  <Input id="ph2" inputMode="tel" placeholder="+998 90 123 45 67" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw2">Parol</Label>
                  <Input id="pw2" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full rounded-full font-bold" disabled={loading}>
                  Ro'yxatdan o'tish
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Administrator hisobi{" "}
          <Link to="/admin-kirish" className="font-semibold text-primary underline-offset-4 hover:underline">
            alohida kirish sahifasida
          </Link>
        </p>
      </main>
    </div>
  );
}
