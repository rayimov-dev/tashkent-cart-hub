import { supabase } from "@/integrations/supabase/client";

const BUCKET = "market";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Uploads an image to the store bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File, folder: "products" | "banners" | "brand"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayllari yuklanadi");
  if (file.size > 10 * 1024 * 1024) throw new Error("Rasm hajmi 10MB dan oshmasin");

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (signError || !data?.signedUrl) throw signError ?? new Error("Rasm havolasi olinmadi");
  return data.signedUrl;
}
