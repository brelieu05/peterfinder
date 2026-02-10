import { NextRequest, NextResponse } from "next/server";
import { insertItem, fetchItems } from "@/lib/actions/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const islost = searchParams.get("islost");

    const result = await fetchItems("items");

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    let items = result.data || [];

    items = items.filter(
      (item: any) => !item.is_deleted && !item.isresolved
    );

    if (islost !== null) {
      const isLostFilter = islost === "true";
      items = items.filter((item: any) => item.islost === isLostFilter);
    }

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      type,
      location,
      date,
      itemdate,
      email,
      image,
      islost,
      isresolved,
      ishelped,
      is_deleted,
      foundby,
    } = body;

    if (!name || !description || !type || !location || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await insertItem("items", {
      name,
      description,
      type,
      location,
      date,
      itemdate,
      email,
      image: image || "",
      islost,
      isresolved: isresolved ?? false,
      ishelped: ishelped ?? false,
      is_deleted: is_deleted ?? false,
      foundby: foundby ?? null,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
