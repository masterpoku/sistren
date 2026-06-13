import { getSchoolSettings } from "@/actions/settings";
import { PageShell } from "@/components/ui/page-shell";
import { SchoolSettingsForm } from "@/features/settings/SchoolSettingsForm";
import { verifyRoleLevel } from "@/lib/auth/verify-session";
import { SYSTEM_CONFIG_KEYS } from "@/lib/db/system-config-keys";

export default async function SchoolSettingsPage() {
  await verifyRoleLevel(80);
  const settings = await getSchoolSettings();

  const getSetting = (key: string, fallback = "") =>
    settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <PageShell
      title="Pengaturan Sekolah"
      description="Kelola informasi dasar sekolah."
    >
      <SchoolSettingsForm
        schoolName={getSetting(SYSTEM_CONFIG_KEYS.SCHOOL_NAME)}
        schoolAddress={getSetting(SYSTEM_CONFIG_KEYS.SCHOOL_ADDRESS)}
        headmaster={getSetting(SYSTEM_CONFIG_KEYS.HEADMASTER)}
        npsn={getSetting(SYSTEM_CONFIG_KEYS.NPSN)}
        nss={getSetting(SYSTEM_CONFIG_KEYS.NSS)}
      />
    </PageShell>
  );
}
