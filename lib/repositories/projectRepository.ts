/**
 * Project repository – raw data access only.
 * In production: replace with EF Core / Dapper calls against SQL Server.
 */

import type { Project } from "@/lib/domain/types";
import { projectStore, ensureSeeded, generateId } from "@/lib/data/store";

export const ProjectRepository = {
  findAll(): Project[] {
    ensureSeeded();
    return [...projectStore];
  },

  findById(id: string): Project | undefined {
    ensureSeeded();
    return projectStore.find((p) => p.id === id);
  },

  findByProjectNumber(projectNumber: string): Project | undefined {
    ensureSeeded();
    return projectStore.find((p) => p.projectNumber === projectNumber);
  },

  insert(entity: Omit<Project, "id">): Project {
    ensureSeeded();
    const record: Project = { id: generateId("proj"), ...entity };
    projectStore.push(record);
    return record;
  },

  exists(id: string): boolean {
    ensureSeeded();
    return projectStore.some((p) => p.id === id);
  },
};
