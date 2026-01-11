import { createHash } from "crypto";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

/**
 * Get user ID from API key or session
 * Returns userId if valid, null if not
 */
export async function getApiUser(request: Request): Promise<string | null> {
  try {
    // First, try API key authentication
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      if (token.startsWith("dk_live_")) {
        const userId = await authenticateApiKey(token);
        if (userId) {
          return userId;
        }
      }
    }

    // Fall back to session authentication
    // Convert Request headers to Headers object for better-auth
    const headersObj = new Headers();
    request.headers.forEach((value, key) => {
      headersObj.set(key, value);
    });

    const session = await auth.api.getSession({
      headers: headersObj,
    });

    if (session?.user?.id) {
      return session.user.id;
    }

    return null;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

async function authenticateApiKey(key: string): Promise<string | null> {
  try {
    const hashedKey = createHash("sha256").update(key).digest("hex");

    const apiKey = await db.apiKey.findUnique({
      where: { key: hashedKey },
      include: { user: true },
    });

    if (!apiKey) {
      return null;
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update lastUsedAt
    await db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch((err) => {
      // Non-critical error, log but don't fail auth
      console.error("Error updating lastUsedAt:", err);
    });

    return apiKey.userId;
  } catch (error) {
    console.error("Error authenticating API key:", error);
    return null;
  }
}

