import { redirect } from "next/navigation";
import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export const dynamic = "force-dynamic";

export default function Home() {
  const session = getWorkspaceSession();
  if (!session) {
    redirect("/login");
  }
  return <WorkspaceDashboard session={session} />;
}
