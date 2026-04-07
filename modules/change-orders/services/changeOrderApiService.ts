/**
 * Change order API service – Angular-module-style client for the change orders API.
 * Encapsulates all fetch() calls; UI components call this, not raw fetch.
 * In production: replace fetch with Angular HttpClient or a typed API client.
 */

import type { ChangeOrder, ChangeOrderCreateDto, ChangeOrderUpdateDto } from "@/lib/domain/types";

const BASE = "/api/change-orders";

export const ChangeOrderApiService = {
  async list(projectId?: string): Promise<ChangeOrder[]> {
    const url = projectId ? `${BASE}?projectId=${projectId}` : BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load change orders");
    return res.json();
  },

  async getById(id: string): Promise<ChangeOrder> {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error(`Change order ${id} not found`);
    return res.json();
  },

  async create(dto: ChangeOrderCreateDto & { laborHours: number; materialTotal: number; equipmentTotal: number }): Promise<ChangeOrder> {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Failed to create");
    }
    return res.json();
  },

  async update(id: string, dto: ChangeOrderUpdateDto): Promise<ChangeOrder> {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update change order");
    return res.json();
  },

  async submitForApproval(id: string): Promise<ChangeOrder> {
    const res = await fetch(`${BASE}/${id}/submit`, { method: "POST" });
    if (!res.ok) throw new Error("Submit for approval failed");
    return res.json();
  },
};
