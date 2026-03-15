import { NextResponse } from "next/server";
import { getUser } from "@/lib/actions/auth";
import { fetchItems } from "@/lib/actions/database";

/**
 * Returns the distinct item types (categories) the current user has reported as lost.
 * Used for implicit user model: rank items in the same category higher.
 */
export async function GET() {
  try {
    const user = await getUser();
    if (!user?.email) {
      return NextResponse.json({ types: [] }, { status: 200 });
    }

    const result = await fetchItems("items", {
      email: user.email,
      islost: true,
      includeResolved: false,
    });

    if (result.error || !result.data) {
      return NextResponse.json({ types: [] }, { status: 200 });
    }

    const types = [
      ...new Set(
        (result.data as { type: string }[])
          .map((item) => item.type)
          .filter(Boolean)
      ),
    ];

    return NextResponse.json({ types }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/my-lost-item-types:", error);
    return NextResponse.json({ types: [] }, { status: 200 });
  }
}
