import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logActivity({
  user_id,
  action,
  meta,
}: {
  user_id: string;
  action: string;
  meta?: any;
}) {
  await supabase.from("activity_feed").insert({
    user_id,
    action,
    meta,
  });
}