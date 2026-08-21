import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({ login: z.string(), password: z.string() });

/**
 * Admin panel uses a fixed operator account requested by the store owner.
 * The credentials are verified on the server; only an exact match provisions
 * (or repairs) the admin auth user and its admin role.
 */
export const adminSignIn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ data }) => {
    const ADMIN_LOGIN = "yangimarket";
    const ADMIN_PASSWORD = "obidjonmarket";
    const ADMIN_EMAIL = "yangimarket@yangikent.market";

    if (data.login.trim().toLowerCase() !== ADMIN_LOGIN || data.password !== ADMIN_PASSWORD) {
      return { ok: false as const };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let userId: string | null = null;
    const created = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Yangikent Market admin" },
    });

    if (created.data.user) {
      userId = created.data.user.id;
    } else {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users.find((u) => u.email === ADMIN_EMAIL);
      if (!found) throw new Error("Admin hisobini yaratib bo'lmadi");
      userId = found.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
    }

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: userId, role: "admin" as const },
      { onConflict: "user_id,role", ignoreDuplicates: true },
    );

    return { ok: true as const, email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  });
