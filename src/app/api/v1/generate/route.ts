import { NextRequest, NextResponse } from "next/server";
import { getApiUser } from "~/lib/api-auth";
import { db } from "~/server/db";
import { env } from "~/env";

interface GenerateRequest {
  text: string;
  voice_S3_key?: string;
  language: string;
  exaggeration?: number;
  cfg_weight?: number;
  name?: string;
  type?: string;
  department?: string;
  function?: string;
  tags?: string[];
}

// Get S3 bucket URL from environment, with fallback for development
function getS3BucketUrl(): string {
  const bucketUrl = env.AWS_S3_BUCKET_URL;
  if (!bucketUrl) {
    console.warn(
      "AWS_S3_BUCKET_URL not set. Using fallback URL. Set AWS_S3_BUCKET_URL in your .env file.",
    );
    return "https://doppel-talk.s3.us-east-1.amazonaws.com";
  }
  return bucketUrl;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getApiUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as GenerateRequest;

    if (!body.text || !body.language) {
      return NextResponse.json(
        { error: "Missing required fields: text, language" },
        { status: 400 },
      );
    }

    if (!body.voice_S3_key) {
      return NextResponse.json(
        { error: "voice_S3_key is required" },
        { status: 400 },
      );
    }

    const creditsNeeded = Math.max(1, Math.ceil(body.text.length / 100));

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          creditsNeeded,
          creditsAvailable: user.credits,
        },
        { status: 402 },
      );
    }

    // Call Modal API to generate speech
    const response = await fetch(env.MODAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify({
        text: body.text,
        voice_s3_key: body.voice_S3_key,
        language: body.language,
        exaggeration: body.exaggeration ?? 0.5,
        cfg_weight: body.cfg_weight ?? 0.5,
        provider: "chatterbox",
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: 500 },
      );
    }

    const result = (await response.json()) as {
      success: boolean;
      s3_Key?: string;
      error?: string;
    };

    if (!result.success || !result.s3_Key) {
      return NextResponse.json(
        { error: result.error || "Failed to generate speech" },
        { status: 500 },
      );
    }

    const s3BucketUrl = getS3BucketUrl();
    const audioUrl = `${s3BucketUrl}/${result.s3_Key}`;

    // Deduct credits
    await db.user.update({
      where: { id: userId },
      data: { credits: { decrement: creditsNeeded } },
    });

    // Create audio project
    const audioProject = await db.audioProject.create({
      data: {
        text: body.text,
        audioUrl,
        s3Key: result.s3_Key,
        language: body.language,
        voiceS3Key: body.voice_S3_key,
        exaggeration: body.exaggeration ?? 0.5,
        cfgWeight: body.cfg_weight ?? 0.5,
        userId,
        provider: "chatterbox",
        name: body.name || null,
        type: body.type || null,
        department: body.department || null,
        function: body.function || null,
        tags: body.tags || [],
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        id: audioProject.id,
        name: audioProject.name,
        audioUrl: audioProject.audioUrl,
        text: audioProject.text,
        language: audioProject.language,
        createdAt: audioProject.createdAt,
      },
      creditsUsed: creditsNeeded,
      creditsRemaining: user.credits - creditsNeeded,
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

