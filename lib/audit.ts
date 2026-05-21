import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logAction({
  user_id,
  action,
  entity_type,
  entity_id,
  metadata,
}: {
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
}) {
  await supabase.from("audit_logs").insert({
    user_id,
    action,
    entity_type,
    entity_id,
    metadata,
  });
}