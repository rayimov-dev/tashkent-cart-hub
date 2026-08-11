import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, ShieldCheck, LogOut, User as UserIcon, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const { user } = useSession();
  const { count } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/kirish", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl hero-gradient text-primary-foreground">
            <Store className="size-5" />
          </span>
          Bozorcha
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/">Katalog</Link>
          </Button>
          {user ? (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/buyurtmalarim">Buyurtmalarim</Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link to="/admin">
              <ShieldCheck className="size-4" /> Admin
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="relative">
            <Link to="/savat">
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Savat</span>
              {count > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} title="Chiqish">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/kirish">
                <UserIcon className="size-4" />
                Kirish
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
