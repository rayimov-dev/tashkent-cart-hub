CREATE OR REPLACE FUNCTION public.place_order(
  p_full_name text,
  p_phone text,
  p_address text,
  p_note text,
  p_payment text,
  p_zone text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_fee numeric;
  v_threshold numeric;
  v_delivery numeric;
  it jsonb;
  v_product products%ROWTYPE;
  v_qty integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Buyurtma berish uchun tizimga kiring';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Savat bo''sh';
  END IF;
  IF coalesce(btrim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'Telefon raqam majburiy';
  END IF;
  IF coalesce(btrim(p_address), '') = '' THEN
    RAISE EXCEPTION 'Manzil majburiy';
  END IF;

  SELECT delivery_fee, free_delivery_threshold INTO v_fee, v_threshold
  FROM store_settings WHERE id = true;
  v_fee := coalesce(v_fee, 15000);
  v_threshold := coalesce(v_threshold, 50000);

  IF p_zone IS NOT NULL AND btrim(p_zone) <> '' THEN
    SELECT fee INTO v_fee FROM delivery_zones WHERE name = p_zone LIMIT 1;
    v_fee := coalesce(v_fee, 15000);
  END IF;

  INSERT INTO orders (user_id, full_name, phone, address, note, subtotal, delivery_fee, total, payment_method, zone_name)
  VALUES (v_uid, btrim(p_full_name), btrim(p_phone), btrim(p_address), nullif(btrim(coalesce(p_note,'')), ''), 0, 0, 0,
          coalesce(nullif(btrim(coalesce(p_payment,'')), ''), 'naqd'), nullif(btrim(coalesce(p_zone,'')), ''))
  RETURNING id INTO v_order_id;

  FOR it IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := greatest(1, (it->>'quantity')::int);
    SELECT * INTO v_product FROM products WHERE id = (it->>'id')::uuid FOR UPDATE;
    IF NOT FOUND OR NOT v_product.is_active OR v_product.is_archived THEN
      RAISE EXCEPTION 'Mahsulot mavjud emas';
    END IF;
    IF v_product.stock_quantity < v_qty THEN
      RAISE EXCEPTION 'Omborda yetarli emas: % (qoldiq %)', v_product.name, v_product.stock_quantity;
    END IF;

    UPDATE products SET stock_quantity = stock_quantity - v_qty WHERE id = v_product.id;

    INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price, v_qty);

    v_subtotal := v_subtotal + v_product.price * v_qty;
  END LOOP;

  v_delivery := CASE WHEN v_subtotal >= v_threshold THEN 0 ELSE v_fee END;

  UPDATE orders SET subtotal = v_subtotal, delivery_fee = v_delivery, total = v_subtotal + v_delivery
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(text, text, text, text, text, text, jsonb) TO authenticated;