import LoginScreen from "@/components/workspace/LoginScreen";
import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";
import type { WorkspaceSession } from "@/lib/workspace-users";

export default function WorkspaceApp({ session }: { session: WorkspaceSession | null }) {
  if (!session) {
    return <LoginScreen />;
  }

  return <WorkspaceDashboard session={session} />;
}
