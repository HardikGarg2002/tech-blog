import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { publishDocItem } from "@/services/projectItem.service";
import { getProjectById } from "@/services/project.service";
import { AppError } from "@/lib/errors";

export const POST = auth(
  async (req, props: { params: Promise<{ id: string; itemId: string }> }) => {
    if (!req.auth) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const { id, itemId } = await props.params;

    try {
      const project = await getProjectById(id);
      await publishDocItem(itemId, project.slug);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof AppError)
        return NextResponse.json({ error: { code: err.code, message: err.message } }, { status: err.status });
      return NextResponse.json({ error: { code: "INTERNAL", message: "Failed to publish item" } }, { status: 500 });
    }
  }
);
