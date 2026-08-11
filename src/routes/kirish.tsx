import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/kirish")({
  head: () => ({
    meta: [
      { title: "Kirish va ro'yxatdan o'tish — Bozorcha" },
      { name: "description", content: "Bozorcha onlayn do'koniga kiring yoki yangi mijoz hisobini yarating." },
      { property: "og:title", content: "Kirish — Bozorcha" },
      { property: "og:description", content: "Mijoz hisobingizga kiring va buyurtma bering." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Kirishda xatolik", { description: error.message });
    toast.success("Xush kelibsiz!");
    navigate({ to: "/" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) return toast.error("Ro'yxatdan o'tishda xatolik", { description: error.message });
    if (!data.session) {
      toast.success("Emailingizni tasdiqlang", { description: "Pochtangizga tasdiqlash havolasi yuborildi." });
      return;
    }
    toast.success("Hisob yaratildi!");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 py-12">
        <h1 className="text-center text-2xl font-extrabold">Mijoz kabineti</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Buyurtma berish uchun hisobingizga kiring.
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
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Parol</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Kirish
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="royxat">
              <form onSubmit={signUp} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ism familiya</Label>
                  <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    placeholder="+998 90 123 45 67"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Parol</Label>
                  <Input
                    id="password2"
                    type="password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Ro'yxatdan o'tish
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Admin hisobiga kirasizmi?{" "}
          <Link to="/admin" className="font-semibold text-primary underline-offset-4 hover:underline">
            Admin panel
          </Link>
        </p>
      </main>
    </div>
  );
}
