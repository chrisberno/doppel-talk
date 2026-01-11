import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "~/lib/api-auth";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const userId = await getApiUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.audioProject.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        text: true,
        audioUrl: true,
        language: true,
        tags: true,
        type: true,
        department: true,
        function: true,
        status: true,
        isPublic: true,
        publicSlug: true,
        publicUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

