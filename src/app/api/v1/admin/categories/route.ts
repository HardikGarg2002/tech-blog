import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCategory, getAllCategoriesWithCounts } from "@/services/category.service";
import { AppError } from "@/lib/errors";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const categories = await getAllCategoriesWithCounts();
    return NextResponse.json({ data: categories });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const category = await createCategory(body);
    return NextResponse.json({ data: category });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Creation failed" } }, { status: 500 });
  }
});

