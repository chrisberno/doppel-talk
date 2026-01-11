"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

interface GenerateSpeechData {
  text: string;
  voice_S3_key?: string; // Required for Chatterbox provider
  language: string;
  exaggeration: number;
  cfg_weight: number;
  provider?: string; // Defaults to 'chatterbox'
  // Metadata fields
  name?: string;
  type?: string; // "ivr", "greeting", "announcement", "promo"
  department?: string; // "sales", "support", "hr", "marketing"
  function?: string; // "on-hold", "voicemail", "menu-prompt"
  tags?: string[];
}

interface GenerateSpeechResult {
  success: boolean;
  s3_key?: string;
  audioUrl?: string;
  projectId?: string;
  error?: string;
}

// Get S3 bucket URL from environment, with fallback for development
function getS3BucketUrl(): string {
  const bucketUrl = env.AWS_S3_BUCKET_URL;
  if (!bucketUrl) {
    console.warn(
      "AWS_S3_BUCKET_URL not set. Using fallback URL. Set AWS_S3_BUCKET_URL in your .env file.",
    );
    // Fallback for development - should be set in production
    return "https://doppel-talk.s3.us-east-1.amazonaws.com";
  }
  return bucketUrl;
}

export async function generateSpeech(
  data: GenerateSpeechData,
): Promise<GenerateSpeechResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    if (!data.text || !data.language) {
      return { success: false, error: "Missing required fields" };
    }
    
    // Validate Chatterbox provider requirements
    const provider = (data.provider || "chatterbox").toLowerCase();
    if (provider !== "chatterbox") {
      return { success: false, error: "Only Chatterbox provider is supported" };
    }
    if (!data.voice_S3_key) {
      return { success: false, error: "Voice S3 key required" };
    }

    const creditsNeeded = Math.max(1, Math.ceil(data.text.length / 100));

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.credits < creditsNeeded) {
      return {
        success: false,
        error: `Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`,
      };
    }

    const response = await fetch(env.MODAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_API_KEY,
        "Modal-Secret": env.MODAL_API_SECRET,
      },
      body: JSON.stringify({
        text: data.text,
        voice_s3_key: data.voice_S3_key,
        language: data.language,
        exaggeration: data.exaggeration ?? 0.5,
        cfg_weight: data.cfg_weight ?? 0.5,
        provider: provider,
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to generate speech" };
    }

    const result = (await response.json()) as { 
      success: boolean;
      s3_Key?: string;
      error?: string;
      code?: string;
    };
    
    // Handle backend error responses
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to generate speech",
      };
    }
    
    if (!result.s3_Key) {
      return {
        success: false,
        error: "No audio file returned from backend",
      };
    }

    const s3BucketUrl = getS3BucketUrl();
    const audioUrl = `${s3BucketUrl}/${result.s3_Key}`;

    await db.user.update({
      where: { id: session.user.id },
      data: { credits: { decrement: creditsNeeded } },
    });

    // Calculate duration if audio metadata available
    // For now, we'll leave it null - can be calculated from audio file later
    const duration = null;

    const audioProject = await db.audioProject.create({
      data: {
        text: data.text,
        audioUrl,
        s3Key: result.s3_Key,
        language: data.language,
        voiceS3Key: data.voice_S3_key || "",
        exaggeration: data.exaggeration,
        cfgWeight: data.cfg_weight,
        userId: session.user.id,
        provider: provider,
        // Metadata fields
        name: data.name || null,
        type: data.type || null,
        department: data.department || null,
        function: data.function || null,
        tags: data.tags || [],
        status: "active", // Default to active
        duration: duration,
      },
    });

    return {
      success: true,
      s3_key: result.s3_Key,
      audioUrl,
      projectId: audioProject.id,
    };
  } catch (error) {
    console.error("Speech generation error:", error);
    return { success: false, error: "Internal server error" };
  }
}

export const getUserAudioProjects = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const audioProjects = await db.audioProject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, audioProjects };
  } catch (error) {
    console.error("Error fetching audio projects:", error);
    return { success: false, error: "Failed to fetch audio projects" };
  }
});

export const getUserCredits = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", credits: 0 };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found", credits: 0 };
    }

    return { success: true, credits: user.credits };
  } catch (error) {
    console.error("Error fetching user credits:", error);
    return { success: false, error: "Failed to fetch credits", credits: 0 };
  }
});

export async function deleteAudioProject(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await db.audioProject.findUnique({
      where: { id },
    });

    if (!project || project.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.audioProject.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting audio project:", error);
    return { success: false, error: "Failed to delete audio project" };
  }
}

export async function updateAudioProject(
  id: string,
  data: {
    name?: string;
    type?: string | null;
    department?: string | null;
    function?: string | null;
    status?: string;
    tags?: string[];
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await db.audioProject.findUnique({
      where: { id },
    });

    if (!project || project.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.audioProject.update({
      where: { id },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating audio project:", error);
    return { success: false, error: "Failed to update audio project" };
  }
}

function generatePublicSlug(): string {
  // Generate a random slug (8 characters)
  return Math.random().toString(36).substring(2, 10);
}

export async function togglePublicSharing(id: string): Promise<{
  success: boolean;
  publicSlug?: string;
  publicUrl?: string;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const project = await db.audioProject.findUnique({
      where: { id },
    });

    if (!project || project.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    // Get base URL from environment or use default
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    let publicSlug = project.publicSlug;
    let publicUrl: string | null = null;

    if (project.isPublic) {
      // Make private
      await db.audioProject.update({
        where: { id },
        data: {
          isPublic: false,
          publicSlug: null,
          publicUrl: null,
        },
      });
      return { success: true };
    } else {
      // Make public - generate slug if needed
      if (!publicSlug) {
        // Ensure unique slug
        let attempts = 0;
        do {
          publicSlug = generatePublicSlug();
          const existing = await db.audioProject.findUnique({
            where: { publicSlug },
          });
          if (!existing) break;
          attempts++;
        } while (attempts < 10);

        if (attempts >= 10) {
          return { success: false, error: "Failed to generate unique slug" };
        }
      }

      publicUrl = `${baseUrl}/public/${publicSlug}`;

      await db.audioProject.update({
        where: { id },
        data: {
          isPublic: true,
          publicSlug,
          publicUrl,
        },
      });

      return { success: true, publicSlug, publicUrl };
    }
  } catch (error) {
    console.error("Error toggling public sharing:", error);
    return { success: false, error: "Failed to toggle public sharing" };
  }
}
