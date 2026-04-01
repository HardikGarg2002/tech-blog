import { NextResponse } from "next/server";
import { getAllCategories } from "@/services/category.service";
import { AppError } from "@/lib/errors";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ data: categories });
  } catch (err) {
    if (err instanceof AppError)
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
    return NextResponse.json({ error: { code: "INTERNAL", message: "Server error" } }, { status: 500 });
  }
}
