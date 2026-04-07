import { NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/projectService";

export async function GET() {
  const projects = ProjectService.listProjects();
  return NextResponse.json(projects);
}
