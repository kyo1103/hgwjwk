import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/data";
import { PortalShell } from "@/components/PortalShell";
import { EventSelector } from "@/components/EventSelector";

export default async function OnboardingPage({ params }: { params: { tenantSlug: string } }) {
    const tenant = getTenantBySlug(params.tenantSlug);
    if (!tenant) return notFound();

    return (
        <PortalShell tenant={tenant} active="onboarding">
            <div>
                <EventSelector tenantSlug={params.tenantSlug} />
            </div>
        </PortalShell>
    );
}
