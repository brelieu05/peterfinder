import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { item_id, item_name, item_owner_email, item_is_lost } =
    await request.json();

  if (!item_id || !item_name || !item_owner_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (user.email === item_owner_email) {
    return NextResponse.json({ error: "Cannot claim your own item" }, { status: 400 });
  }

  const message = item_is_lost
    ? `${user.email} says they found your lost item: "${item_name}"`
    : `${user.email} is claiming your found item: "${item_name}"`;

  const { error } = await supabase.from("notifications").insert({
    recipient_email: item_owner_email,
    sender_email: user.email,
    item_id,
    item_name,
    message,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
