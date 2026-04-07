/**
 * Project API service – Angular-module-style client for projects API.
 */

import type { Project } from "@/lib/domain/types";

export const ProjectApiService = {
  async list(): Promise<Project[]> {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to load projects");
    return res.json();
  },

  async getById(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error(`Project ${id} not found`);
    return res.json();
  },
};
