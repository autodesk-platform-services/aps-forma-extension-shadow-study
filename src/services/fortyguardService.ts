import {
  FortyGuardEnvParamsResult,
  FortyGuardHeatmapResult,
  SiteThermalData,
} from "./types";
import { generateProceduralMockData } from "./mockData";

const CACHE_PREFIX = "fortyguard_cache_";
const MODE_STORAGE_KEY = "fortyguard_mode";

export type OperationMode = "mock" | "live";

export class FortyGuardService {
  /**
   * Get active operation mode (defaults to "mock" for zero-credit safety)
   */
  static getMode(): OperationMode {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return saved === "live" ? "live" : "mock";
  }

  /**
   * Set active operation mode
   */
  static setMode(mode: OperationMode): void {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  }

  /**
   * Retrieve cached thermal data for project and date
   */
  static getCachedData(projectId: string, date: string): SiteThermalData | null {
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${projectId}_${date}`);
      if (!raw) return null;
      const data = JSON.parse(raw) as SiteThermalData;
      data.source = "cache";
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Save thermal data to local cache
   */
  static setCachedData(data: SiteThermalData): void {
    try {
      localStorage.setItem(
        `${CACHE_PREFIX}${data.projectId}_${data.date}`,
        JSON.stringify(data),
      );
    } catch (e) {
      console.warn("Unable to save FortyGuard cache to localStorage:", e);
    }
  }

  /**
   * Clear cache for a project
   */
  static clearProjectCache(projectId: string): void {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(`${CACHE_PREFIX}${projectId}`)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Helper to submit task and poll FortyGuard API
   */
  private static async submitAndPoll(
    endpoint: string,
    payload: Record<string, unknown>,
    maxTimeoutMs: number = 90000,
  ): Promise<unknown> {
    // 1. Submit task
    const submitResp = await fetch(`/api/fortyguard${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!submitResp.ok) {
      const errorText = await submitResp.text();
      throw new Error(`FortyGuard API ${endpoint} failed (${submitResp.status}): ${errorText}`);
    }

    const submitJson = await submitResp.json();
    const activityId = submitJson?.data?.activity_id;
    if (!activityId) {
      // If already returns result directly
      return submitJson?.data?.result || submitJson?.data;
    }

    // 2. Poll until complete
    const startTime = Date.now();
    while (Date.now() - startTime < maxTimeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const statusResp = await fetch(`/api/fortyguard/v1/status/${activityId}`);
      if (statusResp.status === 404) {
        continue; // Eventual consistency
      }
      if (!statusResp.ok) {
        throw new Error(`Status check failed: ${statusResp.statusText}`);
      }

      const statusJson = await statusResp.json();
      const status = String(statusJson?.data?.status || "").toLowerCase();

      if (status === "completed" || status === "succeeded") {
        return statusJson?.data?.result || statusJson?.data;
      }
      if (status === "failed" || status === "error") {
        throw new Error(`Activity ${activityId} failed: ${statusJson?.data?.message || "Error"}`);
      }
    }

    throw new Error(`Activity ${activityId} timed out after ${maxTimeoutMs / 1000}s`);
  }

  /**
   * Fetch site thermal intelligence (Heatmap + Env Params)
   */
  static async fetchThermalData(options: {
    projectId: string;
    lat: number;
    lng: number;
    bbox?: { minX: number; minY: number; maxX: number; maxY: number };
    date?: string;
    forceRefresh?: boolean;
    overrideMode?: OperationMode;
  }): Promise<{ data: SiteThermalData; notice?: string }> {
    const {
      projectId,
      lat,
      lng,
      bbox,
      date = new Date().toISOString().split("T")[0],
      forceRefresh = false,
      overrideMode,
    } = options;

    const mode = overrideMode || this.getMode();

    // 1. Check local cache first
    if (!forceRefresh) {
      const cached = this.getCachedData(projectId, date);
      if (cached) {
        return { data: cached, notice: "Loaded instantly from local cache (0 API calls)" };
      }
    }

    // 2. If in Mock / Demo mode, return procedural mock data
    if (mode === "mock") {
      const mockData = generateProceduralMockData(projectId, lat, lng, bbox);
      this.setCachedData(mockData);
      return {
        data: mockData,
        notice: "Demo / Mock Mode active (zero FortyGuard credits used)",
      };
    }

    // 3. Live API mode
    try {
      // Build Polygon GeoJSON from BBox
      const minX = bbox?.minX ?? -250;
      const maxX = bbox?.maxX ?? 250;
      const minY = bbox?.minY ?? -250;
      const maxY = bbox?.maxY ?? 250;

      const metersPerDegLat = 111320;
      const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);

      const lng0 = lng + minX / metersPerDegLng;
      const lng1 = lng + maxX / metersPerDegLng;
      const lat0 = lat + minY / metersPerDegLat;
      const lat1 = lat + maxY / metersPerDegLat;

      const polygon_aoi = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [lng0, lat0],
                  [lng1, lat0],
                  [lng1, lat1],
                  [lng0, lat1],
                  [lng0, lat0],
                ],
              ],
            },
          },
        ],
      };

      // Submit Heatmap and Env Params
      const [heatmapResult, envParamsResult] = await Promise.all([
        this.submitAndPoll("/v1/heatmap", {
          polygon_aoi,
          date_time: { start_date: date, filter_type: 3 }, // single day
          granularity: 60,
          analytic_type: "tcm",
        }) as Promise<FortyGuardHeatmapResult>,
        this.submitAndPoll("/v1/env_params", {
          latitude: lat,
          longitude: lng,
          temperature: 30.0,
          date_time: { start_date: date, filter_type: 3 },
        }) as Promise<FortyGuardEnvParamsResult>,
      ]);

      const liveData: SiteThermalData = {
        projectId,
        projectName: "Forma Active Site",
        location: { lat, lng },
        bbox,
        date,
        source: "live",
        heatmap: heatmapResult,
        envParams: envParamsResult,
        fetchedAt: Date.now(),
      };

      this.setCachedData(liveData);
      return { data: liveData, notice: "Live FortyGuard data successfully fetched & cached" };
    } catch (err) {
      console.error("Live FortyGuard fetch failed, falling back to mock mode:", err);
      const fallbackMock = generateProceduralMockData(projectId, lat, lng, bbox);
      return {
        data: fallbackMock,
        notice: `Live API call failed (${err instanceof Error ? err.message : "Error"}). Loaded mock data fallback.`,
      };
    }
  }
}
