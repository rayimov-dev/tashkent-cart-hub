import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin-kirish")({
  head: () => ({
    meta: [
      { title: "Admin kirish — Bozorcha" },
      { name: "description", content: "Bozorcha admin paneliga administrator login va paroli bilan kirish." },
      { property: "og:title", content: "Admin kirish — Bozorcha" },
      { property: "og:description", content: "Administratorlar uchun alohida kirish sahifasi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const { user } = useSession();
  const isAdmin = useIsAdmin(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin", replace: true });
  }, [user, isAdmin, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setPending(false);
      toast.error("Kirishda xatolik", { description: error?.message });
      return;
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setPending(false);
    if (!role) {
      await supabase.auth.signOut();
      toast.error("Bu hisob administrator emas", {
        description: "Mijoz hisobi bilan admin panelga kirib bo'lmaydi.",
      });
      return;
    }
    toast.success("Admin panelga xush kelibsiz");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="surface-card w-full max-w-md p-6">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl hero-gradient text-primary-foreground">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold">Admin panel</h1>
            <p className="text-sm text-muted-foreground">Administrator hisobi bilan kiring</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ae">Email</Label>
            <Input id="ae" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ap">Parol</Label>
            <Input id="ap" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
