import { useEffect } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Store,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Bozorcha" },
      { name: "description", content: "Mahsulotlar, buyurtmalar, mijozlar va yetkazib berish sozlamalari boshqaruvi." },
      { property: "og:title", content: "Admin panel — Bozorcha" },
      { property: "og:description", content: "Bozorcha do'koni boshqaruv paneli." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: "/admin" | "/admin/mahsulotlar" | "/admin/buyurtmalar" | "/admin/mijozlar" | "/admin/sozlamalar"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/mahsulotlar", label: "Mahsulotlar", icon: Package },
  { to: "/admin/buyurtmalar", label: "Buyurtmalar", icon: ClipboardList },
  { to: "/admin/mijozlar", label: "Mijozlar", icon: Users },
  { to: "/admin/sozlamalar", label: "Sozlamalar", icon: Settings },
];

function AdminLayout() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin-kirish", replace: true });
  }, [loading, user, navigate]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin-kirish", replace: true });
  }

  if (loading || !user || isAdmin === null) {
    return (
      <div className="min-h-screen bg-muted/40 p-6">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <div className="surface-card max-w-md p-10 text-center">
          <ShieldAlert className="mx-auto size-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Ruxsat yo'q</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Bu bo'lim faqat administratorlar uchun. Mijoz hisobi bilan admin panelga kirib bo'lmaydi.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild variant="outline">
              <Link to="/">Do'kon</Link>
            </Button>
            <Button onClick={signOut}>Boshqa hisob bilan kirish</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b border-border bg-background md:min-h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4 font-extrabold">
          <span className="flex size-8 items-center justify-center rounded-lg hero-gradient text-primary-foreground">
            <Store className="size-4" />
          </span>
          Bozorcha admin
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:overflow-visible">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-2 pb-4 md:mt-4">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="size-4" /> Chiqish
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
