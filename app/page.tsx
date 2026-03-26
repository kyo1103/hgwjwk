import WorkspaceApp from "@/components/workspace/WorkspaceApp";
import { getWorkspaceSession } from "@/lib/workspace-auth";

export const dynamic = "force-dynamic";

export default function Home() {
  const session = getWorkspaceSession();
  return <WorkspaceApp session={session} />;
}
