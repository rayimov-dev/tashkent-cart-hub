ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'bekor_qilindi';

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0;

CREATE POLICY "admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));