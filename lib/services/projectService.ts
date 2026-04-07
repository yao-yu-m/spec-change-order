/**
 * ProjectService – project record access.
 * Delegates to ProjectRepository.
 */

import type { Project } from "@/lib/domain/types";
import { ProjectRepository } from "@/lib/repositories/projectRepository";

export const ProjectService = {
  listProjects(): Project[] {
    return ProjectRepository.findAll();
  },

  getProjectById(id: string): Project | undefined {
    return ProjectRepository.findById(id);
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function listProjects(): Project[] {
  return ProjectService.listProjects();
}
export function getProjectById(id: string): Project | undefined {
  return ProjectService.getProjectById(id);
}
