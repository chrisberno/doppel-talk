"use server";

import { headers } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

interface CreateApiKeyResult {
  success: boolean;
  key?: string; // Raw key - only returned once
  id?: string;
  error?: string;
}

export interface ListApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}

interface ListApiKeysResult {
  success: boolean;
  keys?: ListApiKey[];
  error?: string;
}

function generateApiKey(): string {
  // Generate 16 random bytes and convert to hex (32 chars)
  const randomPart = randomBytes(16).toString("hex");
  return `dk_live_${randomPart}`;
}

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function getKeyPreview(key: string): string {
  // Last 8 characters for preview (after prefix)
  const parts = key.split("_");
  if (parts.length >= 3) {
    const randomPart = parts.slice(2).join("_");
    return `...${randomPart.slice(-8)}`;
  }
  return `...${key.slice(-8)}`;
}

export async function createApiKey(name: string): Promise<CreateApiKeyResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name is required" };
    }

    // Generate key
    const rawKey = generateApiKey();
    const hashedKey = hashKey(rawKey);
    const keyPreview = getKeyPreview(rawKey);

    // Store in database
    const apiKey = await db.apiKey.create({
      data: {
        name: name.trim(),
        key: hashedKey,
        keyPreview,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      key: rawKey, // Return raw key only once
      id: apiKey.id,
    };
  } catch (error) {
    console.error("Error creating API key:", error);
    return { success: false, error: "Failed to create API key" };
  }
}

export async function listApiKeys(): Promise<ListApiKeysResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const apiKeys = await db.apiKey.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPreview: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
      },
    });

    return { success: true, keys: apiKeys };
  } catch (error) {
    console.error("Error listing API keys:", error);
    return { success: false, error: "Failed to list API keys" };
  }
}

export async function deleteApiKey(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the key belongs to the user
    const apiKey = await db.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey || apiKey.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.apiKey.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting API key:", error);
    return { success: false, error: "Failed to delete API key" };
  }
}

