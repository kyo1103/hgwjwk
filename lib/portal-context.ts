import "server-only";

import { redirect } from "next/navigation";
import { getWorkspaceSession } from "@/lib/workspace-auth";
import type { Tenant } from "@/lib/types";
import {
  getPortalAccessSummary,
  getVisiblePortalTabs,
  getVisibleUtilityTabs,
  mapWorkspaceRoleToPortalRole,
  portalRoleLabels,
  type PortalViewerRole,
} from "@/lib/portal-config";

export interface PortalContext {
  session: NonNullable<ReturnType<typeof getWorkspaceSession>>;
  viewerRole: PortalViewerRole;
  viewerRoleLabel: string;
  visibleTabs: ReturnType<typeof getVisiblePortalTabs>;
  visibleUtilityTabs: ReturnType<typeof getVisibleUtilityTabs>;
  access: ReturnType<typeof getPortalAccessSummary>;
}

export function getPortalContext(tenant: Tenant): PortalContext {
  const session = getWorkspaceSession();
  if (!session) {
    redirect("/");
  }

  if (session.scope === "client" && session.tenantSlug && session.tenantSlug !== tenant.slug) {
    redirect("/");
  }

  const viewerRole = mapWorkspaceRoleToPortalRole(session.roleKey);

  return {
    session,
    viewerRole,
    viewerRoleLabel: portalRoleLabels[viewerRole],
    visibleTabs: getVisiblePortalTabs(viewerRole),
    visibleUtilityTabs: getVisibleUtilityTabs(viewerRole),
    access: getPortalAccessSummary(viewerRole),
  };
}
