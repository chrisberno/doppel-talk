"use server";

import { env } from "~/env";

interface RegisterAssetParams {
  url: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

interface RegisterAssetResult {
  success: boolean;
  assetId?: string;
  accessUrl?: string;
  error?: string;
}

/**
 * Register an asset in BeaverDAM for managed distribution.
 * This calls the Directus Files API to import the asset by URL.
 */
export async function registerAssetInBeaverdam(
  params: RegisterAssetParams
): Promise<RegisterAssetResult> {
  try {
    const beaverdamUrl = env.BEAVERDAM_API_URL;
    const beaverdamToken = env.BEAVERDAM_API_TOKEN;

    if (!beaverdamUrl || !beaverdamToken) {
      console.warn("BeaverDAM credentials not configured");
      return {
        success: false,
        error: "BeaverDAM integration not configured",
      };
    }

    // Use Directus Files API to import by URL
    const response = await fetch(`${beaverdamUrl}/files/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${beaverdamToken}`,
      },
      body: JSON.stringify({
        url: params.url,
        data: {
          title: params.title,
          description: params.description || `Published from Doppel.talk`,
          metadata: params.metadata || {},
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("BeaverDAM registration failed:", errorText);
      return {
        success: false,
        error: `BeaverDAM registration failed: ${response.status}`,
      };
    }

    const result = (await response.json()) as { data?: { id?: string } };
    const assetId = result.data?.id;

    if (!assetId) {
      return {
        success: false,
        error: "No asset ID returned from BeaverDAM",
      };
    }

    return {
      success: true,
      assetId,
      accessUrl: `${beaverdamUrl}/assets/${assetId}`,
    };
  } catch (error) {
    console.error("BeaverDAM registration error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Log an access event in BeaverDAM for analytics.
 */
export async function logAccessInBeaverdam(params: {
  assetId: string;
  consumer: string;
  action: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const beaverdamUrl = env.BEAVERDAM_API_URL;
    const beaverdamToken = env.BEAVERDAM_API_TOKEN;

    if (!beaverdamUrl || !beaverdamToken) {
      return { success: false, error: "BeaverDAM not configured" };
    }

    const response = await fetch(`${beaverdamUrl}/items/access_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${beaverdamToken}`,
      },
      body: JSON.stringify({
        asset_id: params.assetId,
        consumer: params.consumer,
        action: params.action,
        metadata: params.metadata || {},
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Log failed: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("BeaverDAM log error:", error);
    return { success: false, error: "Failed to log access" };
  }
}
