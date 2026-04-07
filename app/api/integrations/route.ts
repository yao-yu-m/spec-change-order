import { NextResponse } from "next/server";
import { IntegrationService } from "@/lib/services/integrationService";

export async function GET() {
  const connections = IntegrationService.listConnections();
  return NextResponse.json(connections);
}
