import { NextRequest, NextResponse } from "next/server";
import { insertItem } from "@/lib/actions/database";

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
