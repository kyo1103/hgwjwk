import { redirect } from "next/navigation";

export default function SettingsRedirectPage({ params }: { params: { tenantSlug: string } }) {
  redirect(`/portal/${params.tenantSlug}/company`);
}
