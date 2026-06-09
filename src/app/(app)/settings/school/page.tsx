import { getSchoolSettings } from "@/actions/settings";
import { SchoolSettingsForm } from "@/features/settings/SchoolSettingsForm";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SchoolSettingsPage() {
  await verifyRoleLevel(80);
  const settings = await getSchoolSettings();

  const getSetting = (key: string, fallback = "") =>
    settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Pengaturan Sekolah
        </h1>
        <p className="text-muted-foreground">Kelola informasi dasar sekolah.</p>
      </div>

      <SchoolSettingsForm
        schoolName={getSetting("school_name")}
        schoolAddress={getSetting("school_address")}
        headmaster={getSetting("headmaster")}
        npsn={getSetting("npsn")}
        nss={getSetting("nss")}
      />
    </div>
  );
}
