import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "~/lib/api-auth";
import { db } from "~/server/db";

export async function GET(request: NextRequest) {
  try {
    const userId = await getApiUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        credits: true,
        monthlyPlays: true,
        monthlyPlaysLimit: true,
        monthlyPlaysReset: true,
        publicAssetsLimit: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const publicProjectsCount = await db.audioProject.count({
      where: {
        userId,
        isPublic: true,
      },
    });

    return NextResponse.json({
      credits: user.credits,
      monthlyPlays: user.monthlyPlays,
      monthlyPlaysLimit: user.monthlyPlaysLimit,
      monthlyPlaysRemaining:
        user.monthlyPlaysLimit - user.monthlyPlays,
      monthlyPlaysReset: user.monthlyPlaysReset,
      publicAssets: publicProjectsCount,
      publicAssetsLimit: user.publicAssetsLimit,
    });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

