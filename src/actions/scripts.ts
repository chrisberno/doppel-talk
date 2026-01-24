"use server";

import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

export interface ScriptInput {
  name: string;
  content: string;
  type?: string;
  department?: string;
  tags?: string[];
  status?: string;
}

interface ScriptResult {
  success: boolean;
  script?: {
    id: string;
    name: string;
    content: string;
    type: string | null;
    department: string | null;
    tags: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
}

interface ScriptsResult {
  success: boolean;
  scripts: {
    id: string;
    name: string;
    content: string;
    type: string | null;
    department: string | null;
    tags: string[];
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  error?: string;
}

async function getSessionUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
}

export async function createScript(input: ScriptInput): Promise<ScriptResult> {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!input.name.trim()) {
      return { success: false, error: "Script name is required" };
    }

    if (!input.content.trim()) {
      return { success: false, error: "Script content is required" };
    }

    const script = await db.script.create({
      data: {
        name: input.name.trim(),
        content: input.content.trim(),
        type: input.type ?? null,
        department: input.department ?? null,
        tags: input.tags ?? [],
        status: input.status ?? "draft",
        userId: user.id,
      },
    });

    revalidatePath("/dashboard/scripts");
    return { success: true, script };
  } catch (error) {
    console.error("Error creating script:", error);
    return { success: false, error: "Failed to create script" };
  }
}

export async function updateScript(
  id: string,
  input: Partial<ScriptInput>
): Promise<ScriptResult> {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await db.script.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Script not found" };
    }

    const script = await db.script.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.content !== undefined && { content: input.content.trim() }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.department !== undefined && { department: input.department }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    revalidatePath("/dashboard/scripts");
    return { success: true, script };
  } catch (error) {
    console.error("Error updating script:", error);
    return { success: false, error: "Failed to update script" };
  }
}

export async function deleteScript(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const existing = await db.script.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return { success: false, error: "Script not found" };
    }

    await db.script.delete({ where: { id } });

    revalidatePath("/dashboard/scripts");
    return { success: true };
  } catch (error) {
    console.error("Error deleting script:", error);
    return { success: false, error: "Failed to delete script" };
  }
}

export async function getScript(id: string): Promise<ScriptResult> {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const script = await db.script.findFirst({
      where: { id, userId: user.id },
    });

    if (!script) {
      return { success: false, error: "Script not found" };
    }

    return { success: true, script };
  } catch (error) {
    console.error("Error fetching script:", error);
    return { success: false, error: "Failed to fetch script" };
  }
}

export async function getUserScripts(status?: string): Promise<ScriptsResult> {
  try {
    const user = await getSessionUser();
    if (!user?.id) {
      return { success: false, scripts: [], error: "Unauthorized" };
    }

    const scripts = await db.script.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, scripts };
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return { success: false, scripts: [], error: "Failed to fetch scripts" };
  }
}

export async function updateScriptStatus(
  id: string,
  status: "draft" | "production" | "archived"
): Promise<ScriptResult> {
  return updateScript(id, { status });
}
