import { redirect } from "next/navigation";

export default function PortalIndexPage({ params }: { params: { tenantSlug: string } }) {
  redirect(`/portal/${params.tenantSlug}/dashboard`);
}
