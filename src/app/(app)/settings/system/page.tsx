import { getSystemConfigs } from "@/actions/settings";
import { PageShell } from "@/components/ui/page-shell";
import { SystemConfigsClient } from "@/features/settings/SystemConfigsClient";
import { verifyRoleLevel } from "@/lib/auth/verify-session";

export default async function SystemSettingsPage() {
  await verifyRoleLevel(100);
  const configs = await getSystemConfigs();

  return (
    <PageShell
      title="Pengaturan Sistem"
      description="Kelola seluruh konfigurasi key-value sistem. Perubahan akan langsung berlaku."
    >
      <SystemConfigsClient
        configs={configs.map((c) => ({
          id: c.id,
          key: c.key,
          value: c.value,
          description: c.description,
        }))}
      />
    </PageShell>
  );
}
