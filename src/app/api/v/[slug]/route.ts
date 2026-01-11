import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// Simple in-memory rate limiting store
// In production, use Redis or a proper rate limiting service
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 1000; // 1 second window
  const maxRequests = 10;

  const key = `rate_limit_${ip}`;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    // Clean up old entries periodically
    if (rateLimitStore.size > 1000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetAt) {
          rateLimitStore.delete(k);
        }
      }
    }
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare
  return (
    forwarded?.split(",")[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    "unknown"
  );
}

function shouldResetMonthly(date: Date | null): boolean {
  if (!date) return true;
  const now = new Date();
  const daysSinceReset =
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceReset >= 30;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 },
      );
    }

    const { slug } = await params;

    // 1. Lookup project by publicSlug
    const project = await db.audioProject.findUnique({
      where: { publicSlug: slug },
      include: { user: true },
    });

    // 2. Check isPublic === true
    if (!project || !project.isPublic) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 3. Check and reset monthly limits if needed
    const now = new Date();
    const user = project.user;

    // Reset user monthly plays if needed
    if (shouldResetMonthly(user.monthlyPlaysReset)) {
      await db.user.update({
        where: { id: user.id },
        data: {
          monthlyPlays: 0,
          monthlyPlaysReset: now,
        },
      });
    }

    // Reset project monthly access count if needed
    if (shouldResetMonthly(project.lastAccessReset)) {
      await db.audioProject.update({
        where: { id: project.id },
        data: {
          monthlyAccessCount: 0,
          lastAccessReset: now,
        },
      });
    }

    // Fetch updated user data to check limits (after potential reset)
    const updatedUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        monthlyPlays: true,
        monthlyPlaysLimit: true,
      },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check user's monthly plays limit
    if (updatedUser.monthlyPlays >= updatedUser.monthlyPlaysLimit) {
      return NextResponse.json(
        {
          error: "Monthly play limit reached",
          limit: updatedUser.monthlyPlaysLimit,
          current: updatedUser.monthlyPlays,
        },
        { status: 402 },
      );
    }

    // 4. Increment accessCount on project
    // 5. Increment monthlyPlays on user
    // 6. Update lastAccessed timestamp
    await Promise.all([
      db.audioProject.update({
        where: { id: project.id },
        data: {
          accessCount: { increment: 1 },
          monthlyAccessCount: { increment: 1 },
          lastAccessed: now,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: {
          monthlyPlays: { increment: 1 },
        },
      }),
    ]);

    // 7. Return redirect to audioUrl (S3) with proper headers for Twilio
    // Determine content type from file extension or default to audio/wav
    let contentType = "audio/wav";
    const audioUrl = project.audioUrl.toLowerCase();
    if (audioUrl.endsWith(".mp3") || audioUrl.endsWith(".mpeg")) {
      contentType = "audio/mpeg";
    } else if (audioUrl.endsWith(".wav")) {
      contentType = "audio/wav";
    }

    // Return redirect response with proper headers
    const response = NextResponse.redirect(project.audioUrl, { status: 302 });
    response.headers.set("Content-Type", contentType);
    response.headers.set("Cache-Control", "public, max-age=3600");
    response.headers.set(
      "X-Audio-Slug",
      project.publicSlug || "",
    );

    return response;
  } catch (error) {
    console.error("Error serving audio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

