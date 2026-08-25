import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, LogOut, User as UserIcon, Search, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { CATEGORIES } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const { user } = useSession();
  const { count } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/kirish", replace: true });
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/katalog", search: { q: q.trim(), kategoriya: "" } });
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="h-1.5 w-full hero-gradient" />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-extrabold">
          <span className="flex size-9 items-center justify-center rounded-xl hero-gradient text-primary-foreground">
            Y
          </span>
          <span className="hidden sm:inline">Yangikent Market</span>
        </Link>

        <Button
          variant="secondary"
          size="sm"
          className="hidden shrink-0 rounded-full font-bold lg:inline-flex"
          onClick={() => setOpenCats((v) => !v)}
        >
          <Menu className="size-4" /> Katalog
        </Button>

        <form onSubmit={search} className="relative ml-auto w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Mahsulot qidirish"
            aria-label="Mahsulot qidirish"
            className="rounded-full border-2 pl-9"
          />
        </form>

        <nav className="flex shrink-0 items-center gap-1">
          {user ? (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/buyurtmalarim">Buyurtmalarim</Link>
            </Button>
          ) : null}

          <Button asChild variant="ghost" size="sm" className="relative">
            <Link to="/savat">
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline">Savat</span>
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full gradient-sunset text-[11px] font-extrabold text-white">
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
            <Button asChild size="sm" className="rounded-full font-bold">
              <Link to="/kirish">
                <UserIcon className="size-4" />
                <span className="hidden sm:inline">Kirish</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>

      {openCats ? (
        <div className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-3">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.name}
                to="/katalog"
                search={{ kategoriya: c.name, q: "" }}
                onClick={() => setOpenCats(false)}
                className={`rounded-full px-3 py-2 text-sm font-bold text-white transition hover:opacity-90 ${["gradient-candy","gradient-sunset","gradient-ocean","gradient-lime","gradient-berry","gradient-sun"][i % 6]}`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
