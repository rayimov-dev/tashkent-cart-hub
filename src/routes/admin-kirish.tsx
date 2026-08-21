import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminSignIn } from "@/lib/admin-auth.functions";
import { useIsAdmin, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin-kirish")({
  head: () => ({
    meta: [
      { title: "Admin kirish — Yangikent Market" },
      { name: "description", content: "Yangikent Market admin paneliga login va parol bilan kirish." },
      { property: "og:title", content: "Admin kirish — Yangikent Market" },
      { property: "og:description", content: "Administratorlar uchun alohida kirish sahifasi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const { user } = useSession();
  const isAdmin = useIsAdmin(user);
  const navigate = useNavigate();
  const signInFn = useServerFn(adminSignIn);

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [user, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      const res = await signInFn({ data: { login: login.trim(), password } });
      if (!res.ok) {
        toast.error("Login yoki parol noto'g'ri");
        return;
      }
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: res.email,
        password: res.password,
      });
      if (error) {
        toast.error("Kirishda xatolik", { description: error.message });
        return;
      }
      toast.success("Admin panelga xush kelibsiz");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error("Kirishda xatolik", { description: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="surface-card w-full max-w-md p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl hero-gradient text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold">Admin panel</h1>
            <p className="text-sm text-muted-foreground">Yangikent Market boshqaruvi</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="al">Login</Label>
            <Input id="al" required autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap">Parol</Label>
            <Input
              id="ap"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            Kirish
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Mijozmisiz?{" "}
          <Link to="/kirish" className="font-semibold text-primary underline-offset-4 hover:underline">
            Mijozlar kirishi
          </Link>
        </p>
      </div>
    </div>
  );
}
